import { ArgumentInvalidError } from 'standard-error-set'
import luhn from 'luhn'

import { checkValidateInput } from './lib/check-validate-input'
import { checkValidateValue } from './lib/check-validate-value'
import { sanitizeOptions } from './lib/sanitize-options'
import { standardChecks } from './lib/standard-checks'

const seps = '[ -]'
const formattedNumberRe = new RegExp(`^(?:\\d${seps}?)+\\d$`)
const rawNumberRe = new RegExp(seps, 'g')

/**
 * Validates an input string as a syntactically valid card number.
 * @param {string} input - The input string.
 * @param {object} options - The validation options.
 * @param {string} options.name - The 'name' by which to refer to the input when generating error messages for the user.
 * @param {number} [options.status = 400] - The HTTP status to use when throwing `ArgumentInvalidError` errors. This
 *   can be used to mark arguments specified by in code or configurations without user input.
 * @param {boolean} [options.required = false] - If true, then the empty string is rejected and `ArgumentMissingError`
 *   is thrown.
 * @param {string[]} [options.iins = undefined] - A list of acceptable Industry Identifier Numbers, or initial card
 *   numbers. E.g., iins : ['123']` would only accept cards with an account number starting with '123'. If left
 *   undefined, then all otherwise valid card numbers are treated as valid.
 * @param {number[]} [options.lengths = [12, 13, 14, 15, 16, 17, 18, 19]] - An array of integers defining acceptable
 *   card lengths. The default value is any length between 12 and 19, inclusive.`
 * @param {Function} [options.validateInput = undefined] - A custom validation function which looks at the original
 *   input string. See the [custom validation functions](#custom-validation-functions) section for details on input and
 *   return values.
 * @param {Function} [options.validateValue = undefined] - A custom validation function which looks at the transformed
 *   value. See the [custom validation functions](#custom-validation-functions) section for details on input and return
 *   values.
 * @returns {string} A number-string with no delimiters. Note, there are valid card numbers beginning with 0.
 */
const CardNumber = function (input, options = this || {}) {
  const { name, iins, lengths = [12, 13, 14, 15, 16, 17, 18, 19] } = options

  options = sanitizeOptions(options)

  input = standardChecks({ ...options, input, name })
  if (input === '') {
    return undefined
  }

  if (formattedNumberRe.test(input) === false) {
    throw new ArgumentInvalidError({
      argumentName  : name,
      argumentValue : input,
      issue         : 'does not appear to be a card number',
      hint          : "Expects a number with optional dashes ('-') or spaces (' ').",
      ...options,
    })
  }

  const numberString = input.replaceAll(rawNumberRe, '')
  if (lengths !== undefined && !lengths.includes(numberString.length)) {
    throw new ArgumentInvalidError({
      argumentName  : name,
      argumentValue : input,
      issue         : 'is an invalid length',
      hint          : `Card number must be ${lengths.join(', ')} digits long.`,
      ...options,
    })
  }

  if (
    iins !== undefined
    && iins.some((iin) => {
      if (iin.test !== undefined) {
        if (!iin.toString().startsWith('/^')) {
          throw new ArgumentInvalidError({
            argumentName  : `${name}' constraint 'iins`,
            argumentValue : iin,
            issue :
              'is invalid; regular expression must be pinned to the start of string',
            hint   : "Start regular expression with '^'.",
            status : 500,
          })
        }

        return iin.test(numberString)
      } // else
      const range = ('' + iin).split('-')
      if (range.length === 1) {
        return numberString.startsWith(range[0])
      }
      else if (range.length === 2) {
        const matchLength = range[0].length
        if (range[1].length !== matchLength) {
          throw new ArgumentInvalidError({
            argumentName  : `${name}' constraint 'iins`,
            argumentValue : iin,
            issue :
              'contains an invalid range; both the min and max must specify the same number of digits',
            status : 500,
          })
        }
        const min = parseInt(range[0])
        const max = parseInt(range[1])
        const matchBit = numberString.slice(0, matchLength)
        const matchNumber = parseInt(matchBit)

        return matchNumber >= min && matchNumber <= max
      }
      else {
        throw new ArgumentInvalidError({
          argumentName  : `${name}' constraint 'iins`,
          argumentValue : iin,
          issue         : 'contains an invalid range',
          status        : 500,
        })
      }
    }) !== true
  ) {
    throw new ArgumentInvalidError({
      argumentName  : `${name}' constraint 'iins`,
      argumentValue : iins,
      issue         : 'contains a non-accepted Issuer Identifier Number (IIN)',
      status        : 500,
    })
  }

  const validationOptions = Object.assign(
    { input, name, type : 'string<card number>' },
    options
  )
  checkValidateInput(input, validationOptions)

  if (luhn.validate(numberString) !== true) {
    throw new ArgumentInvalidError({
      argumentName  : name,
      argumentValue : input,
      issue         : 'failed the check-digit validation',
      hint          : 'Check input for typos.',
      ...options,
    })
  }

  checkValidateValue(numberString, validationOptions)

  return numberString
}

CardNumber.description = 'Card number'
CardNumber.toString = () => CardNumber.description

export { CardNumber }

/*
At one point, we tried to incorporate issuer identification number (IIN) / bank identification number (BIN)
information into the logic. This provide unworkable as there are too many holes and exceptions in the data. Even
with fairly standard groups there are issue. E.g., while almost all '34' cards are American Express, IIN 345678 is a
RuPay IIN. So, if you want to limit the match to certain IINs, can provide the `iins` parameter.

For reference, if you want to mess with IIN/BIN validation:
- Mastercard provides a [BIN lookup service](https://developer.mastercard.com/bin-lookup/documentation/)
- [BinList.io](https://binlist.io/) and the corresponding
  [GitHub project][https://github.com/iannuttall/binlist-data] seem to be defunct.
- As of 2024-07-19, it's successor [BIN Lookup](https://binlookup.io/) seems to be operational and you can find
  their data on [this github project](https://github.com/venelinkochev/bin-list-data). However, despite being
  updated 8 4 months ago, they don't have *any* 8 digit BINs so their data is clearly incomplete.
- Other commercial services: [BinDB](https://www.bindb.com/bin-database), [BIN Codes](https://www.bincodes.com/)
*/
