import { ArgumentOutOfRangeError } from 'standard-error-set'

const checkMaxMin = ({ input, limitToString = (limit) => limit, max, min, name, value }) => {
  if (max !== undefined && value > max) {
    throw new ArgumentOutOfRangeError({
      argumentName: name,
      argumentValue: input,
      max,
      min
    })
  }
  if (min !== undefined && value < min) {
    throw new ArgumentOutOfRangeError({
      argumentName: name,
      argumentValue: input,
      max,
      min
    })
  }
}

export { checkMaxMin }
