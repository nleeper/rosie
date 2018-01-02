'use strict'

exports.speakers = (req, reply) => {
  req.pluginManager().handle('sonos.speakers', {})
    .then(reply)
}

exports.play = (req, reply) => {
  let speaker = req.params.name

  req.pluginManager().handle('sonos.play', { speaker })
    .then(reply)
    .catch(reply)
}

exports.pause = (req, reply) => {
  let speaker = req.params.name

  req.pluginManager().handle('sonos.pause', { speaker })
    .then(reply)
    .catch(reply)
}

exports.playSpotify = (req, reply) => {
  let speaker = req.params.name
  let uri = req.params.uri

  req.pluginManager().handle('sonos.play_spotify', { speaker, uri })
    .then(reply)
    .catch(reply)
}

exports.next = (req, reply) => {
  let speaker = req.params.name

  req.pluginManager().handle('sonos.next', { speaker })
    .then(reply)
    .catch(reply)
}
