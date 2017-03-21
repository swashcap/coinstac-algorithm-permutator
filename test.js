'use strict'

const { assertNumeric } = require('./index.js')
const mockData = require('./mock-data.json')
const tape = require('tape')

tape('assert numeric', (t) => {
  t.ok(assertNumeric(mockData), 'doesn\'t throw with numeric result')
  t.throws(
    assertNumeric.bind(
      null,
      {
        global: {
          averageBetaVector: [Math.random(), null]
        }
      }
    ),
    'throws with non-numeric result'
  )
  t.end()
})
