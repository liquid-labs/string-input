import { rfc2822DateRe } from 'regex-repo'

import { processRFC2822DateTime } from '../process-rfc-2822-date-time'

describe('processRFC2822DateTime', () => {
  test.each([
    ['2 Jan 2024 12:30:40 Z', undefined, [2024, 1, 2, false, 12, 30, 40, 0, 0]],
    [
      '6 Jan 1992 12:13:14 UT',
      undefined,
      [1992, 1, 6, false, 12, 13, 14, 0, 0],
    ],
    [
      '6 Jan 1992 12:13:14 +0100',
      undefined,
      [1992, 1, 6, false, 12, 13, 14, 0, 60],
    ],
    ['6 Jan 1992 12:13:14', '-0200', [1992, 1, 6, false, 12, 13, 14, 0, -120]],
    ['2 Jan 2024 12:30:40', '+0100', [2024, 1, 2, false, 12, 30, 40, 0, 60]],
  ])('RFC 2822 %s (localtz: %s) => %p', (input, tz, result) => {
    const rfc2822Match = input.match(rfc2822DateRe)
    expect(processRFC2822DateTime('Input foo', rfc2822Match, tz)).toEqual(
      result
    )
  })
})
