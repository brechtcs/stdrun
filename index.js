var arg = require('stdarg')
var dedent = require('dedent')
var it = require('./iterator')
var opt = require('stdopt')

module.exports = run
module.exports.lines = lines
module.exports.line = line
module.exports.run = run

async function run (fn, conf = {}) {
  if (isModule(conf.force)) return

  var result, output, iterator, chunk
  var { argv, stdout, stderr } = opt(conf.process).or(process).value()
  var { opts, args } = splitOpts(arg(argv))

  try {
    result = await fn(opts, ...args)
    output = opt(result).or('').value()
    iterator = it(output)

    if (!iterator) {
      return stdout.write(output)
    }
    for await (chunk of iterator) {
      if (chunk instanceof Error) {
        stderr.write(chunk.stack + '\n')
      } else {
        stdout.write(chunk)
      }
    }
  } catch (e) {
    stderr.write(e.stack + '\n')
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
