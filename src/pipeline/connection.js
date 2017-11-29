'use strict'

const P = require('bluebird')
const EventEmitter = require('events')
const WebSocket = require('./websocket')
const Logger = require('../lib/logger')

class PipelineConnection extends EventEmitter {
  constructor (settings) {
    super()

    this._ws = WebSocket.create({
      url: settings.url,
      pingInterval: settings.pingInterval,
      connectTimeout: settings.connectTimeout,
      reconnectInterval: settings.reconnectInterval
    })

    this._registerTimeout = settings.registerTimeout
    this._registerTimerId = null
  }

  connect () {
    return new P((resolve, reject) => {
      if (this._ws.isConnected()) {
        return resolve(this)
      }

      this._ws.removeAllListeners()

      const connectErrorListener = (err) => {
        Logger.error('Error while connecting to pipeline', err)
        this._ws.removeAllListeners()
        reject(err)
      }

      const registeredNotificationListener = (data, flags) => {
        let parsedMessage = JSON.parse(data)
        if (this._isNotification(parsedMessage, 'registered')) {
          Logger.info('Pipeline registration complete')

          this._clearTimers()

          this._ws.on('close', this._onWebSocketClose.bind(this))
          this._ws.on('error', this._onWebSocketError.bind(this))
          this._ws.on('message', this._onWebSocketMessage.bind(this))

          resolve(this)
        }
      }

      this._ws.once('error', connectErrorListener)

      this._ws.once('open', () => {
        // Remove listener only used for connect problems.
        this._ws.removeListener('error', connectErrorListener)

        // Add listener waiting for registered notification.
        this._ws.once('message', registeredNotificationListener)

        // Setup a timeout for waiting for registered notification.
        this._registerTimerId = setTimeout(this._onRegisterTimedOut.bind(this), this._registerTimeout)
      })

      this._ws.connect()
    })
  }

  sendResponse (id, result) {
    this._ws.send(JSON.stringify({ id, result, error: null }))
  }

  sendError (id, error) {
    this._ws.send(JSON.stringify({ id, result: null, error }))
  }

  close () {
    this._ws.close()
  }

  _onRegisterTimedOut () {
    Logger.error('Pipeline registration failed, closing connection')
    this._cleanup()
    this.emit('connectionClose', false)
  }

  _clearTimers () {
    clearTimeout(this._registerTimerId)
    this._registerTimerId = null
  }

  _cleanup () {
    this._clearTimers()
    this.close()
  }

  _isNotification (message, notificationType) {
    return message.id === null && message.method === notificationType
  }

  _onWebSocketMessage (data, flags) {
    let parsedMessage = JSON.parse(data)
    if (parsedMessage.method) {
      Logger.info(`Pipeline message received for method ${parsedMessage.method}`)
      this.emit('message', parsedMessage)
    }
  }

  _onWebSocketError (err) {
    Logger.error('Error on WebSocket connection', err)

    const canReconnect = (err.code === 'ECONNREFUSED')
    this.emit('connectionClose', canReconnect)
  }

  _onWebSocketClose (code, reason) {
    Logger.error(`WebSocket connection closed: ${code} - ${reason}`)

    const canReconnect = (code !== 1000)
    this.emit('connectionClose', canReconnect)
  }
}

exports.create = (settings) => {
  return new PipelineConnection(settings)
}
