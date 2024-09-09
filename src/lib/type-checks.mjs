import { ArgumentMissingError, ArgumentTypeError } from 'standard-error-set'

const typeChecks = ({ input, name, ...options }) => {
  if (input === undefined || input === null) {
    throw new ArgumentMissingError({
      ...options,
      argumentName  : name,
      argumentValue : input,
    })
  }
  if (typeof input !== 'string') {
    throw new ArgumentTypeError({
      ...options,
      argumentName : name,
      argumentType : 'string',
      receivedType : typeof input,
    })
  }
}

export { typeChecks }
