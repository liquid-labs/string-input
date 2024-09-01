const makeDateTimeString = ([
  year,
  month,
  day,
  hours,
  minutes,
  seconds,
  fracSeconds,
  timezone,
]) => {
  let dtString =
    `${year}-${('' + month).padStart(2, '0')}-${('' + day).padStart(2, '0')} `
    + `${('' + hours).padStart(2, '0')}:${('' + minutes).padStart(2, '0')}:${('' + seconds).padStart(2, '0')}`
    + (fracSeconds > 0 ? ('' + fracSeconds).slice(1) : '')

  if (timezone !== undefined) {
    dtString += ' ' + timezone
  }

  return dtString
}

export { makeDateTimeString }
