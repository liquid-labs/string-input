import { iso8601DateTimeRe } from 'regex-repo'

import { processISO8601DateTime } from '../process-iso-8601-date-time'

describe('processISO8601DateTime', () => {
  test.each([
    ['2024-01-02T12:30:40.50Z', undefined, [2024, 1, 2, false, 12, 30, 40, 0.5, 0]],
    ['2024T12Z', undefined, [2024, 1, 1, false, 12, 0, 0, 0, 0]],
    ['2024-01T12Z', undefined, [2024, 1, 1, false, 12, 0, 0, 0, 0]],
    ['2024-01-02T24:00:00Z', undefined, [2024, 1, 2, true, 24, 0, 0, 0, 0]],
    ['2024-01-02T12Z', undefined, [2024, 1, 2, false, 12, 0, 0, 0, 0]],
    ['2024-01-02T12.5Z', undefined, [2024, 1, 2, false, 12, 30, 0, 0, 0]],
    ['2024-01-02T12.61Z', undefined, [2024, 1, 2, false, 12, 36, 36, 0, 0]],
    ['2024-01-02T12.611Z', undefined, [2024, 1, 2, false, 12, 36, 39, 0.6, 0]],
    ['2024-01-02T12:30Z', undefined, [2024, 1, 2, false, 12, 30, 0, 0, 0]],
    ['2024-01-02T12:30.5Z', undefined, [2024, 1, 2, false, 12, 30, 30, 0, 0]],
    ['2024-01-02T12:30.51Z', undefined, [2024, 1, 2, false, 12, 30, 30, 0.6, 0]],
    ['2024-01-02T12:30:20Z', undefined, [2024, 1, 2, false, 12, 30, 20, 0, 0]],
    ['2024-01-02T12:30:20.51Z', undefined, [2024, 1, 2, false, 12, 30, 20, 0.51, 0]],
    ['2024-01-02T12:30:20.51+0130', undefined, [2024, 1, 2, false, 12, 30, 20, 0.51, 90]],
    ['2024-01-02T12:30:20.51', 'Z', [2024, 1, 2, false, 12, 30, 20, 0.51, 0]],
    ['2024-01-02T12:30:20.51', '-0200', [2024, 1, 2, false, 12, 30, 20, 0.51, -120]]
  ])('ISO 8601 %s (tz: %s) => %p', (input, tz, result) => {
    const iso8601Match = input.match(iso8601DateTimeRe)
    expect(processISO8601DateTime({ name: 'foo' }, iso8601Match, tz)).toEqual(result)
  })

  test("Throws an error when presented with 'week of year' style date", () => {
    const iso8601Match = '2024W051T12:30Z'.match(iso8601DateTimeRe)
    expect(() => processISO8601DateTime({ name: 'foo' }, iso8601Match)).toThrow(/week of year/)
  })

  test("Throws an error when presented with a 'day of year' style date", () => {
    const iso8601Match = '2024012T12:30Z'.match(iso8601DateTimeRe)
    expect(() => processISO8601DateTime({ name: 'foo' }, iso8601Match)).toThrow(/day of year/)
  })
})
