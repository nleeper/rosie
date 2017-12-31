'use strict'

const Sonos = require('./sonos')

class SonosPlugin {
  constructor () {
    this.name = 'sonos'
    this.description = 'Plugin to control Sonos players'
    this.supportedActions = ['speakers', 'play', 'pause', 'stop']
  }

  initialize (config) {
    this._sonos = Sonos.create(config)
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
      case 'stop':
        return this._stopSpeaker(params)
        break
    }
  }

  _getAllSpeakers () {
    return this._sonos.getSpeakers()
      .then(speakers => ({ success: true, speakers }))
  }

  _playSpeaker (params) {
    return this._sonos.play(params['speaker'])
      .then(success => ({ success }))
  }

  _pauseSpeaker (params) {
    return this._sonos.pause(params['speaker'])
      .then(success => ({ success }))
  }

  _stopSpeaker (params) {
    return this._sonos.stop(params['speaker'])
      .then(success => ({ success }))
  }
}

module.exports = () => {
  return new SonosPlugin()
}
