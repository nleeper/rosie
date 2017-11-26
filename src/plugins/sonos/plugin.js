'use strict'

const Sonos = require('./sonos')

class SonosPlugin {
  constructor () {
    this.name = 'sonos'
    this.description = 'Plugin to control Sonos players'
    this.supportedActions = ['speakers', 'play', 'play_artist', 'pause', 'stop']
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
      case 'play_artist':
        return this._playArtistOnSpeaker(params)
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
    return this._getSpeaker(params['speakerId'], params['speaker'])
      .then(speaker => {
        return this._sonos.play(speaker.id)
          .then(playing => ({ success: playing }))
      })
  }

  _playArtistOnSpeaker (params) {
    return this._getSpeaker(params['speakerId'], params['speaker'])
      .then(speaker => {
        return this._sonos.playArtist(speaker.id, params['artist'])
          .then(playing => ({ success: playing }))
      })
  }

  _pauseSpeaker (params) {
    return this._getSpeaker(params['speakerId'], params['speaker'])
      .then(speaker => {
        return this._sonos.pause(speaker.id)
          .then(paused => ({ success: paused }))
      })
  }

  _stopSpeaker (params) {
    return this._getSpeaker(params['speakerId'], params['speaker'])
      .then(speaker => {
        return this._sonos.stop(speaker.id)
          .then(stopped => ({ success: stopped }))
      })
  }

  _getSpeaker (speakerId, speakerName) {
    return speakerId ? this._sonos.getSpeakerById(speakerId) : this._sonos.getSpeakerByName(speakerName)
  }
}

module.exports = () => {
  return new SonosPlugin()
}
