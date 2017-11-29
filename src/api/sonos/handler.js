'use strict'

exports.speakers = (req, reply) => {
  req.pluginManager().handle('sonos.speakers', {})
    .then(reply)
}

exports.play = (req, reply) => {
  let speakerId = req.params.id
  let artist = req.payload ? req.payload.artist : undefined

  if (artist) {
    req.pluginManager().handle('sonos.play_artist', { artist, speakerId })
      .then(reply)
      .catch(reply)
  } else {
    req.pluginManager().handle('sonos.play', { speakerId })
      .then(reply)
      .catch(reply)
  }
}

exports.pause = (req, reply) => {
  let speakerId = req.params.id

  req.pluginManager().handle('sonos.pause', { speakerId })
    .then(reply)
    .catch(reply)
}

exports.stop = (req, reply) => {
  let speakerId = req.params.id

  req.pluginManager().handle('sonos.stop', { speakerId })
    .then(reply)
    .catch(reply)
}
