var { EOL } = require('os')
var { fullStack } = require('verror')
var arg = require('stdarg')
var isTypedArray = require('is-typedarray')
var it = require('es-get-iterator')
var opt = require('stdopt')
var outdent = require('outdent')

module.exports = run
module.exports.main = main
module.exports.run = run
module.exports.sub = sub
module.exports.text = text

var cmd = {
  level: -1,
  plan: function (level, fn) {
    if (level < this.level) return
    clearTimeout(this.task)
    this.task = setTimeout(task)
    this.level = level

    function task () {
      process.argv.splice(2, level)
      run(fn)
    }
  }
}

async function run (fn, conf = {}) {
  var result, output, iterator, buffer, chunk
  var { argv, stdout, stderr, exit } = opt(conf.process).or(process).value()
  var { opts, args } = splitOpts(arg(argv))

  try {
    result = await fn(opts, ...args)
    output = opt(result).or('').value()
    iterator = getIterator(output)

    if (!iterator || toStringOverruled(output)) {
      buffer = toBuffer(output)
      return stdout.write(buffer)
    }
    for await (chunk of iterator) {
      if (chunk instanceof Error) {
        buffer = toBuffer(chunk.message + '\n')
        stderr.write(buffer)
      } else {
        buffer = toBuffer(chunk)
        stdout.write(buffer)
      }
    }
  } catch (e) {
    buffer = toBuffer(fullStack(e) + '\n')
    stderr.write(buffer)
    exit(1)
  }
}

function main (fn) {
  cmd.plan(0, fn)
}

function sub (...args) {
  var fn, idx, level, arg
  fn = args.pop()
  idx = 2
  level = 0

  for (arg of args) {
    if (arg === process.argv[idx]) {
      level++
    } else {
      return
    }
    idx++
  }

  cmd.plan(level, fn)
}

function text (...args) {
  var out = Array.isArray(args[0])
    ? outdent({ newline: EOL })(...args)
    : String(args[0])
  return out + EOL
}

/**
 * Private helpers
 */
function getIterator (data) {
  if (typeof data === 'string' || Buffer.isBuffer(data) || isTypedArray(data)) {
    return
  }
  if (data[Symbol.asyncIterator]) {
    return data[Symbol.asyncIterator]()
  }
  return it(data)
}

function splitOpts (opts) {
  var args = opts._
  delete opts._

  for (var key in opts) {
    return { opts, args }
  }
  return { args }
}

function toBuffer (data) {
  if (toStringOverruled(data)) {
    return Buffer.from(data.toString())
  } else if (Buffer.isBuffer(data)) {
    return data
  } else if (isTypedArray(data)) {
    return Buffer.from(data)
  }
  return Buffer.from(data.toString())
}

function toStringOverruled (data) {
  return Object.getPrototypeOf(data).toString !== data.toString
}
