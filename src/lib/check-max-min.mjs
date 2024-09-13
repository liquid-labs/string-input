import { ArgumentOutOfRangeError } from 'standard-error-set'

const checkMaxMin = ({ max, min, name, value, ...options }) => {
  if (max !== undefined && value > max) {
    throw new ArgumentOutOfRangeError({
      argumentName  : `${name}' constraint 'max`,
      argumentValue : max,
      max,
      min,
      ...options,
    })
  }
  if (min !== undefined && value < min) {
    throw new ArgumentOutOfRangeError({
      argumentName  : `${name}' constraint 'min`,
      argumentValue : min,
      max,
      min,
      ...options,
    })
  }
}

export { checkMaxMin }
