'use strict'

const { assertNumeric } = require('./index.js')
const mockResult = require('./mocks/result.json')
const tape = require('tape')

tape('assert numeric', (t) => {
  t.ok(assertNumeric(mockResult), 'doesn\'t throw with numeric result')
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
