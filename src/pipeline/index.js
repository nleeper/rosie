'use strict'

const Logger = require('../lib/logger')
const PipelineConnection = require('./connection')

class PipelineManager {
  constructor (pluginManager, settings) {
    this._pluginManager = pluginManager

    const url = settings.URL || 'ws://localhost:8888/ws/pipeline'
    const pingInterval = settings.PING_INTERVAL || 30000
    const connectTimeout = settings.CONNECT_TIMEOUT || 60000
    const reconnectInterval = settings.RECONNECT_INTERVAL || 5000
    const registerTimeout = settings.REGISTER_TIMEOUT || 10000

    this._connection = PipelineConnection.create({ url, pingInterval, connectTimeout, reconnectInterval, registerTimeout })
    this._connection.on('message', this._onPipelineMessage.bind(this))
    this._connection.on('connectionClose', this._onPipelineClose.bind(this))
  }

  start () {
    return this._connection.connect()
  }

  stop () {
    Logger.info('Stopping server')
  }

  _reconnectToPipeline () {
    return this.start()
  }

  _onPipelineMessage (message) {
    this._pluginManager.handle(message.method, message.params)
      .then(response => this._connection.sendResponse(message.id, response))
      .catch(err => this._connection.sendError(message.id, err.message))
  }

  _onPipelineClose (canReconnect) {
    if (canReconnect) {
      Logger.info('Pipeline connection closed, attempting to reconnect')
      this._reconnectToPipeline()
        .then(() => Logger.info('Successfully reconnected to pipeline'))
        .catch(err => {
          Logger.error('Error reconnecting to pipeline, stopping server', err)
          this.stop()
        })
    } else {
      Logger.error('Pipeline connection closed with no reconnection, stopping server')
      this.stop()
    }
  }
}

exports.create = (pluginManager, settings) => {
  return new PipelineManager(pluginManager, settings)
}
