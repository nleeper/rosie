'use strict'

const Config = require('./lib/config')

module.exports = {
  connections: [
    {
      port: Config.PORT,
    }
  ],
  registrations: [
    { plugin: 'blipp' },
    { plugin: './api' }
  ]
}
