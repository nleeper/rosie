 'use strict'

const P = require('bluebird')
const Glue = require('glue')
const Manifest = require('./manifest')
const Config = require('./lib/config')
const Logger = require('./lib/logger')
const PluginManager = require('./plugins')
const PipelineManager = require('./pipeline')

const composeOptions = { relativeTo: __dirname }

module.exports = Glue.compose(Manifest, composeOptions)
  .then(server => {
    let pluginManager = PluginManager.create()

    return pluginManager.register()
      .then(() => {
        if (!Config.PIPELINE_ENABLED) {
          Logger.info('Pipeline connection disabled')
          return P.resolve()
        }

        let pipelineManager = PipelineManager.create(pluginManager, Config.PIPELINE)

        // Stop the server if the pipeline closes.
        pipelineManager.on('close', () => {
          Logger.info('Pipeline connection has closed, stopping server')
          process.exit(0)
        })

        return pipelineManager.start()
      })
      .then(() => {
        // Make the pluginManager available to API handlers.
        server.decorate('request', 'pluginManager', () => {
          return pluginManager
        })

        server.start().then(() => Logger.info(`Server running at ${server.info.uri}`))
      })
  })
  .catch(err => {
    Logger.error(err)
    process.exit(1)
  })
