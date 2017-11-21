'use strict'

const _ = require('underscore')
const P = require('bluebird')
const Uuid = require('uuid4')
const SonosLib = require('sonos')
const Spotify = require('./spotify')
const Logger = require('./logger')
const Config = require('./config')

class Sonos {
  constructor () {
    this._initialized = false
    this._speakers = {}
    this._spotify = Spotify.create(Config.SPOTIFY)
  }

  initialize (options) {
    let timeout = options.TIMEOUT || 2500
    let excludedSpeakers = options.EXCLUDED_SPEAKERS || [ 'BRIDGE' ]

    return new P((resolve, reject) => {
      let search = SonosLib.search()
      search.on('DeviceAvailable', (device, model) => {
        device.getZoneAttrs((err, attrs) => {
          if (err) {
            reject(err)
            return
          }

          device.deviceDescription((err, desc) => {
            if (err) {
              reject(err)
              return
            }

            let name = attrs.CurrentZoneName
            if (!excludedSpeakers.includes(name.toUpperCase())) {
              let id = desc.UDN.split(':')[1]
              this._speakers[id] = { id, device, model, name }
            }
          })
        })
      })

      let self = this
      setTimeout(function () {
        resolve()
        Logger.info(`Sonos system discovered: ${Object.keys(self._speakers).length} speakers found`)
      }, timeout)
    })
  }

  getSpeakers () {
    return P.resolve(this._speakers)
  }

  getSpeakerByName (name) {
    return new P((resolve, reject) => {
      let speaker = _.find(this._speakers, x => x.name === name)
      if (speaker === undefined) return reject(new Error(`The speaker ${name} could not be found`))

      resolve(speaker)
    })
  }

  stop (speakerId) {
    return this._getSpeakerById(speakerId)
      .then(speaker => {
        return P.promisify(speaker.device.stop, { context: speaker.device })()
      })
  }

  pause (speakerId) {
    return this._getSpeakerById(speakerId)
      .then(speaker => {
        return P.promisify(speaker.device.pause, { context: speaker.device })()
      })
  }

  play (speakerId) {
    return this.playUri(speakerId, undefined)
  }

  playUri (speakerId, uri) {
    return this._getSpeakerById(speakerId)
      .then(speaker => {
        return P.promisify(speaker.device.play, { context: speaker.device })(uri)
      })
  }

  playArtist (speakerId, artistName) {
    return this._getSpeakerById(speakerId)
      .then(speaker => {
        return this._spotify.searchArtist(artistName)
        .then(data => {
          let match = data.artists.items[0]
          return P.promisify(speaker.device.playSpotifyRadio, { context: speaker.device })(match.id, match.name)
        })
      })
  }

  _getSpeakerById (speakerId) {
    return new P((resolve, reject) => {
      let speaker = this._speakers[speakerId]
      if (speaker) {
        resolve(speaker)
      } else {
        reject(new Error(`The speaker ${speakerId} could not be found`))
      }
    })
  }
}

module.exports = new Sonos()
