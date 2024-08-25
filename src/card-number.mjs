import luhn from 'luhn'

import { checkValidateInput } from './lib/check-validate-input'
import { checkValidateValue } from './lib/check-validate-value'
import { describeInput } from './lib/describe-input'
import { typeChecks } from './lib/type-checks'

const seps = '[ -]'
const formattedNumberRE = new RegExp(`^(?:\\d${seps}?)+\\d$`)
const rawNumberRE = new RegExp(seps, 'g')

/**
 * Validates an input string as a syntactically valid card number.
 * @param {string} input - The input string.
 * @param {object} options - The validation options.
 * @param {string} options.name - The 'name' by which to refer to the input when generating error messages for the user.
 * @param {string[]} options.iins - A list of acceptable Industry Identifier Numbers, or initial card numbers. E.g.,
 *   iins : ['123']` would only accept cards with an account number starting with '123'. If left undefined, then all
 *   otherwise valid card numbers are treated as valid.
 * @param {number[]} options.length - An array of integers defining acceptable card lengths. The default value is any
 *   length between 12 and 19, inclusive.`
 * @param {Function} options.validateInput - A custom validation function which looks at the original input string. See
 *   the [custom validation functions](#custom-validation-functions) section for details on input and return values.
 * @param {Function} options.validateValue - A custom validation function which looks at the transformed value. See the
 *   [custom validation functions](#custom-validation-functions) section for details on input and return values.
 * @returns {string} A number-string with no delimiters. Note, there are valid card numbers beginning with 0.
 */
const CardNumber = function (input, options = this || {}) {
  const {
    name,
    iins,
    lengths = [12, 13, 14, 15, 16, 17, 18, 19]
  } = options

  const selfDescription = describeInput('Card number', name)
  typeChecks({ input, name })

  if (formattedNumberRE.test(input) === false) {
    throw new Error(`${selfDescription} input '${input}' doesn't appear to be a card number; expects a number with optional dashes ('-') or spaces (' ').`)
  }

  const numberString = input.replaceAll(rawNumberRE, '')
  if (lengths !== undefined && !lengths.includes(numberString.length)) {
    throw new Error(`${selfDescription} input '${input}' must be ${lengths.join(', ')} digits long.`)
  }

  if (iins !== undefined && iins.some((iin) => {
    if (iin.test !== undefined) {
      if (!iin.toString().startsWith('/^')) {
        throw new Error(`${selfDescription} 'iins' validation contains a regular expression '${iin.toString()}' which is not pinned to to the start of the string.`)
      }
      return iin.test(numberString)
    } // else
    const range = ('' + iin).split('-')
    if (range.length === 1) {
      return numberString.startsWith(range[0])
    } else if (range.length === 2) {
      const matchLength = range[0].length
      if (range[1].length !== matchLength) {
        throw new Error(`${selfDescription} constraint 'iins' contains an invalid range. Both the min and max must specify the same number of digits.`)
      }
      const min = parseInt(range[0])
      const max = parseInt(range[1])
      const matchBit = numberString.slice(0, matchLength)
      const matchNumber = parseInt(matchBit)
      return matchNumber >= min && matchNumber <= max
    } else {
      throw new Error(`${selfDescription} constraint 'iins' contains invalid range: '${iin}'.`)
    }
  }) !== true) {
    throw new Error(`${selfDescription} input '${input}' is an invalid IIN or partial IIN. Must match one of ${iins.join(', ')}.`)
  }

  const validationOptions = Object.assign({ input, name, type: 'string<card number>' }, options)
  checkValidateInput(input, validationOptions)

  if (luhn.validate(numberString) !== true) {
    throw new Error(`${selfDescription} failed the check-digit validation. This most likely means there's a typo somewhere in the number.`)
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
