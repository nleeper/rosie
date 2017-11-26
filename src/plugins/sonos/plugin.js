'use strict'

const Sonos = require('./sonos')

class SonosPlugin {
  constructor () {
    this.name = 'sonos'
    this.description = 'Plugin to control Sonos players'
    this.supportedActions = ['speakers', 'play_artist']
  }

  initialize (config) {
    this._sonos = Sonos.create(config)
    return this._sonos.initialize()
  }

  handle (action, params) {
    if (action === 'speakers') {
      return this._sonos.getSpeakers()
        .then(speakers => ({ success: true, speakers }))
    } else if (action === 'play_artist') {
      let artist = params['artist']
      let speakerName = params['speaker']

      return this._sonos.getSpeakerByName(speakerName)
        .then(speaker => {
          return this._sonos.playArtist(speaker.id, artist)
            .then(playing => ({ success: playing }))
        })
    }
  }
}

module.exports = () => {
  return new SonosPlugin()
}
