import { einRE } from 'regex-repo'

import { checkValidateInput } from './lib/check-validate-input'
import { checkValidateValue } from './lib/check-validate-value'
import { describeInput } from './lib/describe-input'
import { typeChecks } from './lib/type-checks'

/**
 * Validates the input as a valid EIN.
 * @param {string} input - The input string.
 * @param {object} options - The validation options.
 * @param {string} options.name - The 'name' by which to refer to the input when generating error messages for the user.
 * @param {Function} options.validateInput - A custom validation function which looks at the original input string. See
 *   the [custom validation functions](#custom-validation-functions) section for details on input and return values.
 * @param {Function} options.validateValue - A custom validation function which looks at the transformed value. See the
 *   [custom validation functions](#custom-validation-functions) section for details on input and return values.
 * @returns {string} A canonically formatted EIN 'XX-XXXXXXX'.
 */
const EIN = function (input, options = this || {}) {
  const { name } = options

  const selfDescription = describeInput('EIN', name)
  typeChecks({ input, name })

  const einMatch = input.match(einRE)
  if (einMatch === null) {
    throw new Error(`${selfDescription} input '${input}' is not a valid EIN. Ensure there are nine digits and a valid area code.`)
  }
  const validationOptions = Object.assign({ input, name, type: 'string<EIN>' }, options)
  checkValidateInput(input, validationOptions)

  const value = input.slice(0, 2) + '-' + input.slice(-7)

  checkValidateValue(value, validationOptions)

  return value
}

EIN.description = 'EIN'
EIN.toString = () => EIN.description

export { EIN }
