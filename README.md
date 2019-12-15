# stdrun

Create a CLI with a single function

## Usage

A basic program using `stdrun` looks like this:

```js
// example.js
var { run, text } = require('stdrun')

function main (opts = {}, ...args) {
  return text`
    Options: ${JSON.stringify(opts)}
    Arguments: ${args.join(', ')}
  `
}

run(main)
```

Which you can then run in your terminal:

```sh
$ node example.js --yes some stuff --target="./path/to/somewhere"
Options: {"yes": true, "target": "./path/to/somewhere"}
Arguments: some, stuff
```

### Streams

You can do more than just text though. If your function returns a node stream, its output is gradually rendered to the terminal.


```js
var fs = require('fs')
var run = require('stdrun')

function main (opts, file) {
  return fs.createReadStream(file)
}

run(main)
```

#### stdin

You can also read the `stdin` stream. The cleanest way to do so is using asynchronous iteration.

```js
var run = require('stdrun')

async function * main () {
  for await (var chunk of process.stdin) {
    yield chunk.toString().toUpperCase()
  }
}

run(main)
```

### Errors

Commands can output two kinds of errors. Critical errors that terminate the program should use `throw`. Other non-critical errors are yielded as normal values from an iterator. Both types of errors are sent to `stderr`.

```js
var { run, text } = require('stdrun')

function * main (opts = {}) {
  yield text`Some stuff.`

  if (opts.panic) {
    throw new Error('Panic!')
  }
  yield new Error('Something went wrong.')
  yield text`Some more stuff.`
}

run(main)
```

### Subcommands

Subcommands are supported too:

```js
// commands.js
var { main, sub, text } = require('stdrun')

main(() => text`everything else`)
sub('nested', () => text`ping`)
sub('nested', 'deeper', () => text`pong`)
sub('hello', () => text`world`)
```

Which you can execute like so:

```sh
$ node commands.js hello
world
$ node commands.js nested
ping
$ node commands.js nested deeper
pong
$ node commands.js
everything else
```

## License

Apache-2.0
