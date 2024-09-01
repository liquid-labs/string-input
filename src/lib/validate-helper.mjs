import { ArgumentInvalidError } from 'standard-error-set'

const validateHelper = ({ validationArgs, validationFunc, validationType }) => {
  if (validationFunc === undefined) return

  const result = validationFunc(...validationArgs)
  const { input, name, status, type } = validationArgs[1]
  if (typeof result === 'string') {
    throw new ArgumentInvalidError({
      argumentName  : name,
      argumentType  : type,
      argumentValue : input,
      issue         : result,
      status,
    })
  }
  else if (result !== true) {
    throw new ArgumentInvalidError({
      argumentName  : name,
      argumentType  : type,
      argumentValue : input,
      issue         : `failed custom ${validationType} validation`,
      status,
    })
  }
}

export { validateHelper }
