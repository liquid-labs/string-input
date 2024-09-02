import { ArgumentInvalidError } from 'standard-error-set'

import { checkValidateInput } from './lib/check-validate-input'
import { checkValidateValue } from './lib/check-validate-value'
import { typeChecks } from './lib/type-checks'

/**
 * Validates a string according to the provided options. This is useful when there's not a pre-built type like `Email`.
 * @param {string} input - The input string.
 * @param {object} options - The validation options.
 * @param {string} options.name - The 'name' by which to refer to the input when generating error messages for the user.
 * @param {number} [options.failureStatus = 400] - The HTTP status to use when throwing `ArgumentInvalidError` errors.
 *   This can be used to mark arguments specified by in code or configurations without user input.
 * @param {string} options.after - The input must be or lexicographically sort after this string.
 * @param {string} options.before - The input must be or lexicographically sort before this string.
 * @param {string} options.endsWith - The input string must end with the indicated string.
 * @param {number} options.maxLength - The longest valid input string in terms of characters.
 * @param {string|RegExp} options.matchRe - The input string must match the provided regular expression. Specifying a
 *   string which is an invalid regular expression will cause an exception to be thrown.
 * @param {number} options.minLength - The shortest valid input string in terms of characters.
 * @param {Array.<string>} options.oneOf - The input string must be exactly one of the members of this array.
 * @param {string} options.startsWith - The input string must start with the indicated string.
 * @param {Function} options.validateInput - A custom validation function which looks at the original input string. See
 *   the [custom validation functions](#custom-validation-functions) section for details on input and return values.
 * @param {Function} options.validateValue - A custom validation function which looks at the transformed value. See the
 *   [custom validation functions](#custom-validation-functions) section for details on input and return values.
 * @returns {string} Returns the input.
 */
const ValidatedString = function (input, options = this || {}) {
  const {
    after,
    before,
    endsWith,
    maxLength,
    minLength,
    name,
    oneOf,
    startsWith,
    status,
  } = options
  let { matchRe } = options

  typeChecks({ input, name, status })

  if (after !== undefined && [after, input].sort()[0] !== after) {
    throw new ArgumentInvalidError({
      argumentName  : name,
      argumentValue : input,
      issue         : `must be lexicographically after '${after}'`,
      status,
    })
  }
  if (before !== undefined && [input, before].sort()[1] !== before) {
    throw new ArgumentInvalidError({
      argumentName  : name,
      argumentValue : input,
      issue         : `must be lexicographically before '${before}'`,
      status,
    })
  }

  if (endsWith !== undefined && !input.endsWith(endsWith)) {
    throw new ArgumentInvalidError({
      argumentName  : name,
      argumentValue : input,
      issue         : `must end with '${endsWith}'`,
      status,
    })
  }
  if (startsWith !== undefined && !input.startsWith(startsWith)) {
    throw new ArgumentInvalidError({
      argumentName  : name,
      argumentValue : input,
      issue         : `must start with '${startsWith}'`,
      status,
    })
  }

  if (matchRe !== undefined) {
    if (typeof matchRe === 'string') {
      matchRe = new RegExp(matchRe)
    }
    if (matchRe.test(input) !== true) {
      throw new ArgumentInvalidError({
        argumentName  : name,
        argumentValue : input,
        issue         : `must match ${matchRe.toString()}`,
        status,
      })
    }
  }

  if (maxLength !== undefined && input.length > maxLength) {
    throw new ArgumentInvalidError({
      argumentName  : name,
      argumentValue : input,
      issue         : `may be no more than ${maxLength} characters long`,
      status,
    })
  }
  if (minLength !== undefined && input.length < minLength) {
    throw new ArgumentInvalidError({
      argumentName  : name,
      argumentValue : input,
      issue         : `must be at least ${minLength} characters long`,
      status,
    })
  }

  if (oneOf !== undefined) {
    const testGroup = typeof oneOf === 'string' ? oneOf.split(/\s*,\s*/) : oneOf

    if (!testGroup.includes(input)) {
      const issue =
        'must be '
        + (testGroup.length === 1
          ? `'${testGroup[0]}'`
          : `one of '${testGroup.join("', '")}'`)
      throw new ArgumentInvalidError({
        argumentName  : name,
        argumentValue : input,
        issue,
        status,
      })
    }
  }

  const validationOptions = Object.assign(
    { input, name, type : 'string' },
    options
  )
  checkValidateInput(input, validationOptions)
  checkValidateValue(input, validationOptions)

  return input
}

ValidatedString.description = 'Validated string'
ValidatedString.toString = () => ValidatedString.description

export { ValidatedString }
