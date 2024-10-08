import { einRe } from 'regex-repo'
import { ArgumentInvalidError } from 'standard-error-set'

import { checkValidateInput } from './lib/check-validate-input'
import { checkValidateValue } from './lib/check-validate-value'
import { sanitizeOptions } from './lib/sanitize-options'
import { standardChecks } from './lib/standard-checks'

/**
 * Validates the input as a valid EIN.
 * @param {string} input - The input string.
 * @param {object} options - The validation options.
 * @param {string} options.name - The 'name' by which to refer to the input when generating error messages for the user.
 * @param {number} [options.status = 400] - The HTTP status to use when throwing `ArgumentInvalidError` errors.
 *   This can be used to mark arguments specified by in code or configurations without user input.
 * @param {boolean} [options.required = false] - If true, then the empty string is rejected and `ArgumentMissingError`
 *   is thrown.
 * @param {Function} [options.validateInput = undefined] - A custom validation function which looks at the original
 *   input string. See the [custom validation functions](#custom-validation-functions) section for details on input and
 *   return values.
 * @param {Function} [options.validateValue = undefined] - A custom validation function which looks at the transformed
 *   value. See the [custom validation functions](#custom-validation-functions) section for details on input and return
 *   values.
 * @returns {string} A canonically formatted EIN 'XX-XXXXXXX'.
 */
const EIN = function (input, options = this || {}) {
  const { name } = options

  options = sanitizeOptions(options)

  input = standardChecks({ ...options, input, name })
  if (input === '') {
    return undefined
  }

  const einMatch = input.match(einRe)
  if (einMatch === null) {
    throw new ArgumentInvalidError({
      argumentName  : name,
      argumentValue : input,
      issue         : 'is not a valid EIN',
      ...options,
    })
  }
  const validationOptions = Object.assign(
    { input, name, type : 'string<EIN>' },
    options
  )
  checkValidateInput(input, validationOptions)

  const value = input.slice(0, 2) + '-' + input.slice(-7)

  checkValidateValue(value, validationOptions)

  return value
}

EIN.description = 'EIN'
EIN.toString = () => EIN.description

export { EIN }
