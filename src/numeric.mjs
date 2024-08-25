import { checkMaxMin } from './lib/check-max-min'
import { checkValidateInput } from './lib/check-validate-input'
import { checkValidateValue } from './lib/check-validate-value'
import { describeInput } from './lib/describe-input'
import { typeChecks } from './lib/type-checks'

const leadingZeroRE = /^0(?!\.|$)/ // test for leading zeros, but allow '0', and '0.xx'

/**
 * Parses and validates an input string as a valid number (float).
 * @param {string} input - The input string.
 * @param {object} options - The validation options.
 * @param {string} options.name - The 'name' by which to refer to the input when generating error messages for the user.
 * @param {boolean} options.allowLeadingZeros - Overrides default behavior which rejects strings with leading zeros.
 * @param {number} options.divisibleBy - Requires the resulting integer value be divisible by the indicated number (
 *   which need not be an integer).
 * @param {number} options.max - The largest value considered valid.
 * @param {number} options.min - The smallest value considered valid.
 * @param {Function} options.validateInput - A custom validation function which looks at the original input string. See
 *   the [custom validation functions](#custom-validation-functions) section for details on input and return values.
 * @param {Function} options.validateValue - A custom validation function which looks at the transformed value. See the
 *   [custom validation functions](#custom-validation-functions) section for details on input and return values.
 * @returns {number} A primitive number.
 */
const Numeric = function (input, options = this || {}) {
  const { name, allowLeadingZeros, divisibleBy, max, min } = options

  const selfDescription = describeInput('Numeric', name)
  typeChecks({ input, name })

  if (allowLeadingZeros !== true && leadingZeroRE.test(input) === true) {
    throw new Error(`${selfDescription} input value '${input}' contains disallowed leading zeros.`)
  } else if (input !== input.trim()) {
    throw new Error(`${selfDescription} input value '${input}' contains disallowed leading or trailing space.`)
  }

  const validationOptions = Object.assign({ input, name, type: 'string<numeric>' }, options)
  checkValidateInput(input, validationOptions)

  const value = Number(input)
  checkMaxMin({ input, max, min, name, value })
  if (divisibleBy !== undefined && (value % divisibleBy) !== 0) {
    throw new Error(`${selfDescription} input '${input}' must be divisible by '${divisibleBy}'.`)
  }

  checkValidateValue(value, validationOptions)

  return value
}

Numeric.description = 'Numeric'
Numeric.toString = () => Numeric.description

export { Numeric }
