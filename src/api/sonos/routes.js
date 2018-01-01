'use strict'

const Handler = require('./handler')

const tags = ['api', 'sonos']

module.exports = [
  {
    method: 'GET',
    path: '/speakers',
    handler: Handler.speakers,
    config: {
      tags,
      description: 'Available Sonos speakers',
      id: 'sonos_speakers'
    }
  },
  {
    method: 'POST',
    path: '/speakers/{name}/play',
    handler: Handler.play,
    config: {
      tags,
      description: 'Play music on Sonos speaker',
      id: 'sonos_play_speaker'
    }
  },
  {
    method: 'POST',
    path: '/speakers/{name}/pause',
    handler: Handler.pause,
    config: {
      tags,
      description: 'Pause music on Sonos speaker',
      id: 'sonos_pause_speaker'
    }
  },
  {
    method: 'POST',
    path: '/speakers/{name}/spotify/{uri}',
    handler: Handler.playSpotify,
    config: {
      tags,
      description: 'Play Spotify URI on Sonos speaker',
      id: 'sonos_play_spotify'
    }
  }
]
