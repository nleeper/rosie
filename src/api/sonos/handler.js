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

exports.stop = (req, reply) => {
  let speaker = req.params.name

  req.pluginManager().handle('sonos.stop', { speaker })
    .then(reply)
    .catch(reply)
}
