const RC = require('rc')('ROSIE', require('../../config/default.json'))

module.exports = {
  PORT: RC.PORT,
  PIPELINE: RC.PIPELINE,
  PIPELINE_ENABLED: typeof(RC.PIPELINE.ENABLED) === typeof(true) ? RC.PIPELINE.ENABLED : RC.PIPELINE.ENABLED === 'true',
  SONOS: RC.SONOS
}
