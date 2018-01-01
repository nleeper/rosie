'use strict'

const P = require('bluebird')
const Sonos = require('./sonos')

class SonosPlugin {
  constructor () {
    this.name = 'sonos'
    this.description = 'Plugin to control Sonos players'
    this.supportedActions = ['speakers', 'play', 'pause', 'play_spotify']
  }

  initialize (config) {
    this._sonos = Sonos.create(config.SONOS)
    return this._sonos.initialize()
  }

  handle (action, params) {
    switch (action) {
      case 'speakers':
        return this._getAllSpeakers()
        break
      case 'play':
        return this._playSpeaker(params)
        break
      case 'pause':
        return this._pauseSpeaker(params)
        break
      case 'play_spotify':
        return this._playSpotify(params)
        break
    }
  }

  _getAllSpeakers () {
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
