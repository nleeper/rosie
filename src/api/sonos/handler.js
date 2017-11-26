'use strict'

const PluginManager = require('../../plugins')

exports.speakers = (request, reply) => {
  PluginManager.handle('sonos.speakers', {})
    .then(reply)
}

exports.play = (request, reply) => {
  let speakerId = request.params.id
  let artist = request.payload ? request.payload.artist : undefined

  if (artist) {
    PluginManager.handle('sonos.play_artist', { artist, speakerId })
      .then(reply)
  } else {
    PluginManager.handle('sonos.play', { speakerId })
      .then(reply)
  }
}

exports.pause = (request, reply) => {
  let speakerId = request.params.id
  PluginManager.handle('sonos.pause', { speakerId })
    .then(reply)
}

exports.stop = (request, reply) => {
  let speakerId = request.params.id
  PluginManager.handle('sonos.stop', { speakerId })
    .then(reply)
}
