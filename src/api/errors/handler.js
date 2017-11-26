'use strict'

const ErrorCategory = require('../../errors/category')

const reformatBoomError = (response) => {
  let errorId = response.output.payload.error.replace(/ /gi, '')
  errorId += (errorId.endsWith('Error')) ? '' : 'Error'
  response.output.payload = {
    error_id: errorId,
    message: response.output.payload.message || response.message
  }
}

exports.onPreResponse = (request, reply) => {
  let response = request.response
  if (response.isBoom) {
    if (response.category) {
      response.output.statusCode = ErrorCategory.getStatusCode(response.category)
      response.output.payload = response.payload
      response.output.headers = response.headers
    } else {
      reformatBoomError(response)
    }
  }

  return reply.continue()
}
