'use strict'

const Sonos = require('../../lib/sonos')

exports.speakers = (request, reply) => {
  Sonos.getSpeakers()
    .then(speakers => reply(speakers))
}

exports.play = (request, reply) => {
  let speakerId = request.params.id
  let artist = request.payload ? request.payload.artist : undefined

  if (artist) {
    Sonos.playArtist(speakerId, artist)
      .then(success => reply({ success }))
  } else {
    Sonos.play(speakerId)
      .then(success => reply({ success }))
  }
}

exports.pause = (request, reply) => {
  let speakerId = request.params.id
  Sonos.pause(speakerId)
    .then(success => reply({ success }))
}

exports.stop = (request, reply) => {
  let speakerId = request.params.id
  Sonos.stop(speakerId)
    .then(success => reply({ success }))
}
