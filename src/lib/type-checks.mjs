import { ArgumentMissingError, ArgumentTypeError } from 'standard-error-set'

const typeChecks = ({ input, name, status }) => {
  if (input === undefined || input === null) {
    throw new ArgumentMissingError({
      argumentName  : name,
      argumentValue : input,
      status,
    })
  }
  if (typeof input !== 'string') {
    throw new ArgumentTypeError({
      argumentName : name,
      argumentType : 'string',
      receivedType : typeof input,
      status,
    })
  }
}

export { typeChecks }
