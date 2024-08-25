import { floatRE } from 'regex-repo'

import { checkValidateInput } from './lib/check-validate-input'
import { checkValidateValue } from './lib/check-validate-value'
import { describeInput } from './lib/describe-input'
import { possibleBooleanValues } from './lib/possible-boolean-values'
import { typeChecks } from './lib/type-checks'

/**
 * Parses and validates an input string as a boolean. By default recognizes true/t/yes/y/any positive number as `true`
 * and false/f/no/n/0 as `false` (case insensitive).
 * @param {string} input - The input string.
 * @param {object} options - The validation options.
 * @param {string} options.name - The 'name' by which to refer to the input when generating error messages for the user.
 * @param {boolean} options.noAbbreviations = Disallow t/f/y/n responses.
 * @param {boolean} options.noNumeric - Disallow numeric answers.
 * @param {boolean} options.noYesNo - Disallow yes/no/y/n responses.
 * @param {boolean} options.treatNegativeValuesAsFalse - When true, inputs that parse as a negative numeric value will
 *   be treated as `false` instead of raising an exception.
 * @param {Function} options.validateInput - A custom validation function which looks at the original input string. See
 *   the [custom validation functions](#custom-validation-functions) section for details on input and return values.
 * @param {Function} options.validateValue - A custom validation function which looks at the transformed value. See the
 *   [custom validation functions](#custom-validation-functions) section for details on input and return values.
 * @returns {boolean} A primitive boolean.
 */
const BooleanString = function (input, options = this || {}) {
  const {
    name,
    noAbbreviations = false,
    noNumeric = false,
    noYesNo = false,
    treatNegativeValuesAsFalse = false
  } = options

  const selfDescription = describeInput('Boolean', name)
  typeChecks({ input, name })

  input = input.toLowerCase()

  if (noAbbreviations === true && (input === 't' || input === 'f' || input === 'y' || input === 'n')) {
    throw new Error(`${selfDescription} input '${input}' is disallowed abbreviated boolean value, use ${possibleBooleanValues(options)}.`)
  }

  if (noYesNo === true && (input === 'yes' || input === 'y' || input === 'no' || input === 'n')) {
    throw new Error(`${selfDescription} input '${input}' is disallowed yes/no value, use ${possibleBooleanValues(options)}.`)
  }

  let value
  if (['true', 't', 'yes', 'y'].includes(input)) {
    value = true
  } else if (['false', 'f', 'no', 'n'].includes(input)) {
    value = false
  } else {
    const numericValue = Number.parseFloat(input)
    if (noNumeric === true && Number.isNaN(numericValue) === false) {
      throw new Error(`${selfDescription} input '${input}' is disallowed numeric value, use ${possibleBooleanValues(options)}.`)
    } else if (Number.isNaN(numericValue) === true ||
      floatRE.test(input) !== true) { // parseFloat allows invalid input like '1.0' or '234abcd'
      throw new Error(`${selfDescription} input '${input}' could not be parsed as a boolean value, use ${possibleBooleanValues(options)}.`)
    }
    if (numericValue === 0 || (treatNegativeValuesAsFalse === true && numericValue < 0)) {
      value = false
    } else if (numericValue > 0) {
      value = true
    } else {
      throw new Error(`${selfDescription} input '${input}' is disallowed negative numeric value; set 'treatNegativeValuesAsFalse' true or use ${possibleBooleanValues(options)}.`)
    }
  }

  const validationOptions = Object.assign({ input, name, type: 'string<boolean>' }, options)
  checkValidateInput(input, validationOptions)
  checkValidateValue(value, validationOptions)

  return value
}

BooleanString.description = 'Boolean string'
BooleanString.toString = () => BooleanString.description

export { BooleanString }
