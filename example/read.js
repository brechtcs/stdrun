var fs = require('fs')

module.exports = function (opts, file) {
  return fs.createReadStream(file)
}
