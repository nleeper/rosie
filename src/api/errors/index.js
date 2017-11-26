'use strict'

const Handler = require('./handler')

exports.register = (server, options, next) => {
  server.ext('onPreResponse', Handler.onPreResponse)
  next()
}

exports.register.attributes = {
  name: 'error-handler'
}
