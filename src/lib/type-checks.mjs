import { ArgumentMissingError, ArgumentTypeError } from 'standard-error-set'

const typeChecks = ({ input, name, ...options }) => {
  if (input === undefined || input === null) {
    throw new ArgumentMissingError({
      argumentName  : name,
      argumentValue : input,
      ...options,
    })
  }
  if (typeof input !== 'string') {
    throw new ArgumentTypeError({
      argumentName : name,
      argumentType : 'string',
      receivedType : typeof input,
      ...options,
    })
  }
}

export { typeChecks }
