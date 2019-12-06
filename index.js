var arg = require('stdarg')
var opt = require('stdopt')

module.exports = async function run (fn, conf = {}) {
  if (isModule(conf.force)) return

  var result, output, chunk
  var { argv, stdout, stderr } = opt(conf.process).or(process).value()
  var { opts, args } = splitOpts(arg(argv))

  try {
    result = await fn(opts, ...args)
    output = opt(result).or('').value()

    if (typeof output.next !== 'function') {
      return stdout.write(output)
    }
    for await (chunk of output) {
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
