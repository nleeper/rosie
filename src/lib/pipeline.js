'use strict'

const P = require('bluebird')
const WS = require('ws')
const Sonos = require('./sonos')
const Logger = require('./logger')

class Pipeline {
  constructor () {
    this._websocket = null
    this._connected = false
  }

  connect (settings) {
    this._websocket = new WS(settings.URL, {
      perMessageDeflate: false
    })

    this._websocket.on('close', this._onClose.bind(this))
    this._websocket.on('message', this._onMessage.bind(this))
    this._websocket.on('error', this._onError.bind(this))

    return P.resolve()
  }

  _onMessage (data, flags) {
    let parsedMessage = JSON.parse(data)
    if (parsedMessage.method) {
      Logger.info(`Message received for method ${parsedMessage.method}`)

      switch (parsedMessage.method) {
        case 'connect':
          Logger.info('Pipeline connection established')
          this._connected = true
          break
        case 'sonos.speakers':
          Sonos.getSpeakers().then(speakers => this._sendResponse(parsedMessage.id, { success: true, speakers }))
          break
        case 'sonos.play':
          let speakerId = parsedMessage.params['speakerId']
          // TODO - handle exception and return error response
          Sonos.play(speakerId)
            .then(playing => this._sendResponse(parsedMessage.id, { success: playing }))
          break
        case 'sonos.play_artist':
          let artist = parsedMessage.params['artist']
          let speakerName = parsedMessage.params['speaker']

          Sonos.getSpeakerByName(speakerName)
            .then(speaker => {
              return Sonos.playArtist(speaker.id, artist)
                .then(playing => this._sendResponse(parsedMessage.id, { success: playing }))
            })
          break
      }
    }
  }

  _onError (err) {
    console.log(err)
  }

  _onClose (code, reason) {

  }

  _sendResponse (id, result) {
    this._websocket.send(JSON.stringify({ id, result, error: null }))
  }
}

module.exports = new Pipeline()
