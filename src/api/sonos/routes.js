'use strict'

const Handler = require('./handler')

const tags = ['api', 'sonos']

module.exports = [
  {
    method: 'GET',
    path: '/speakers',
    handler: Handler.speakers,
    config: {
      tags: tags,
      description: 'Available Sonos speakers',
      id: 'sonos_speakers'
    }
  },
  {
    method: 'POST',
    path: '/speakers/{name}/play',
    handler: Handler.play,
    config: {
      tags: tags,
      description: 'Play music on Sonos speaker',
      id: 'sonos_play_speaker'
    }
  },
  {
    method: 'POST',
    path: '/speakers/{name}/stop',
    handler: Handler.stop,
    config: {
      tags: tags,
      description: 'Stop music on Sonos speaker',
      id: 'sonos_stop_speaker'
    }
  },
  {
    method: 'POST',
    path: '/speakers/{name}/pause',
    handler: Handler.pause,
    config: {
      tags: tags,
      description: 'Pause music on Sonos speaker',
      id: 'sonos_pause_speaker'
    }
  }
]
