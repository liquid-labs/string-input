import { ArgumentInvalidError } from 'standard-error-set'

import { checkMaxMin } from './lib/check-max-min'
import { checkValidateInput } from './lib/check-validate-input'
import { checkValidateValue } from './lib/check-validate-value'
import { sanitizeOptions } from './lib/sanitize-options'
import { standardChecks } from './lib/standard-checks'

const leadingZeroRe = /^0(?!\.|$)/ // test for leading zeros, but allow '0', and '0.xx'

/**
 * Parses and validates an input string as a valid number (float).
 * @param {string} input - The input string.
 * @param {object} options - The validation options.
 * @param {string} options.name - The 'name' by which to refer to the input when generating error messages for the user.
 * @param {number} [options.status = 400] - The HTTP status to use when throwing `ArgumentInvalidError` errors.
 *   This can be used to mark arguments specified by in code or configurations without user input.
 * @param {boolean} options.allowLeadingZeros - Overrides default behavior which rejects strings with leading zeros.
 * @param {number} options.divisibleBy - Requires the resulting integer value be divisible by the indicated number (
 *   which need not be an integer).
 * @param {number} options.max - The largest value considered valid.
 * @param {number} options.min - The smallest value considered valid.
 * @param {Function} [options.validateInput = undefined] - A custom validation function which looks at the original
 *   input string. See the [custom validation functions](#custom-validation-functions) section for details on input and
 *   return values.
 * @param {Function} [options.validateValue = undefined] - A custom validation function which looks at the transformed
 *   value. See the [custom validation functions](#custom-validation-functions) section for details on input and return
 *   values.
 * @returns {number} A primitive number.
 */
const Numeric = function (input, options = this || {}) {
  const { name, allowLeadingZeros, divisibleBy, max, min } = options

  options = sanitizeOptions(options)

  input = standardChecks({ ...options, input, name })
  if (input === '') {
    return undefined
  }

  if (allowLeadingZeros !== true && leadingZeroRe.test(input) === true) {
    throw new ArgumentInvalidError({
      argumentName  : name,
      argumentValue : input,
      issue         : 'contains disallowed leading zeros',
      ...options,
    })
  }
  else if (input !== input.trim()) {
    throw new ArgumentInvalidError({
      argumentName  : name,
      argumentValue : input,
      issue         : 'contains disallowed leading or trailing space',
      ...options,
    })
  }

  const validationOptions = Object.assign(
    { input, name, type : 'string<numeric>' },
    options
  )
  checkValidateInput(input, validationOptions)

  const value = Number(input)
  // TODO: wrap these two together in 'checkNumerics' and share with Integer
  checkMaxMin({ ...options, input, max, min, name, value })
  if (divisibleBy !== undefined && value % divisibleBy !== 0) {
    throw new ArgumentInvalidError({
      argumentName  : name,
      argumentValue : input,
      issue         : `must be divisible by '${divisibleBy}'`,
      ...options,
    })
  }

  checkValidateValue(value, validationOptions)

  return value
}

Numeric.description = 'Numeric'
Numeric.toString = () => Numeric.description

export { Numeric }
