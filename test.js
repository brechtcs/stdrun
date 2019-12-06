var run = require('./')
var test = require('tape')

test('basic return', async t => {
  var { out, err } = await collect(() => 'yep')
  t.equal(out.toString(), 'yep')
  t.equal(err.toString(), '')
  t.end()
})

test('basic error', async t => {
  var { out, err } = await collect(() => {
    throw new Error('nope')
  })
  t.equal(out.length, 0)
  t.ok(err.toString().includes('Error: nope'))
  t.end()
})

test('generator', async t => {
  function * stream (opts = { fail: true }) {
    yield 'first\n'
    yield 'second\n'
    yield new Error('alert!')
    yield 'third\n'

    if (opts.fail) {
      throw new Error('nope')
    }
    yield 'nothing\n'
  }

  var { out, err } = await collect(stream)
  t.ok(out.toString().includes('first\n'))
  t.ok(out.toString().includes('second\n'))
  t.ok(out.toString().includes('third\n'))
  t.ok(err.toString().includes('Error: alert!'))
  t.ok(err.toString().includes('Error: nope'))
  t.notOk(out.toString().includes('nothing\n'))
  t.end()
})

async function collect (fn) {
  var force = true
  var out = Buffer.alloc(0)
  var err = Buffer.alloc(0)
  var process = {
    argv: ['/usr/bin/node', 'example.js'],
    stdout: {
      write: function (data) {
        out = Buffer.concat([out, Buffer.from(data)])
      }
    },
    stderr: {
      write: function (data) {
        err = Buffer.concat([err, Buffer.from(data)])
      }
    }
  }

  await run(fn, { force, process })

  return { out, err }
}
