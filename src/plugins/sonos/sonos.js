'use strict'

const _ = require('underscore')
const P = require('bluebird')
const Uuid = require('uuid4')
const SonosDiscovery = require('sonos-discovery')
const Errors = require('../../errors')
const Logger = require('../../lib/logger')

class Sonos {
  constructor (options) {
    this._initialized = false

    this._timeout = options.SONOS.TIMEOUT || 2500

    this._discovery = new SonosDiscovery()
  }

  initialize () {
    return new P((resolve, reject) => {
      setTimeout(function () {
        if (this._discovery.players.length === 0) {
          return reject('No Sonos speakers were discovered, try increasing timeout')
        }

        resolve()
        Logger.info(`Sonos system discovered: ${Object.keys(this._discovery.players).length} speakers found`)
      }.bind(this), this._timeout)
    })
  }

  getSpeakers () {
    return P.resolve(this._discovery.players.map(this._simplifyPlayer))
  }

  stop (name) {
    return this._getPlayer(name)
      .then(player => player.coordinator.stop())
      .then(this._validateResponse)
  }

  pause (name) {
    return this._getPlayer(name)
      .then(player => player.coordinator.pause())
      .then(this._validateResponse)
  }

  play (name) {
    return this._getPlayer(name)
      .then(player => player.coordinator.play())
      .then(this._validateResponse)
  }

  _getPlayer (name) {
    return new P((resolve, reject) => {
      let player = this._discovery.getPlayer(name)
      if (player === undefined) return reject(new Errors.NotFoundError(`The speaker ${name} could not be found`))

      resolve(player)
    })
  }

  _simplifyPlayer (player) {
    return {
      id: player.uuid,
      state: player.state,
      playMode: player.currentPlayMode,
      name: player.roomName,
      coordinator: player.coordinator.uuid,
      groupState: player.groupState
    }
  }

  _validateResponse (response) {
    return P.resolve(response.statusCode === 200 && response.statusMessage === 'OK')
  }
}

exports.create = (options) => {
  return new Sonos(options)
}
