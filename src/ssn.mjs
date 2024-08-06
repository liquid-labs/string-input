import { ssnRE } from 'regex-repo'

import { checkValidateInput } from './lib/check-validate-input'
import { checkValidateValue } from './lib/check-validate-value'
import { describeInput } from './lib/describe-input'
import { typeChecks } from './lib/type-checks'

/**
 * Parses and validates a string as a valid Social Security Number, with our without dashes.
 * @param {string} input - The input string.
 * @param {object} options - The validation options.
 * @param {string} options.name - The 'name' by which to refer to the input when generating error messages for the user.
 * @param {Function} options.validateInput - A custom validation function which looks at the original input string. See
 *   the [custom validation functions](#custom-validation-functions) section for details on input and return values.
 * @param {Function} options.validateValue - A custom validation function which looks at the transformed value. See the
 *   [custom validation functions](#custom-validation-functions) section for details on input and return values.
 * @returns {string} A canonically formatted SSN like 'XX-XXX-XXXX'.
 */
const SSN = function (input, options = this || {}) {
  const { name } = options

  const selfDescription = describeInput('SSN', name)
  typeChecks(input)

  const ssnMatch = input.match(ssnRE)
  if (ssnMatch === null) {
    throw new Error(`${selfDescription} input '${input}' is not a valid SSN. Ensure there are nine digits and a valid area code.`)
  }
  const validationOptions = Object.assign({ input, selfDescription }, options)
  checkValidateInput(input, validationOptions)

  const value = `${ssnMatch[1]}-${ssnMatch[2]}-${ssnMatch[3]}`

  checkValidateValue(value, validationOptions)

  return value
}

export { SSN }
