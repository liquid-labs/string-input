import { getTimezoneOffset } from '../get-timezone-offset'

const getDateComponents = () => {
  const now = new Date()
  return [
    [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds() / 1000],
    now
  ]
}

describe('getTimezoneOffset', () => {
  test('Default to local timezone', () => {
    const [dateComponents, now] = getDateComponents()
    const localTimezoneOffset = now.getTimezoneOffset()
    expect(getTimezoneOffset({ name: 'foo' }, [...dateComponents, undefined])).toBe(localTimezoneOffset)
  })

  test.each([
    ['Z', 0],
    ['CST', -360],
    ['CDT', -300],
    ['-0100', -60],
    ['+0100', +60],
    ['-1030', -630]/*,
    Unfortunately, it looks like Node (21.x) doesn't know about non-US timezones by name?
    ['ECT', 60],
    ['ART', 120] */
  ])('TZ %s => %s', (tz, offset) => {
    const [dateComponents] = getDateComponents()
    expect(getTimezoneOffset({ name: 'foo' }, [...dateComponents, tz])).toBe(offset)
  })

  test('Raises exception if TZ is not recognized', () => {
    const [dateComponents] = getDateComponents()
    expect(() => getTimezoneOffset({ name: 'foo' }, [...dateComponents, 'FOO']))
      .toThrow(/not recognized as valid timezone/)
  })
})
