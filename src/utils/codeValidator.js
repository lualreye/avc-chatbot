function isCode(code) {
  const pattern = /^N-\d{13}$/

  return pattern.test(code);
}

module.exports = { isCode }