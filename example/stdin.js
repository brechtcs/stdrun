module.exports = async function * () {
  for await (var chunk of process.stdin) {
    yield chunk.toString().toUpperCase()
  }
}
