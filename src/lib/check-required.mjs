import { ArgumentMissingError } from 'standard-error-set'

const checkRequired = ({ input, name, required, ...options }) => {
  if (required === true && input === '') {
    throw new ArgumentMissingError({
      argumentName : name,
      issue        : 'is required',
      ...options,
    })
  }
}

export { checkRequired }
