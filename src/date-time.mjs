import { iso8601DateTimeRE, rfc2822DateRE } from 'regex-repo'

import { checkMaxMin } from './lib/check-max-min'
import { checkValidateInput } from './lib/check-validate-input'
import { checkValidateValue } from './lib/check-validate-value'
import { convertTimezoneOffsetToString } from './lib/date-time/convert-timezone-offset-to-string'
import { describeInput } from './lib/describe-input'
import { makeDateTimeString } from './lib/date-time/make-date-time-string'
import { processIdiomaticDateTime } from './lib/date-time/process-idiomatic-date-time'
import { processISO8601DateTime } from './lib/date-time/process-iso-8601-date-time'
import { processRFC2822DateTime } from './lib/date-time/process-rfc-2822-date-time'
import { typeChecks } from './lib/type-checks'

/**
 * Date-time components.
 * @typedef {object} DateTimeData
 * @property {function(): boolean} isDateTimeObject() - Used for duck-typing. Always returns true.
 * @property {function(): number} getYear() - The year component of the date-time (integer).
 * @property {function(): number} getMonth() - The month of the year (1-indexed; integer).
 * @property {function(): number} getDayOfMonth() - The numerical day of the month (integer).
 * @property {function(): boolean} isEOD() - Whether or not the time is the special 'end of day' time.
 * @property {function(): number} getHours() - The hours component of the date-time (integer).
 * @property {function(): number} getMinutes() - The minutes component of the date-time (integer).
 * @property {function(): number} getSeconds() - The seconds component of the date-time (integer).
 * @property {function(): number} getFractionalSeconds() - The fractional seconds component of the date-time.
 * @property {function(): number} getMilliseconds() - The fractional seconds component of the date-time expressed as
 *   milliseconds (integer).
 * @property {function(): number} getTimezoneOffset() - The timezone offset of the original input string in minutes.
 *   May be positive, or negative (integer).
 * @property {function(): Date} getDate() - A `Date` object corresponding to the original input string.
 * @property {function(): number} valueOf() - The milliseconds since the epoch (UTC) represented by the original
 *   input string (integer).
 */

/**
 * Parses and validates a wide range of date-time formats. Accepts RFC 8601 style date times (e.g.:
 * `2024-01-01T12:30:00Z`) as well RFC-2822 style dates (e.g., '1 Jan 2024'), year-first, and US style dates combined
 * with standard (AP/PM), twenty-four hour, and military time designations in either '[date] [time]' or '[time] [date]'
 * order.
 * @param {string} input - The input string.
 * @param {object} options - The validation options.
 * @param {string} options.name - The 'name' by which to refer to the input when generating error messages for the user.
 * @param {string} options.localTimezone - For otherwise valid date time input with no time zone component, then the
 *   `localTimeZone` must be specified as an option. This value is only used if the timezone is not specified in the
 *   input string and any timezone specified in the input string will override this value.
 * @param {string|number|Date} options.min - The earliest valid time, inclusive. This may be specified as any string
 *   parseable by this function, milliseconds since the epoch (UTC), or a Date object.
 * @param {string|number|Date} options.max - The latest valid time, inclusive. This may be specified as any string
 *   parseable by this function, milliseconds since the epoch (UTC), or a Date object.
 * @param {boolean} options.noEOD - Disallows the special times '24:00:00', which represents the last moment of the day.
 * @param {Function} options.validateInput - A custom validation function which looks at the original input string. See
 *   the [custom validation functions](#custom-validation-functions) section for details on input and return values.
 * @param {Function} options.validateValue - A custom validation function which looks at the transformed value. See the
 *   [custom validation functions](#custom-validation-functions) section for details on input and return values.
 * @returns {DateTimeData} The date-time data.
 */
const DateTime = function (input, options = this || {}) {
  const { name, localTimezone, noEOD } = options
  let { min, max } = options

  const selfDescription = describeInput('Date-time', name)
  typeChecks({ input, name })

  let value

  const iso8601Match = input.match(iso8601DateTimeRE)
  if (iso8601Match !== null) {
    value = createValue(processISO8601DateTime(selfDescription, iso8601Match, localTimezone))
  }

  const rfc2822Match = input.match(rfc2822DateRE)
  if (rfc2822Match !== null) {
    value = createValue(processRFC2822DateTime(selfDescription, rfc2822Match, localTimezone))
  }

  if (value === undefined) {
    value = createValue(processIdiomaticDateTime(selfDescription, input, localTimezone))
  }

  if (noEOD === true && value.isEOD() === true) {
    throw new Error(`${selfDescription} does not allow special EOD time '24:00'.`)
  }

  const validationOptions = Object.assign({ input, name, type: 'string<date-time>' }, options)
  checkValidateInput(input, validationOptions)

  // we compare DateTime objects so we can preserve the timezone in the `limitToString()` function. The problem is that
  // when things are converted to `Date`, the original TZ is lost and `Date.getTimezoneOffset()` always shows the local
  // offset, not the offset of the original date input itself.
  if (typeof max === 'string') {
    max = DateTime(max, { name : `${name}' constraint 'max` })
  } else if (typeof max === 'number') {
    const maxDate = new Date(max)
    max = DateTime(makeDateTimeString([maxDate.getUTCFullYear(), maxDate.getUTCMonth() + 1, maxDate.getUTCDate(), maxDate.getUTCHours(), maxDate.getUTCMinutes(), maxDate.getUTCSeconds(), maxDate.getUTCMilliseconds() / 1000, 'Z']))
  } else if (max instanceof Date) {
    max = DateTime(makeDateTimeString([max.getUTCFullYear(), max.getUTCMonth() + 1, max.getUTCDate(), max.getUTCHours(), max.getUTCMinutes(), max.getUTCSeconds(), max.getUTCMilliseconds() / 1000, 'Z']))
  } else if (max !== undefined && max.isDateTimeObject?.() !== true) {
    throw new Error(`${selfDescription} constraint 'max' has nonconvertible type. Use 'string', 'number', 'Date', or 'DateTime'.`)
  }
  if (typeof min === 'string') {
    min = DateTime(min, { name : `${name}' constraint 'min` })
  } else if (typeof min === 'number') {
    const minDate = new Date(min)
    min = DateTime(makeDateTimeString([minDate.getUTCFullYear(), minDate.getUTCMonth() + 1, minDate.getUTCDate(), minDate.getUTCHours(), minDate.getUTCMinutes(), minDate.getUTCSeconds(), minDate.getUTCMilliseconds() / 1000, 'Z']))
  } else if (min instanceof Date) {
    min = DateTime(makeDateTimeString([min.getUTCFullYear(), min.getUTCMonth() + 1, min.getUTCDate(), min.getUTCHours(), min.getUTCMinutes(), min.getUTCSeconds(), min.getUTCMilliseconds() / 1000, 'Z']))
  } else if (min !== undefined && min.isDateTimeObject?.() !== true) {
    throw new Error(`${selfDescription} constraint 'min' has nonconvertible type. Use 'string', 'number', Date', or 'DateTime'.`)
  }
  checkMaxMin({ input, limitToString, max, min, name, value })

  checkValidateValue(value, validationOptions)

  return value
}

DateTime.description = 'Date-time'
DateTime.toString = () => DateTime.description

const limitToString = (limit) => {
  const year = limit.getYear()
  const month = limit.getMonth()
  const day = limit.getDayOfMonth()
  const hours = limit.getHours()
  const minutes = limit.getMinutes()
  const seconds = limit.getSeconds()
  const fracSeconds = limit.getFractionalSeconds()
  const tz = convertTimezoneOffsetToString(limit.getTimezoneOffset())

  return `${year}/${('' + month).padStart(2, '0')}/${('' + day).padStart(2, '0')} ${hours}:${('' + minutes).padStart(2, '0')}:${('' + seconds).padStart(2, '0')}${('' + fracSeconds).slice(1)} ${tz}`
}

const createValue = ([year, month, day, isEOD, hours, minutes, seconds, fracSeconds, timezoneOffset]) => {
  const tz = convertTimezoneOffsetToString(timezoneOffset)
  const dateString = makeDateTimeString([year, month, day, hours, minutes, seconds, fracSeconds, tz])
  const date = new Date(dateString)

  return {
    isDateTimeObject     : () => true,
    getYear              : () => year,
    getMonth             : () => month,
    getDayOfMonth        : () => day,
    isEOD                : () => isEOD,
    getHours             : () => hours,
    getMinutes           : () => minutes,
    getSeconds           : () => seconds,
    getFractionalSeconds : () => fracSeconds,
    getMilliseconds      : () => Math.round(fracSeconds * 1000),
    getTimezoneOffset    : () => timezoneOffset,
    getDate              : () => date,
    // we return epoch seconds rather than date so that '<' and similar work; the problem is they don't call 'valueOf()'
    // recursively, so if we returned a date, it would compare dates directly (which doesn't work) rather than
    // 'date.valueOf()'
    valueOf              : () => date.getTime()
  }
}

export { DateTime }
