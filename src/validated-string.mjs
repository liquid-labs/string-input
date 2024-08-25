import { checkValidateInput } from './lib/check-validate-input'
import { checkValidateValue } from './lib/check-validate-value'
import { describeInput } from './lib/describe-input'
import { typeChecks } from './lib/type-checks'

/**
 * Validates a string according to the provided options. This is useful when there's not a pre-built type like `Email`.
 * @param {string} input - The input string.
 * @param {object} options - The validation options.
 * @param {string} options.name - The 'name' by which to refer to the input when generating error messages for the user.
 * @param {string} options.after - The input must be or lexicographically sort after this string.
 * @param {string} options.before - The input must be or lexicographically sort before this string.
 * @param {string} options.endsWith - The input string must end with the indicated string.
 * @param {number} options.maxLength - The longest valid input string in terms of characters.
 * @param {string|RegExp} options.matchRE - The input string must match the provided regular expression. Specifying a
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
    startsWith
  } = options
  let { matchRE } = options

  const selfDescription = describeInput('String', name)
  typeChecks({ input, name })

  if (after !== undefined && [after, input].sort()[0] !== after) {
    throw new Error(`${selfDescription} input '${input}' must be lexicographically after '${after}'.`)
  }
  if (before !== undefined && [input, before].sort()[1] !== before) {
    throw new Error(`${selfDescription} input '${input}' must be lexicographically before '${before}'.`)
  }

  if (endsWith !== undefined && !input.endsWith(endsWith)) {
    throw new Error(`${selfDescription} input '${input}' must end with '${endsWith}'.`)
  }
  if (startsWith !== undefined && !input.startsWith(startsWith)) {
    throw new Error(`${selfDescription} input '${input}' must start with '${startsWith}'.`)
  }

  if (matchRE !== undefined) {
    if (typeof matchRE === 'string') {
      matchRE = new RegExp(matchRE)
    }
    if (matchRE.test(input) !== true) {
      throw new Error(`${selfDescription} input '${input}' must match ${matchRE.toString()}.`)
    }
  }

  if (maxLength !== undefined && input.length > maxLength) {
    throw new Error(`${selfDescription} input '${input}' must have length ${maxLength} or less.`)
  }
  if (minLength !== undefined && input.length < minLength) {
    throw new Error(`${selfDescription} input '${input}' must have length ${minLength} or greater.`)
  }

  if (oneOf !== undefined && !oneOf.includes(input)) {
    throw new Error(`${selfDescription} input '${input}' must be one of '${oneOf.join("', '")}'.`)
  }

  const validationOptions = Object.assign({ input, name, type: 'string' }, options)
  checkValidateInput(input, validationOptions)
  checkValidateValue(input, validationOptions)

  return input
}

ValidatedString.description = 'Validated string'
ValidatedString.toString = () => ValidatedString.description

export { ValidatedString }
