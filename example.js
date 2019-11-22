var run = require('./')

function main (opts = {}, ...args) {
  return `
    Options: ${JSON.stringify(opts)}
    Arguments: ${args.join(', ')}
  `
}

run(main)
