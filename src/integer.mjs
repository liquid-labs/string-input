import { integerRe } from 'regex-repo'
import { ArgumentInvalidError } from 'standard-error-set'

import { checkMaxMin } from './lib/check-max-min'
import { checkValidateInput } from './lib/check-validate-input'
import { checkValidateValue } from './lib/check-validate-value'
import { standardChecks } from './lib/standard-checks'

const anyDigitsRe = /^-?\d+$/

/**
 * Parses and validates an input string as an integer.
 * @param {string} input - The input string.
 * @param {object} options - The validation options.
 * @param {string} options.name - The 'name' by which to refer to the input when generating error messages for the user.
 * @param {number} [options.status = 400] - The HTTP status to use when throwing `ArgumentInvalidError` errors.
 *   This can be used to mark arguments specified by in code or configurations without user input.
 * @param {boolean} options.allowLeadingZeros - Overrides default behavior which rejects strings with leading zeros.
 * @param {number} options.divisibleBy - Requires the resulting integer value be divisible by the indicated number (
 *   which need not itself be an integer).
 * @param {number} options.max - The largest value considered valid.
 * @param {number} options.min - The smallest value considered valid.
 * @param {Function} [options.validateInput = undefined] - A custom validation function which looks at the original
 *   input string. See the [custom validation functions](#custom-validation-functions) section for details on input and
 *   return values.
 * @param {Function} [options.validateValue = undefined] - A custom validation function which looks at the transformed
 *   value. See the [custom validation functions](#custom-validation-functions) section for details on input and return
 *   values.
 * @returns {number} A primitive integer.
 */
const Integer = function (input, options = this || {}) {
  const { name, allowLeadingZeros, divisibleBy, max, min, status } = options

  input = standardChecks({ input, name, status, ...options })
  if (input === '') {
    return undefined
  }

  if (allowLeadingZeros !== true && input.match(integerRe) === null) {
    let issue = 'does not appear to be an integer'
    if (input.match(anyDigitsRe)) {
      issue += '; leading zeroes are not allowed.'
    }
    throw new ArgumentInvalidError({
      argumentName  : name,
      argumentValue : input,
      issue,
      status,
    })
  }
  else if (allowLeadingZeros === true && input.match(anyDigitsRe) === null) {
    throw new ArgumentInvalidError({
      argumentName  : name,
      argumentValue : input,
      issue         : 'does not appear to be an integer (leading zeros allowed)',
      status,
    })
  }

  const validationOptions = Object.assign(
    { input, name, type : 'string<integer>' },
    options
  )
  checkValidateInput(input, validationOptions)
  const value = parseInt(input)
  checkMaxMin({ input, max, min, name, status, value })
  if (divisibleBy !== undefined && value % divisibleBy !== 0) {
    throw new ArgumentInvalidError({
      argumentName  : name,
      argumentValue : input,
      issue         : `must be divisible by '${divisibleBy}'`,
      status,
    })
  }
  checkValidateValue(value, validationOptions)

  return value
}

Integer.description = 'Integer'
Integer.toString = () => Integer.description

export { Integer }
