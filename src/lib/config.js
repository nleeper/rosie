const RC = require('rc')('ROSIE', require('../../config/default.json'))

module.exports = {
  PORT: RC.PORT,
  SPOTIFY: RC.SPOTIFY,
  PIPELINE: RC.PIPELINE,
  SONOS: RC.SONOS
}
