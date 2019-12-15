var { main, sub } = require('../')

main(require('./args'))
sub('read', require('./read'))
sub('read', 'stdin', require('./stdin'))
sub('errors', require('./errors'))
