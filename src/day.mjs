import { ArgumentInvalidError, ArgumentTypeError } from 'standard-error-set'
import { intlDateRe, rfc2822DayReString, usDateRe } from 'regex-repo'

import { checkMaxMin } from './lib/check-max-min'
import { checkValidateInput } from './lib/check-validate-input'
import { checkValidateValue } from './lib/check-validate-value'
import { convertMonthName } from './lib/date-time/convert-month-name'
import { standardChecks } from './lib/standard-checks'

/**
 * Represents the components of specific day.
 * @typedef DayData
 * @property {function(): boolean} isDateTimeObject() - Used for duck-typing. Always returns true.
 * @property {function(): number} getYear() - The year component of the date-time (integer).
 * @property {function(): number} getMonth() - The month of the year (1-indexed) (integer).
 * @property {function(): number} getDayOfMonth() - The numerical day of the month (integer).
 * @property {function(): Date} getDate() - A `Date` object corresponding to the original input string. The time
 *   components of the `Date` will all be set to 0 and the timezone is always UTC.
 * @property {function(): number} valueOf() - The seconds since the epoch (UTC) represented by the original input
 *   string (at the start of the UTC day).
 */

/**
 * Parses and validates input string as a specific day (date). Can handle year first and US format, with or without
 * delimiters, along with RFC 2822 style dates like '1 Jan 2024'.
 * @param {string} input - The input string.
 * @param {object} options - The validation options.
 * @param {string} options.name - The 'name' by which to refer to the input when generating error messages for the user.
 * @param {number} [options.status = 400] - The HTTP status to use when throwing `ArgumentInvalidError` errors. This
 *   can be used to mark arguments specified by in code or configurations without user input.
 * @param {boolean} [options.required = false] - If true, then the empty string is rejected and `ArgumentMissingError`
 *   is thrown.
 * @param {string|number|Date} [options.max = undefined] - The latest day to be considered valid.
 * @param {string|number|Date} [options.min = undefined] - The earliest day to be considered valid.
 * @param {Function} [options.validateInput = undefined] - A custom validation function which looks at the original
 *   input string. See the [custom validation functions](#custom-validation-functions) section for details on input and
 *   return values.
 * @param {Function} [options.validateValue = undefined] - A custom validation function which looks at the transformed
 *   value. See the [custom validation functions](#custom-validation-functions) section for details on input and return
 *   values.
 * @returns {DayData} The day/date data.
 */
const Day = function (input, options = this || {}) {
  const { name, status } = options
  let { max, min } = options

  input = standardChecks({ input, name, status, ...options })
  if (input === '') {
    return undefined
  }

  const intlMatch = input.match(intlDateRe)
  const usMatch = input.match(usDateRe)
  const rfc2822Match = input.match(new RegExp(`^${rfc2822DayReString}$`))

  const matchCount =
    (intlMatch !== null ? 1 : 0)
    + (usMatch !== null ? 1 : 0)
    + (rfc2822Match !== null ? 1 : 0)

  if (matchCount > 1) {
    throw new ArgumentInvalidError({
      argumentName  : name,
      argumentValue : input,
      issue         : 'is ambiguous',
      hint          : 'Try specifying four digit year (with leading zeros if necessary) to disambiguate US (MM/DD/YYYY) vs international (YYYY/MM/DD) formats.',
    })
  }
  else if (matchCount === 0) {
    throw new ArgumentInvalidError({
      argumentName  : name,
      argumentValue : input,
      issue :
        'is not recognized as either US, international, or a RFC 2822 style date',
      hint : "Try something like '1/15/2024', '2024-1-15', or '15 Jan 2024'.",
    })
  }

  const validationOptions = Object.assign(
    { input, name, type : 'string<day>' },
    options
  )
  checkValidateInput(input, validationOptions)

  const ceIndicator = intlMatch?.[1] || usMatch?.[3] || ''
  const year = parseInt(
    ceIndicator + (intlMatch?.[2] || usMatch?.[4] || rfc2822Match?.[4])
  )
  let month
  if (rfc2822Match !== null) {
    month = convertMonthName(rfc2822Match[3])
  }
  else {
    month = parseInt(intlMatch?.[3] || usMatch?.[1])
  }
  const day = parseInt(intlMatch?.[4] || usMatch?.[2] || rfc2822Match?.[2])

  // we set the date explicitly like this because Date parses things inconsistently. E.g. (as of Node 21.5.0),
  // '-2024-01-02' parses as '2024-01-02T06:00:00.000Z', while '01/02/-2024' is just invalid.
  const date = new Date(year, month - 1, day)

  if (max !== undefined) {
    max = convertToDay(max, name, 'max', status)
  }
  if (min !== undefined) {
    min = convertToDay(min, name, 'min', status)
  }

  checkMaxMin({ input, max, min, name, status, value : date })

  // The month can't overflow because we only accept valid months, so we just need to check the day of the month
  if (day !== date.getDate()) {
    throw new ArgumentInvalidError({
      argumentName  : name,
      argumentValue : input,
      issue :
        'looks syntactically valid, but specifies an invalid day for the given month/year.',
      status,
    })
  }

  const value = createValue({ day, month, year, date })

  checkValidateValue(value, validationOptions)

  return value
}

Day.description = 'Day'
Day.toString = () => Day.description

const convertToDay = (value, name, constraint, status) => {
  if (typeof value === 'string') {
    return Day(value, { name : `${name}' constraint '${constraint}` })
  }
  else if (typeof value === 'number') {
    const date = new Date(value)

    return Day(
      `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`
    )
  }
  else if (value instanceof Date) {
    return Day(
      `${value.getUTCFullYear()}-${value.getUTCMonth() + 1}-${value.getUTCDate()}`
    )
  }
  else if (!value.isDayObject?.()) {
    throw new ArgumentTypeError({
      argumentName : `${name}' constraint '${constraint}`,
      arguemntType : "string'/'number'/'Date",
      issue        : 'has nonconvertible type',
      status,
    })
  } // else

  return value
}

const createValue = ({ day, month, year, date }) => ({
  isDayObject   : () => true,
  getDayOfMonth : () => day,
  getMonth      : () => month,
  getYear       : () => year,
  getDate       : () => date,
  valueOf       : () => date.getTime(),
  toString      : () =>
    `${('' + year).padStart(2, '0')}-${('' + month).padStart(2, '0')}-${('' + day).padStart(2, '0')}`,
})

export { Day }
