var { run, text } = require('./')
var fs = require('fs')
var test = require('tape')

test('return', async t => {
  var { out, err } = await collect(() => 'yep')
  t.equal(out.toString(), 'yep')
  t.equal(err.toString(), '')
  t.end()
})

test('error', async t => {
  var { out, err } = await collect(() => {
    throw new Error('nope')
  })
  t.equal(out.length, 0)
  t.ok(err.toString().includes('Error: nope'))
  t.end()
})

test('array', async t => {
  var { out, err } = await collect(() => [1, 2, 3].map(text))
  t.equal(out.toString(), '1\n2\n3\n')
  t.equal(err.toString(), '')
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
  t.ok(err.toString().includes('alert!'))
  t.ok(err.toString().includes('Error: nope'))
  t.notOk(out.toString().includes('nothing\n'))
  t.end()
})

test('stream', async t => {
  var { out, err } = await collect(() => {
    return fs.createReadStream('./README.md')
  })
  t.ok(out.toString().startsWith('# stdrun\n'))
  t.ok(out.toString().endsWith('Apache-2.0\n'))
  t.equal(err.toString(), '')
  t.end()
})

test('other', async t => {
  var obj = await collect(() => ({}))
  t.equal(obj.out.toString(), '[object Object]')
  t.equal(obj.err.toString(), '')

  var typedArr = await collect(() => {
    return Uint8Array.from([8, 5, 7])
  })
  t.equal(typedArr.out.length, 3)
  t.equal(typedArr.err.toString(), '')
  t.end()
})

test('toString', async t => {
  var buffer = await collect(() => {
    var buf = Buffer.from('ping')
    buf.toString = () => 'pong'
    return buf
  })
  t.equal(Buffer.prototype.toString.call(buffer.out), 'pong')
  t.equal(buffer.err.toString(), '')

  var array = await collect(() => {
    var arr = [1, 2]
    arr.toString = () => 'one, two'
    return arr
  })
  t.equal(Buffer.prototype.toString.call(array.out), 'one, two')
  t.equal(array.err.toString(), '')

  var items = await collect(() => {
    function toString () {
      return text(this.descr)
    }

    return [
      { val: 1, descr: 'first' },
      { val: 2, descr: 'second' }
    ].map(item => {
      item.toString = toString
      return item
    })
  })
  t.equal(items.out.toString(), 'first\nsecond\n')
  t.equal(items.err.toString(), '')
  t.end()
})

async function collect (fn) {
  var force = true
  var out = Buffer.alloc(0)
  var err = Buffer.alloc(0)
  var process = {
    argv: ['/usr/bin/node', 'example.js'],
    exit: function () {},
    stdout: {
      write: function (data) {
        out = Buffer.concat([out, data])
      }
    },
    stderr: {
      write: function (data) {
        err = Buffer.concat([err, data])
      }
    }
  }

  await run(fn, { force, process })

  return { out, err }
}
