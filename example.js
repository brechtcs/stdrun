var { run, lines } = require('./')

function main (opts = {}, ...args) {
  return lines`
    Options: ${JSON.stringify(opts)}
    Arguments: ${args.join(', ')}
  `
}

run(main)
