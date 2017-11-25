'use strict'

exports.isString = (value) => {
  return typeof value === 'string'
}

exports.isFunction = (value) => {
  return typeof value === 'function'
}

exports.isRegex = (value) => {
  return value instanceof RegExp
}

exports.isArray = (value) => {
  return Array.isArray(value)
}
