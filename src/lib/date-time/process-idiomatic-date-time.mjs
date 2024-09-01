import {
  intlDateReString,
  militaryTimeReString,
  rfc2822DayReString,
  timeReString,
  timezoneReString,
  twentyFourHourTimeReString,
  usDateReString
} from 'regex-repo'
import { ArgumentInvalidError } from 'standard-error-set'

import { convertMonthName } from './convert-month-name'
import { getTimezoneOffset } from './get-timezone-offset'

const processIdiomaticDateTime = (options, input, localTimezone) => {
  const { name, status } = options

  // mil time can easily be confused for the year, so we have to exclude matches to the year
  const milTimeRE = new RegExp(
    `(?<![a-zA-Z]{3}\\s+|[./+-])${militaryTimeReString}(?![./-])(?:\\s*${timezoneReString}\\b)?`
  )
  const milTimeMatch = input.match(milTimeRE)
  const timeRE = new RegExp(`${timeReString}(?:\\s*${timezoneReString}\\b)?`)
  const timeMatch = input.match(timeRE)
  const twentyFourHourTimeRE = new RegExp(
    `${twentyFourHourTimeReString}(?:\\s*${timezoneReString}\\b)?`
  )
  const twentyFourHourTimeMatch = input.match(twentyFourHourTimeRE)

  const timeMatches =
    (milTimeMatch !== null ? 1 : 0)
    + (timeMatch !== null ? 1 : 0)
    + (twentyFourHourTimeMatch !== null ? 1 : 0)

  if (timeMatches === 0) {
    throw new ArgumentInvalidError({
      argumentName  : name,
      argumentValue : input,
      issue         : 'does not contain a recognizable time component',
      status,
    })
  }
  // I don't believe multiple matches is actually possible.

  const rfc2822DayRE = new RegExp(rfc2822DayReString)
  const rfc2822DayMatch = input.match(rfc2822DayRE)
  const usDateRE = new RegExp('\\b' + usDateReString + '\\b')
  const usDateMatch = input.match(usDateRE)
  // can't use '\b' at start because it would match '-' in '-2024/01/01'
  const intlDateRE = new RegExp('(?:^| )' + intlDateReString + '\\b')
  const intlDateMatch = input.match(intlDateRE)

  const dayMatches =
    (rfc2822DayMatch !== null ? 1 : 0)
    + (usDateMatch !== null ? 1 : 0)
    + (intlDateMatch !== null ? 1 : 0)

  if (dayMatches === 0) {
    throw new ArgumentInvalidError({
      argumentName  : name,
      argumentValue : input,
      issue         : 'does not contain a recognizable date component',
      status,
    })
  }
  else if (dayMatches > 1) {
    throw new ArgumentInvalidError({
      argumentName  : name,
      argumentValue : input,
      issue         : 'date component is ambiguous',
      hint          : "Try specifying a 4+ digit year (pad with '0' where necessary).",
      status,
    })
  }

  const ceIndicator = usDateMatch?.[3] || intlDateMatch?.[1] || ''
  const year = parseInt(
    ceIndicator
      + (rfc2822DayMatch?.[4] || usDateMatch?.[4] || intlDateMatch?.[2])
  )
  let month
  if (rfc2822DayMatch !== null) {
    const monthName = rfc2822DayMatch[3]
    month = convertMonthName(monthName)
  }
  else {
    month = parseInt(usDateMatch?.[1] || intlDateMatch?.[3])
  }
  const day = parseInt(
    rfc2822DayMatch?.[2] || usDateMatch?.[2] || intlDateMatch?.[4]
  )

  const isEOD =
    milTimeMatch?.[1] !== undefined
    || twentyFourHourTimeMatch?.[1] !== undefined
    || false
  let hours, minutes, seconds, fractionalSeconds
  if (isEOD === true) {
    hours = 24
    minutes = 0
    seconds = 0
    fractionalSeconds = 0
  }
  else {
    hours = parseInt(
      milTimeMatch?.[2] || timeMatch?.[1] || twentyFourHourTimeMatch?.[2]
    )
    if (timeMatch !== null) {
      hours += timeMatch[5].toLowerCase() === 'am' ? 0 : 12
      if (hours === 24) {
        hours = 0
      }
    }
    minutes = parseInt(
      milTimeMatch?.[3] || timeMatch?.[2] || twentyFourHourTimeMatch?.[3]
    )
    seconds = parseInt(timeMatch?.[3] || twentyFourHourTimeMatch?.[4] || '0')
    fractionalSeconds = Number(
      '0.' + (timeMatch?.[4] || twentyFourHourTimeMatch?.[5] || '0')
    )
  }

  const timezone =
    milTimeMatch?.[4]
    || timeMatch?.[6]
    || twentyFourHourTimeMatch?.[6]
    || localTimezone
  const timezoneOffset = getTimezoneOffset(options, [
    year,
    month,
    day,
    hours,
    minutes,
    seconds,
    fractionalSeconds,
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
    fractionalSeconds,
    timezoneOffset,
  ]
}

export { processIdiomaticDateTime }
