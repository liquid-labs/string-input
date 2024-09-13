const sanitizeOptions = (options) => {
  options = Object.assign({}, options)
  delete options.argumentName
  delete options.argumentValue
  delete options.input
  delete options.value

  return options
}

export { sanitizeOptions }
