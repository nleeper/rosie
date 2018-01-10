'use strict'

const _ = require('underscore')
const P = require('bluebird')
const Uuid = require('uuid4')
const SonosDiscovery = require('sonos-discovery')
const Errors = require('../../errors')
const Logger = require('../../lib/logger')

class Sonos {
  constructor (options) {
    this._initialized = false

    this._timeout = options.TIMEOUT || 2500

    this._discovery = new SonosDiscovery()
  }

  initialize () {
    return new P((resolve, reject) => {
      setTimeout(function () {
        if (this._discovery.players.length === 0) {
          return reject('No Sonos speakers were discovered, try increasing timeout')
        }

        resolve()
        Logger.info(`Sonos system discovered: ${Object.keys(this._discovery.players).length} speakers found`)
      }.bind(this), this._timeout)
    })
  }

  getSpeakers () {
    return P.resolve(this._discovery.players.map(this._simplifyPlayer))
  }

  getSpeakerByName (name) {
    return this._getPlayer(name)
      .then(this._simplifyPlayer)
  }

  setVolume (name, level) {
    return this._getPlayer(name)
      .then(player => player.coordinator.setVolume(level))
  }

  next (name) {
    return this._getPlayer(name)
      .then(player => player.coordinator.nextTrack())
  }

  pause (name) {
    return this._getPlayer(name)
      .then(player => player.coordinator.pause())
  }

  play (name) {
    return this._getPlayer(name)
      .then(player => player.coordinator.play())
  }

  playSpotify (name, spotifyUri) {
    return this._getPlayer(name)
      .then(player => {
        if (!spotifyUri.startsWith('spotify:')) return false

        const encodedSpotifyUri = encodeURIComponent(spotifyUri)
        const sid = player.system.getServiceId('Spotify')

        // Check if current uri is either a track or a playlist/album
        let uri = ''
        if (spotifyUri.startsWith('spotify:track:')) {
          uri = `x-sonos-spotify:${encodedSpotifyUri}?sid=${sid}&flags=32&sn=1`
        } else {
          uri = `x-rincon-cpcontainer:0006206c${encodedSpotifyUri}`
        }

        let metadata = this._getSpotifyMetadata(encodedSpotifyUri, player.system.getServiceType('Spotify'))

        let nextTrackNo = player.coordinator.state.trackNo + 1

        let playPromise = P.resolve()
        if (player.coordinator.avTransportUri.startsWith('x-rincon-queue') === false) {
          playPromise = playPromise.then(() => player.coordinator.setAVTransport(`x-rincon-queue:${player.coordinator.uuid}#0`))
        }

        return playPromise.then(() => {
          return player.coordinator.addURIToQueue(uri, metadata, true, nextTrackNo)
            .then(addToQueueStatus => player.coordinator.trackSeek(addToQueueStatus.firsttracknumberenqueued))
            .then(() => player.coordinator.play())
        })
      })
  }

  _getPlayer (name) {
    return new P((resolve, reject) => {
      let player = this._discovery.getPlayer(name)
      if (player === undefined) return reject(new Errors.NotFoundError(`The speaker ${name} could not be found`))

      resolve(player)
    })
  }

  _simplifyPlayer (player) {
    return {
      id: player.uuid,
      state: player.state,
      playMode: player.currentPlayMode,
      name: player.roomName,
      coordinator: player.coordinator.uuid,
      groupState: player.groupState
    }
  }

  _getSpotifyMetadata (uri, serviceType) {
    return `<DIDL-Lite xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/"
          xmlns:r="urn:schemas-rinconnetworks-com:metadata-1-0/" xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/">
          <item id="00030020${uri}" restricted="true"><upnp:class>object.item.audioItem.musicTrack</upnp:class>
          <desc id="cdudn" nameSpace="urn:schemas-rinconnetworks-com:metadata-1-0/">SA_RINCON${serviceType}_X_#Svc${serviceType}-0-Token</desc></item></DIDL-Lite>`
  }
}

exports.create = (options) => {
  return new Sonos(options)
}
