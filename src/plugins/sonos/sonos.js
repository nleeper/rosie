'use strict'

const _ = require('underscore')
const P = require('bluebird')
const Uuid = require('uuid4')
const SonosLib = require('sonos')
const Spotify = require('./spotify')
const Logger = require('../../lib/logger')

class Sonos {
  constructor (options) {
    this._initialized = false
    this._speakers = {}

    this._timeout = options.TIMEOUT || 2500
    this._excludedSpeakers = options.EXCLUDED_SPEAKERS || ['BRIDGE']
    this._spotify = Spotify.create(options.SPOTIFY)
  }

  initialize () {
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
            if (!this._excludedSpeakers.includes(name.toUpperCase())) {
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
      }, this._timeout)
    })
  }

  getSpeakers () {
    return P.resolve(this._speakers)
  }

  getSpeakerByName (name) {
    return new P((resolve, reject) => {
      let speaker = _.find(this._speakers, x => x.name.toLowerCase() === name.toLowerCase())
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
          if (data.artists.total > 0) {
            let match = data.artists.items[0]
            return P.promisify(speaker.device.playSpotifyRadio, { context: speaker.device })(match.id, match.name)
          } else {
            return P.reject(new Error(`The artist ${artistName} could not be found`))
          }
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

exports.create = (options) => {
  return new Sonos(options)
}
