const convertTimezoneOffsetToString = (offset) => {
  const tzHrs = Math.trunc(offset / 60)
  const tzMins = offset % 60
  // Note, the offset is reversed from the string. Eg, a positive offset of 300 would translate to -0500. The offset
  // shows the difference between UTC and local, so if you're behind, then that's positive. But the TZ string does the
  // opposite.
  const tz =
    (offset <= 0 ? '+' : '-')
    + ('' + Math.abs(tzHrs)).padStart(2, '0')
    + ('' + Math.abs(tzMins)).padStart(2, '0')

  return tz
}

export { convertTimezoneOffsetToString }
