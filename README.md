# stdrun

Create a CLI with a single function

## Usage

We can define a basic command line program with the following code:

```js
// example.js
var { run, lines } = require('stdrun')

function main (opts = {}, ...args) {
  return lines`
    Options: ${JSON.stringify(opts)}
    Arguments: ${args.join(', ')}
  `
}

run(main)
```

Which you can then run like so:

```sh
$ node example.js --yes some stuff --target="./path/to/somewhere"
Options: {"yes": true, "target": "./path/to/somewhere"}
Arguments: some, stuff
```

### Streaming output

It is also possible to gradually stream your output to `stdout`. For this we can use a generator function.

```js
var { run, line } = require('stdrun')

function* main () {
  yield line('first')
  yield line('second')
  yield line('third')
}

run(main)
```

### Asynchronous operations

Your main function can also be asynchronous (or return a promise). The terminal will stay blocked until the operation is completed.

```js
var fs = require('fs').promises
var run = require('stdrun')

async function main () {
  var content = await fs.readFile('./README.md')
  return content.toUpperCase()
}

run(main)
```

### Node streams

Because `stdrun` supports both streaming and asynchronous output, you can send any Node stream directly to your terminal.

```js
var fs = require('fs')
var run = require('stdrun')

async function main (opts, file) {
  return fs.createReadStream(file)
}

run(main)
```

## License

Apache-2.0
