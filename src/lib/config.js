const RC = require('rc')('ROSIE', require('../../config/default.json'))

module.exports = {
  PORT: RC.PORT,
  PIPELINE: RC.PIPELINE,
  SONOS: RC.SONOS
}
