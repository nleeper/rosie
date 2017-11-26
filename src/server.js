 'use strict'

const Glue = require('glue')
const Manifest = require('./manifest')
const Config = require('./lib/config')
const Logger = require('./lib/logger')
const Pipeline = require('./lib/pipeline')
const PluginManager = require('./plugins')

const composeOptions = { relativeTo: __dirname }

module.exports = Glue.compose(Manifest, composeOptions)
  .then(server => {
    return PluginManager.register()
      .then(() => Pipeline.connect(Config.PIPELINE))
      .then(() => server.start().then(() => Logger.info(`Server running at ${server.info.uri}`)))
  })
  .catch(err => {
    Logger.error(err)
    throw err
  })
