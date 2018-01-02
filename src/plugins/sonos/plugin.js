'use strict'

const P = require('bluebird')
const Sonos = require('./sonos')

class SonosPlugin {
  constructor () {
    this.name = 'sonos'
    this.description = 'Plugin to control Sonos players'

    this._supportedActionMap = {
      'speakers': this._getAllSpeakers.bind(this),
      'play': this._playSpeaker.bind(this),
      'pause': this._pauseSpeaker.bind(this),
      'play_spotify': this._playSpotify.bind(this),
      'next': this._nextTrack.bind(this)
    }
  }

  actionSupported (action) {
    return action in this._supportedActionMap
  }

  initialize (config) {
    this._sonos = Sonos.create(config.SONOS)
    return this._sonos.initialize()
  }

  handle (action, params) {
    if (this.actionSupported(action)) {
      return this._supportedActionMap[action](params)
    } else {
      throw new Error(`Action ${action} is not supported by ${this.name} plugin`)
    }
  }

  _nextTrack (params) {
    return this._sonos.next(params['speaker'])
      .then(this._validateResponse)
      .catch(this._handleError)
  }

  _getAllSpeakers (params) {
    return this._sonos.getSpeakers()
      .then(speakers => ({ success: true, speakers, error: null }))
  }

  _playSpeaker (params) {
    return this._sonos.play(params['speaker'])
      .then(this._validateResponse)
      .catch(this._handleError)
  }

  _pauseSpeaker (params) {
    return this._sonos.pause(params['speaker'])
      .then(this._validateResponse)
      .catch(this._handleError)
  }

  _playSpotify (params) {
    return this._sonos.playSpotify(params['speaker'], params['uri'])
      .then(this._validateResponse)
      .catch(this._handleError)
  }

  _handleError (err) {
    return P.resolve({ success: false, error: err.message })
  }

  _validateResponse (response) {
    const error = null

    const success = response.statusCode === 200 && response.statusMessage === 'OK'
    if (!success) {
      error = response.statusMessage
    }
    return P.resolve({ success, error })
  }
}

module.exports = () => {
  return new SonosPlugin()
}
