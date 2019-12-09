var arg = require('stdarg')
var dedent = require('dedent')
var isTypedArray = require('is-typedarray')
var it = require('es-get-iterator')
var opt = require('stdopt')

module.exports = run
module.exports.lines = lines
module.exports.line = line
module.exports.run = run

async function run (fn, conf = {}) {
  if (isModule(conf.force)) return

  var result, output, iterator, buffer, chunk
  var { argv, stdout, stderr } = opt(conf.process).or(process).value()
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
        buffer = toBuffer(chunk.stack + '\n')
        stderr.write(buffer)
      } else {
        buffer = toBuffer(chunk)
        stdout.write(buffer)
      }
    }
  } catch (e) {
    buffer = toBuffer(e.stack + '\n')
    stderr.write(buffer)
  }
}

function lines (...args) {
  var out = dedent(...args)
  return out + '\n'
}

function line (out) {
  return String(out) + '\n'
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

function isModule (noModule) {
  return !noModule && !!module.parent.parent
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
