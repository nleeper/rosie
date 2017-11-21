 'use strict'

const Glue = require('glue')
const Manifest = require('./manifest')
const Config = require('./lib/config')
const Logger = require('./lib/logger')
const Sonos = require('./lib/sonos')
const Pipeline = require('./lib/pipeline')

const composeOptions = { relativeTo: __dirname }

module.exports = Glue.compose(Manifest, composeOptions)
  .then(server => {
    return Pipeline.connect(Config.PIPELINE)
      .then(() => Sonos.initialize(Config.SONOS))
      .then(() => server.start().then(() => Logger.info(`Server running at: ${server.info.uri}`)))
  })
  .catch(err => {
    Logger.error(err)
    throw err
  })
