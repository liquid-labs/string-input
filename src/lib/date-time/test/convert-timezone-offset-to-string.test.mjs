import { convertTimezoneOffsetToString } from '../convert-timezone-offset-to-string'

describe('convertTimezoneOffset', () => {
  test.each([
    [300, '-0500'],
    [-300, '+0500'],
  ])('Offset %s => TZ %s', (offset, tz) =>
    expect(convertTimezoneOffsetToString(offset)).toBe(tz))
})
