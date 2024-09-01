import { ssnRe } from 'regex-repo'
import { ArgumentInvalidError } from 'standard-error-set'

import { checkValidateInput } from './lib/check-validate-input'
import { checkValidateValue } from './lib/check-validate-value'
import { typeChecks } from './lib/type-checks'

/**
 * Parses and validates a string as a valid Social Security Number, with our without dashes.
 * @param {string} input - The input string.
 * @param {object} options - The validation options.
 * @param {string} options.name - The 'name' by which to refer to the input when generating error messages for the user.
 * @param {number} [options.failureStatus = 400] - The HTTP status to use when throwing `ArgumentInvalidError` errors.
 *   This can be used to mark arguments specified by in code or configurations without user input.
 * @param {Function} options.validateInput - A custom validation function which looks at the original input string. See
 *   the [custom validation functions](#custom-validation-functions) section for details on input and return values.
 * @param {Function} options.validateValue - A custom validation function which looks at the transformed value. See the
 *   [custom validation functions](#custom-validation-functions) section for details on input and return values.
 * @returns {string} A canonically formatted SSN like 'XX-XXX-XXXX'.
 */
const SSN = function (input, options = this || {}) {
  const { name, status } = options

  typeChecks({ input, name, status })

  const ssnMatch = input.match(ssnRe)
  if (ssnMatch === null) {
    throw new ArgumentInvalidError({
      argumentName  : name,
      argumentValue : input,
      issue         : 'is not a valid SSN',
      status        : 'Ensure there are nine digits and a valid area code.',
    })
  }
  const validationOptions = Object.assign(
    { input, name, type : 'string<SSN>' },
    options
  )
  checkValidateInput(input, validationOptions)

  const value = `${ssnMatch[1]}-${ssnMatch[2]}-${ssnMatch[3]}`

  checkValidateValue(value, validationOptions)

  return value
}

SSN.description = 'SSN'
SSN.toString = () => SSN.description

export { SSN }
