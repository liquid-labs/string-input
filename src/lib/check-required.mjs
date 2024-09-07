import { ArgumentMissingError } from 'standard-error-set'

const checkRequired = ({ input, name, required, status }) => {
  if (required === true && input === '') {
    throw new ArgumentMissingError({
      argumentName: name,
      issue : 'is required',
      status,
    })
  }
}

export { checkRequired }