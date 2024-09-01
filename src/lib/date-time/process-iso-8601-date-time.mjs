import { ArgumentInvalidError } from 'standard-error-set'

import { getTimezoneOffset } from './get-timezone-offset'

const fracSecondsPrecision = 100000

const processISO8601DateTime = (options, iso8601Match, localTimezone) => {
  const { name, status } = options

  if (iso8601Match[5] !== undefined) {
    throw new ArgumentInvalidError({
      argumentName : name,
      issue        : 'does not support week of year style dates',
      status,
    })
  }
  else if (iso8601Match[7] !== undefined) {
    throw new ArgumentInvalidError({
      argumentName : name,
      issue        : 'does not support day of year/ordinal/Julian style dates',
      status,
    })
  }

  const year = parseInt(iso8601Match[1])
  const month = parseInt(iso8601Match[3]) || 1
  const day = parseInt(iso8601Match[4]) || 1
  const isEOD = iso8601Match[8] !== undefined
  const hours = isEOD === true ? 24 : parseInt(iso8601Match[10])
  let minutes, seconds, fracSeconds

  if (
    iso8601Match[11] === undefined
    && iso8601Match[13] === undefined
    && iso8601Match[15] === undefined
  ) {
    minutes = 0
    seconds = 0
    fracSeconds = 0
  }
  else if (iso8601Match[11] !== undefined) {
    // fractional hours
    const fracHours = Number('0.' + iso8601Match[11])
    const realMinutes = 60 * fracHours
    minutes = Math.trunc(realMinutes)
    const fracMinutes = realMinutes % 1
    const realSeconds = 60 * fracMinutes
    seconds = Math.trunc(realSeconds)
    // we can easily get floating point math errors here, so we limit the precision
    fracSeconds = roundFracSeconds(realSeconds)
  }
  else {
    minutes = parseInt(iso8601Match[13])
    if (iso8601Match[14] === undefined && iso8601Match[15] === undefined) {
      seconds = 0
      fracSeconds = 0
    }
    else if (iso8601Match[14] !== undefined) {
      const fracMinutes = Number('0.' + iso8601Match[14])
      const realSeconds = 60 * fracMinutes
      seconds = Math.trunc(realSeconds)
      // we can easily get floating point math errors here, so we limit the precision
      fracSeconds = roundFracSeconds(realSeconds)
    }
    else {
      seconds = parseInt(iso8601Match[15])
      fracSeconds =
        iso8601Match[16] === undefined ? 0 : Number('0.' + iso8601Match[16])
    }
  }

  const timezone = iso8601Match[17] || localTimezone
  const timezoneOffset = getTimezoneOffset(options, [
    year,
    month,
    day,
    hours,
    minutes,
    seconds,
    fracSeconds,
    timezone,
  ])

  return [
    year,
    month,
    day,
    isEOD,
    hours,
    minutes,
    seconds,
    fracSeconds,
    timezoneOffset,
  ]
}

const roundFracSeconds = (realSeconds) =>
  Math.round((realSeconds % 1) * fracSecondsPrecision) / fracSecondsPrecision

export { processISO8601DateTime }
