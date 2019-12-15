var { text } = require('../')

module.exports = function * (opts = {}) {
  yield text`Some stuff.`

  if (opts.panic) {
    throw new Error('Panic!')
  }
  yield new Error('Something went wrong.')
  yield text`Some more stuff.`
}
