import { ArgumentInvalidError } from 'standard-error-set'

import { makeDateTimeString } from './make-date-time-string'

const getTimezoneOffset = (
  { name, ...options },
  [year, month, day, hours, minutes, seconds, fracSeconds, timezone]
) => {
  if (timezone === undefined) {
    // it's important to test against the date/time itself in case it's in a different daylight savings period than the
    // current
    return new Date(
      makeDateTimeString([
        year,
        month,
        day,
        hours,
        minutes,
        seconds,
        fracSeconds,
      ])
    ).getTimezoneOffset()
  }
  else if (timezone === 'z' || timezone === 'Z') {
    return 0
  }
  else {
    const numericTZMatch = timezone.match(/([+-])(\d{2})(?::?(\d{2}))?/)
    if (numericTZMatch !== null) {
      const offsetDirection = numericTZMatch[1] === '-' ? -1 : 1
      const offsetHours = 60 * parseInt(numericTZMatch[2])
      const offsetMinutes = parseInt(numericTZMatch[3])

      return offsetDirection * (offsetHours + offsetMinutes)
    }
    else {
      // it's a named TZ
      const partialSpec = makeDateTimeString([
        year,
        month,
        day,
        hours,
        minutes,
        seconds,
        fracSeconds,
      ])
      const tzDate = new Date(`${partialSpec} ${timezone}`)
      if (isNaN(tzDate.getDate())) {
        // we assume everything but the TZ is good
        throw new ArgumentInvalidError({
          argumentName : name,
          issue        : 'timezone designation not recognized as valid timezone',
          hint         : "The recognized timezones are limited to basic US timezone like CST and PDT; otherwise it's best to designate the offset like '+1030' or '-0100'.",
          ...options,
        })
      }
      const utcDate = new Date(`${partialSpec} Z`)

      return Math.trunc((utcDate - tzDate) / (1000 * 60))
    }
  }
}

export { getTimezoneOffset }
