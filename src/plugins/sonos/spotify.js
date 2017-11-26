'use strict'

const SpotifyFinder = require('spotify-finder')

class Spotify {
  constructor (settings) {
    this._spotify = new SpotifyFinder({
      consumer: {
        key: settings.KEY,
        secret: settings.SECRET
      }
    })
  }

  searchArtist (artist) {
    return this._spotify.search({
      q: artist,
      type: 'artist',
      limit: 10
    })
  }

  searchTrack (track) {
    return this._spotify.search({
      q: track,
      type: 'track',
      limit: 25
    })
  }
}

exports.create = (settings) => {
  return new Spotify(settings)
}
