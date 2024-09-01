import { convertMonthName } from './convert-month-name'
import { getTimezoneOffset } from './get-timezone-offset'

const processRFC2822DateTime = (options, rfc2822Match, localTimezone) => {
  const year = parseInt(rfc2822Match[4])
  const monthName = rfc2822Match[3]
  const month = convertMonthName(monthName)
  const day = parseInt(rfc2822Match[2])
  const hours = parseInt(rfc2822Match[5])
  const minutes = parseInt(rfc2822Match[6])
  const seconds = parseInt(rfc2822Match[7])
  const timezone = rfc2822Match[8] || localTimezone

  const timezoneOffset =
    getTimezoneOffset(options, [year, month, day, hours, minutes, seconds, 0, timezone])

  return [year, month, day, /* isEOD */ false, hours, minutes, seconds, 0, timezoneOffset]
}

export { processRFC2822DateTime }
