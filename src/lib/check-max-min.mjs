import { ArgumentOutOfRangeError } from 'standard-error-set'

const checkMaxMin = ({ max, min, name, status, value }) => {
  if (max !== undefined && value > max) {
    throw new ArgumentOutOfRangeError({
      argumentName  : `${name}' constraint 'max`,
      argumentValue : max,
      max,
      min,
      status,
    })
  }
  if (min !== undefined && value < min) {
    throw new ArgumentOutOfRangeError({
      argumentName  : `${name}' constraint 'min`,
      argumentValue : min,
      max,
      min,
      status,
    })
  }
}

export { checkMaxMin }
