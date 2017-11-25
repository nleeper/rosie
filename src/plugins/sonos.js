'use strict'

const Sonos = require('../lib/sonos')

class SonosPlugin {
  constructor () {
    this.name = 'sonos'
    this.description = 'Plugin to control Sonos players'
    this.supportedActions = ['speakers', 'play_artist']
  }

  initialize (config) {
    return Sonos.initialize(config.SONOS)
  }

  handle (action, params) {
    if (action === 'speakers') {
      return Sonos.getSpeakers()
        .then(speakers => ({ success: true, speakers }))
    } else if (action === 'play_artist') {
      let artist = params['artist']
      let speakerName = params['speaker']

      return Sonos.getSpeakerByName(speakerName)
        .then(speaker => {
          return Sonos.playArtist(speaker.id, artist)
            .then(playing => ({ success: playing }))
        })
    }
  }
}

module.exports = () => {
  return new SonosPlugin()
}
