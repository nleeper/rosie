'use strict'

const P = require('bluebird')
const Glob = require('glob')
const Config = require('../lib/config')
const TypeCheck = require('../lib/type-check')

class PluginManager {
  constructor () {
    this._plugins = {}
  }

  register () {
    let configs = Glob.sync('**/plugin.js', { cwd: __dirname }).map(this._loadConfig).filter(x => x !== undefined)
    return P.all(configs.map(this._resolvePlugin))
      .then(plugins => plugins.map(this._addPlugin.bind(this)))
  }

  handle (method, params) {
    let split = method.split('.', 2)

    let name = split[0]
    let action = split[1]

    let plugin = this._plugins[name]
    if (plugin) {
      if (plugin.supportedActions.indexOf(action) > -1) {
        return plugin.handle(action, params)
      } else {
        throw new Error(`Plugin ${name} does not support action ${action}`)
      }
    } else {
      throw new Error(`There is no plugin named ${name}`)
    }
  }

  _loadConfig (file) {
    return require(`./${file}`)
  }

  _addPlugin (plugin) {
    if (this._plugins[plugin.name]) {
      throw new Error(`Plugin with 'name' = '${plugin.name}' has already been registered`)
    }

    this._plugins[plugin.name] = plugin

    return plugin
  }

  _resolvePlugin (config) {
    return P.resolve(TypeCheck.isFunction(config) ? config() : config)
      .then(plugin => {
        if (!plugin.name) {
          throw new Error('Plugin must have a name')
        }

        if (!TypeCheck.isString(plugin.name)) {
          throw new Error('Name must be a string')
        }

        if (!plugin.description) {
          throw new Error('Plugin must have a description')
        }

        if (!TypeCheck.isString(plugin.description)) {
          throw new Error('Description must be a string')
        }

        if (!plugin.supportedActions) {
          throw new Error('Plugin must have supported actions')
        }

        if (!TypeCheck.isArray(plugin.supportedActions)) {
          throw new Error('Supported actions must be an array')
        }

        if (!plugin.initialize) {
          throw new Error('Plugin does not implement required function \'initialize\'')
        }

        if (!plugin.handle) {
          throw new Error('Plugin does not implement required function \'handle\'')
        }

        return plugin.initialize(Config).then(() => plugin)
      })
  }
}

exports.create = () => {
  return new PluginManager()
}
