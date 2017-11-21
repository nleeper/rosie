'use strict'

const src = '../../../src'
const Test = require('tapes')(require('tape'))
// const Sinon = require('sinon')
// const P = require('bluebird')
const Sonos = require(`${src}/lib/sonos`)

Test('Sonos', sonosTest => {
  sonosTest.beforeEach(t => {
    t.end()
  })

  sonosTest.afterEach(t => {
    Sonos._speakers = {}
    t.end()
  })

  sonosTest.test('initialize should', initializeTest => {
    initializeTest.end()
  })

  sonosTest.test('getSpeakers should', getSpeakersTest => {
    getSpeakersTest.test('resolve promise with list of speakers', test => {
      let speakerList = [{ id: 1, name: 'test' }, { id: 2, name: 'test2' }]
      Sonos._speakers = speakerList

      Sonos.getSpeakers()
        .then(speakers => {
          test.equal(speakers, speakerList)
          test.end()
        })
    })

    getSpeakersTest.end()
  })

  sonosTest.test('getSpeakerByName should', getSpeakerByNameTest => {
    getSpeakerByNameTest.test('resolve promise with matching speaker', test => {
      let speakerList = [{ id: 1, name: 'test' }, { id: 2, name: 'test2' }]
      Sonos._speakers = speakerList

      let name = 'test'

      Sonos.getSpeakerByName(name)
        .then(found => {
          test.ok(found)
          test.equal(found.name, name)
          test.end()
        })
    })

    getSpeakerByNameTest.test('reject promise if speaker not found', test => {
      let speakerList = [{ id: 1, name: 'test' }, { id: 2, name: 'test2' }]
      Sonos._speakers = speakerList

      let name = 'test3'

      Sonos.getSpeakerByName(name)
        .then(found => {
          test.fail('Should have thrown error')
          test.end()
        })
        .catch(err => {
          test.equal(err.message, `The speaker ${name} could not be found`)
          test.end()
        })
    })

    getSpeakerByNameTest.end()
  })

  sonosTest.end()
})
