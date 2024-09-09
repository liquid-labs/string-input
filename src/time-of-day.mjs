import { militaryTimeRe, timeRe, twentyFourHourTimeRe } from 'regex-repo'
import { ArgumentInvalidError } from 'standard-error-set'

import { checkMaxMin } from './lib/check-max-min'
import { checkValidateInput } from './lib/check-validate-input'
import { checkValidateValue } from './lib/check-validate-value'
import { standardChecks } from './lib/standard-checks'

/**
 * Represents the time components.
 * @typedef TimeData
 * @property {function(): boolean} isEod() - Whether or not the time is the special 'end of day' time.
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
 * @param {number} [options.status = 400] - The HTTP status to use when throwing `ArgumentInvalidError` errors.
 *   This can be used to mark arguments specified by in code or configurations without user input.
 * @param {string} options.max - A string, parseable by this function, representing the latest valid time.
 * @param {string} options.min - A string, parseable by this function, representing the earliest valid time.
 * @param {boolean} options.noEod - Disallows the special times '24:00:00', which represents the last moment of the day.
 * @param {Function} [options.validateInput = undefined] - A custom validation function which looks at the original 
 *   input string. See the [custom validation functions](#custom-validation-functions) section for details on input and 
 *   return values.
 * @param {Function} [options.validateValue = undefined] - A custom validation function which looks at the transformed 
 *   value. See the [custom validation functions](#custom-validation-functions) section for details on input and return 
 *   values.
 * @returns {TimeData} The parsed time data.
 */
const TimeOfDay = function (input, options = this || {}) {
  const { name, noEod, status } = options
  let { min, max } = options

  input = standardChecks({ input, name, status, ...options })
  if (input === '') { return undefined }

  const militaryTimeMatch = input.match(militaryTimeRe)
  const timeMatch = input.match(timeRe)
  const twentyFourHourTimeMatch = input.match(twentyFourHourTimeRe)

  if (
    militaryTimeMatch === null
    && timeMatch === null
    && twentyFourHourTimeMatch === null
  ) {
    throw new ArgumentInvalidError({
      argumentName  : name,
      argumentValue : input,
      issue         : 'not recognized as either military, standard, or 24-hour time',
    })
  }

  const isEod =
    militaryTimeMatch?.[1] !== undefined
    || twentyFourHourTimeMatch?.[1] !== undefined
  if (noEod === true) {
    throw new ArgumentInvalidError({
      argumentName : name,
      issue        : "special 'end-of-day' time disallowed",
    })
  }

  const validationOptions = Object.assign(
    { input, name, type : 'string<time>' },
    options
  )
  checkValidateInput(input, validationOptions)

  const value = getValue({
    isEod,
    militaryTimeMatch,
    timeMatch,
    twentyFourHourTimeMatch,
  })

  if (max !== undefined) {
    max = TimeOfDay(max, { name : `${name}' constraint 'max` })
  }

  if (min !== undefined) {
    min = TimeOfDay(min, { name : `${name}' constraint 'min` })
  }
  checkMaxMin({ input, max, min, name, status, value })

  checkValidateValue(value, validationOptions)

  return value
}

const getValue = ({
  isEod,
  militaryTimeMatch,
  timeMatch,
  twentyFourHourTimeMatch,
}) => {
  let hours, minutes, seconds, fracSeconds
  if (isEod === true) {
    hours = 24
    minutes = 0
    seconds = 0
    fracSeconds = 0
  }
  else {
    if (timeMatch !== null) {
      hours =
        parseInt(timeMatch[1]) + (timeMatch[5].toLowerCase() === 'pm' ? 12 : 0)
      if (hours === 24) {
        hours = 0
      }
    }
    else {
      hours = parseInt(militaryTimeMatch?.[2] || twentyFourHourTimeMatch?.[2])
    }
    minutes = parseInt(
      timeMatch?.[2] || militaryTimeMatch?.[3] || twentyFourHourTimeMatch?.[3]
    )
    seconds = parseInt(timeMatch?.[3] || twentyFourHourTimeMatch?.[4] || '0')
    const fracSecondsString =
      timeMatch?.[4] || twentyFourHourTimeMatch?.[5] || '0'
    fracSeconds = Number('0.' + fracSecondsString)
  }

  return {
    isEod                : () => isEod,
    getHours             : () => hours,
    getMinutes           : () => minutes,
    getSeconds           : () => seconds,
    getFractionalSeconds : () => fracSeconds,
    valueOf              : () => hours * 60 * 60 + minutes * 60 + seconds + fracSeconds,
    toString             : () => {
      let time = `${('' + hours).padStart(2, '0')}:${('' + (minutes || '00')).padStart(2, '0')}`
      if (seconds > 0 || fracSeconds > 0) {
        time += (':' + (seconds || '00')).padStart(2, '0')
        if (fracSeconds !== undefined) {
          time += ('' + fracSeconds).slice(1) // cut off leading zero
        }
      }

      return time
    },
  }
}

TimeOfDay.description = 'Time of day'
TimeOfDay.toString = () => TimeOfDay.description

export { TimeOfDay }
