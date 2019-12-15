var { text } = require('../')

module.exports = function (opts = {}, ...args) {
  return text`
    Options: ${JSON.stringify(opts)}
    Arguments: ${args.join(', ')}
  `
}
