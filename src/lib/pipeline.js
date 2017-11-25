'use strict'

const P = require('bluebird')
const WS = require('ws')
const Logger = require('./logger')
const PluginManager = require('../plugins')

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

      if (parsedMessage.method === 'connect') {
        Logger.info('Pipeline connection established')
        this._connected = true
      } else {
        PluginManager.handle(parsedMessage.method, parsedMessage.params)
          .then(response => this._sendResponse(parsedMessage.id, response))
          .catch(err => this._sendError(parsedMessage.id, err.message))
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

  _sendError (id, error) {
    this._websocket.send(JSON.stringify({ id, result: null, error }))
  }
}

module.exports = new Pipeline()
