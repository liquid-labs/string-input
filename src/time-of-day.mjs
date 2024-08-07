import { militaryTimeRE, timeRE, twentyFourHourTimeRE } from 'regex-repo'

import { checkMaxMin } from './lib/check-max-min'
import { checkValidateInput } from './lib/check-validate-input'
import { checkValidateValue } from './lib/check-validate-value'
import { describeInput } from './lib/describe-input'
import { typeChecks } from './lib/type-checks'

/**
 * Represents the time components.
 * @typedef TimeData
 * @property {function(): boolean} isEOD() - Whether or not the time is the special 'end of day' time.
 * @property {function(): number} getHours() - The hours component of the date-time (integer).
 * @property {function(): number} getMinutes() - The minutes component of the date-time (integer).
 * @property {function(): number} getSeconds() - The seconds component of the date-time (integer).
 * @property {function(): number} getFractionalSeconds() - The fractional seconds component of the date-time; this will
 *   always be a float less than 1.
 * @property {function(): number} getMilliseconds() - The fractional seconds component of the date-time expressed as
 *   milliseconds (integer).
 * @property {function(): number} valueOf() - Seconds (including fractional seconds) since 00:00:00.
 */

/**
 * Parses and validates the input as a time-of-day. Because there is no date component and some timezones would be
 * ambiguous, this type does not recognize nor accepts timezone specification.
 * @param {string} input - The input string.
 * @param {object} options - The validation options.
 * @param {string} options.name - The 'name' by which to refer to the input when generating error messages for the user.
 * @param {string} options.max - A string, parseable by this function, representing the latest valid time.
 * @param {string} options.min - A string, parseable by this function, representing the earliest valid time.
 * @param {boolean} options.noEOD - Disallows the special times '24:00:00', which represents the last moment of the day.
 * @param {Function} options.validateInput - A custom validation function which looks at the original input string. See
 *   the [custom validation functions](#custom-validation-functions) section for details on input and return values.
 * @param {Function} options.validateValue - A custom validation function which looks at the transformed value. See the
 *   [custom validation functions](#custom-validation-functions) section for details on input and return values.
 * @returns {TimeData} The parsed time data.
 */
const TimeOfDay = function (input, options = this || {}) {
  const { name, noEOD } = options
  let { min, max } = options

  const selfDescription = describeInput('Time of day', name)
  typeChecks(input, selfDescription, name)

  const militaryTimeMatch = input.match(militaryTimeRE)
  const timeMatch = input.match(timeRE)
  const twentyFourHourTimeMatch = input.match(twentyFourHourTimeRE)

  if (militaryTimeMatch === null && timeMatch === null && twentyFourHourTimeMatch === null) {
    throw Error(`${selfDescription} value '${input}' not recognized as either military, standard, or 24-hour time. Try something like '2130', 9:30 PM', or '21:30'.`)
  }

  const isEOD = militaryTimeMatch?.[1] !== undefined || twentyFourHourTimeMatch?.[1] !== undefined
  if (noEOD === true) {
    throw new Error(`${selfDescription} indicates disallowed special 'end-of-day' time.`)
  }

  const validationOptions = Object.assign({ input, selfDescription }, options)
  checkValidateInput(input, validationOptions)

  const value = getValue({ isEOD, militaryTimeMatch, timeMatch, twentyFourHourTimeMatch })

  if (max !== undefined) {
    max = TimeOfDay(max, { name : `${name}' constraint 'max` })
  }
  if (min !== undefined) {
    min = TimeOfDay(min, { name : `${name}' constraint 'min` })
  }
  checkMaxMin({ input, limitToString : limitDescriptor, max, min, selfDescription, value })

  checkValidateValue(value, validationOptions)

  return value
}

const limitDescriptor = (limit) => {
  const hours = limit.getHours()
  const minutes = limit.getMinutes()
  const seconds = limit.getSeconds()
  const fracSeconds = limit.getFractionalSeconds()

  return `${hours}:${('' + minutes).padStart(2, '0')}:${('' + seconds).padStart(2, '0')}${('' + fracSeconds).slice(1)}`
}

const getValue = ({ isEOD, militaryTimeMatch, timeMatch, twentyFourHourTimeMatch }) => {
  let hours, minutes, seconds, fracSeconds
  if (isEOD === true) {
    hours = 24
    minutes = 0
    seconds = 0
    fracSeconds = 0
  } else {
    if (timeMatch !== null) {
      hours = parseInt(timeMatch[1]) + (timeMatch[5].toLowerCase() === 'pm' ? 12 : 0)
      if (hours === 24) {
        hours = 0
      }
    } else {
      hours = parseInt(militaryTimeMatch?.[2] || twentyFourHourTimeMatch?.[2])
    }
    minutes = parseInt(timeMatch?.[2] || militaryTimeMatch?.[3] || twentyFourHourTimeMatch?.[3])
    seconds = parseInt(timeMatch?.[3] || twentyFourHourTimeMatch?.[4] || '0')
    const fracSecondsString = timeMatch?.[4] || twentyFourHourTimeMatch?.[5] || '0'
    fracSeconds = Number('0.' + fracSecondsString)
  }

  return {
    isEOD                : () => isEOD,
    getHours             : () => hours,
    getMinutes           : () => minutes,
    getSeconds           : () => seconds,
    getFractionalSeconds : () => fracSeconds,
    valueOf              : () => (hours * 60 * 60) + (minutes * 60) + seconds + fracSeconds
  }
}

TimeOfDay.description = 'Time of day'

export { TimeOfDay }
