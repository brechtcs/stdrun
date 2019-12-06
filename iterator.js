module.exports = function (data) {
  if (!data || typeof data === 'string') {
    return
  }

  if (data[Symbol.asyncIterator]) {
    return data[Symbol.asyncIterator]()
  } else if (data[Symbol.iterator]) {
    return data[Symbol.iterator]()
  } else if (typeof data.next === 'function') {
    return data
  }
}
