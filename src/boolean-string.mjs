import { ArgumentInvalidError } from 'standard-error-set'
import { floatRe } from 'regex-repo'

import { checkValidateInput } from './lib/check-validate-input'
import { checkValidateValue } from './lib/check-validate-value'
import { possibleBooleanValues } from './lib/possible-boolean-values'
import { standardChecks } from './lib/standard-checks'

/**
 * Parses and validates an input string as a boolean. By default recognizes true/t/yes/y/any positive number as `true`
 * and false/f/no/n/0 as `false` (case insensitive).
 * @param {string} input - The input string.
 * @param {object} options - The validation options.
 * @param {string} options.name - The 'name' by which to refer to the input when generating error messages for the user.
 * @param {number} [options.status = 400] - The HTTP status to use when throwing `ArgumentInvalidError` errors. This
 *   can be used to mark arguments specified by in code or configurations without user input.
 * @param {boolean} [options.required = false] - If true, then the empty string is rejected and `ArgumentMissingError`
 *   is thrown.
 * @param {boolean} [options.noAbbreviations = false] - Disallow t/f/y/n responses.
 * @param {boolean} [options.noNumeric = false] - Disallow numeric answers.
 * @param {boolean} [options.noYesNo = false] - Disallow yes/no/y/n responses.
 * @param {boolean} [options.treatNegativeValuesAsFalse = false] - When true, inputs that parse as a negative numeric
 *   value will be treated as `false` instead of raising an exception.
 * @param {Function} [options.validateInput = undefined] - A custom validation function which looks at the original
 *   input string. See the [custom validation functions](#custom-validation-functions) section for details on input and
 *   return values.
 * @param {Function} [options.validateValue = undefined] - A custom validation function which looks at the transformed
 *   value. See the [custom validation functions](#custom-validation-functions) section for details on input and return
 *   values.
 * @returns {boolean} A primitive boolean.
 */
const BooleanString = function (input, options = this || {}) {
  const {
    name,
    noAbbreviations = false,
    noNumeric = false,
    noYesNo = false,
    status,
    treatNegativeValuesAsFalse = false,
  } = options

  input = standardChecks({ input, name, status, ...options })
  if (input === '') {
    return undefined
  }

  input = input.toLowerCase()

  if (
    noAbbreviations === true
    && (input === 't' || input === 'f' || input === 'y' || input === 'n')
  ) {
    throw new ArgumentInvalidError({
      argumentName  : name,
      argumentValue : input,
      issue         : 'is disallowed abbreviated value',
      hint          : `Use ${possibleBooleanValues(options)}.`,
      status,
    })
  }

  if (
    noYesNo === true
    && (input === 'yes' || input === 'y' || input === 'no' || input === 'n')
  ) {
    throw new ArgumentInvalidError({
      argumentName  : name,
      argumentValue : input,
      issue         : 'is disallowed yes/no value',
      hint          : `Use ${possibleBooleanValues(options)}.`,
      status,
    })
  }

  let value
  if (['true', 't', 'yes', 'y'].includes(input)) {
    value = true
  }
  else if (['false', 'f', 'no', 'n'].includes(input)) {
    value = false
  }
  else {
    const numericValue = Number.parseFloat(input)
    if (noNumeric === true && Number.isNaN(numericValue) === false) {
      throw new ArgumentInvalidError({
        argumentName  : name,
        argumentValue : input,
        issue         : 'is disallowed numeric value',
        hint          : `Use ${possibleBooleanValues(options)}.`,
        status,
      })
    }
    else if (
      Number.isNaN(numericValue) === true
      || floatRe.test(input) !== true
    ) {
      // parseFloat allows invalid input like '1.0' or '234abcd'
      throw new ArgumentInvalidError({
        argumentName  : name,
        argumentValue : input,
        issue         : 'could not be parsed as a boolean value',
        hint          : `Use ${possibleBooleanValues(options)}.`,
        status,
      })
    }
    if (
      numericValue === 0
      || (treatNegativeValuesAsFalse === true && numericValue < 0)
    ) {
      value = false
    }
    else if (numericValue > 0) {
      value = true
    }
    else {
      throw new ArgumentInvalidError({
        argumentName  : name,
        argumentValue : input,
        issue         : 'is ambiguous negative numeric value',
        hint          : `Use ${possibleBooleanValues(options)}.`,
        status,
      })
    }
  }

  const validationOptions = Object.assign(
    { input, name, type : 'string<boolean>' },
    options
  )
  checkValidateInput(input, validationOptions)
  checkValidateValue(value, validationOptions)

  return value
}

BooleanString.description = 'Boolean string'
BooleanString.toString = () => BooleanString.description

export { BooleanString }
