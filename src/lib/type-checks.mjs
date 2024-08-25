import { ArgumentMissingError, ArgumentTypeError } from 'standard-error-set'

const typeChecks = ({ input, name }) => {
  if (input === undefined || input === null) {
    throw new ArgumentMissingError({ argumentName: name })
  }
  if ((typeof input) !== 'string') {
    throw new ArgumentTypeError({ argumentName: name, argumentType: 'string', receivedType: typeof input })
  }
}

export { typeChecks }
