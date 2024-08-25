import { Day } from '../day'

describe('Day', () => {
  const validInput = [
    ['2024-01-05', undefined, 2024, 1, 5],
    ['2024-1-2', undefined, 2024, 1, 2],
    ['01-02-2024', undefined, 2024, 1, 2],
    ['1-2-2024', undefined, 2024, 1, 2],
    ['01/02/-2024', undefined, -2024, 1, 2],
    ['-2024.01.02', undefined, -2024, 1, 2],
    ['2 Jan 2024', undefined, 2024, 1, 2],
    ['2 Jan 2024', { max : '3 Jan 2024' }, 2024, 1, 2],
    ['2 Jan 2024', { max : '2 Jan 2024' }, 2024, 1, 2],
    ['2 Jan 2024', { max : new Date(2024, 0, 2) }, 2024, 1, 2],
    ['2 Jan 2024', { max : new Date(2024, 0, 2).getTime() }, 2024, 1, 2],
    ['2 Jan 2024', { max : Day('01/02/2024') }, 2024, 1, 2],
    ['2 Jan 2024', { min : '1 Jan 2024' }, 2024, 1, 2],
    ['2 Jan 2024', { min : '2 Jan 2024' }, 2024, 1, 2],
    ['2 Jan 2024', { min : new Date(2024, 0, 2) }, 2024, 1, 2],
    ['2 Jan 2024', { min : new Date(2024, 0, 2).getTime() }, 2024, 1, 2],
    ['2 Jan 2024', { min : Day('01/02/2024') }, 2024, 1, 2],
    ['2 Jan 2024', { validateInput : (input) => input.endsWith('2024') }, 2024, 1, 2],
    ['2 Jan 2024', { validateValue : (value) => value.getYear() === 2024 }, 2024, 1, 2]
  ]

  const failureInput = [
    [undefined, {}, 'is null or undefined'],
    [null, {}, 'is null or undefined'],
    [12, {}, "Expected type 'string', but received type 'number'.$"],
    ['01.01.01', {}, 'ambiguous'],
    ['foo', {}, 'not recognized'],
    ['2024-02-30', {}, 'invalid day'], // day overflow,
    ['2 Jan 2024', { max : '1 Jan 2024' }, "must be less than or equal to '2024/01/01'"],
    ['2 Jan 2024', { max : new Date(2024, 0, 1) }, "must be less than or equal to '2024/01/01'"],
    ['2 Jan 2024', { max : new Date(2024, 0, 1).getTime() }, "must be less than or equal to '2024/01/01'"],
    ['2 Jan 2024', { max : Day('1 Jan 2024') }, "must be less than or equal to '2024/01/01'"],
    ['2 Jan 2024', { min : '3 Jan 2024' }, "must be greater than or equal to '2024/01/03'"],
    ['2 Jan 2024', { min : new Date(2024, 0, 3) }, "must be greater than or equal to '2024/01/03'"],
    ['2 Jan 2024', { min : new Date(2024, 0, 3).getTime() }, "must be greater than or equal to '2024/01/03'"],
    ['2 Jan 2024', { min : Day('3 Jan 2024') }, "must be greater than or equal to '2024/01/03'"],
    ['2 Jan 2024', { max : 'foo' }, "constraint 'max'.*? not recognized"], // check constraint validation
    ['2 Jan 2024', { max : /invalid type/ }, "constraint 'max'.*?has nonconvertible type"],
    ['2 Jan 2024', { min : 'foo' }, "constraint 'min'.*? not recognized"],
    ['2 Jan 2024', { min : /invalid type/ }, "constraint 'min'.*?has nonconvertible type"],
    ['2 Jan 2024', { validateInput : (input) => input.endsWith('2023') }, 'failed custom input validation'],
    ['2 Jan 2024', { validateValue : (value) => value.getYear() === 2023 }, 'failed custom value validation']
  ].map((params) => { params[1].name = 'foo'; params[2] = "argument 'foo'.*?" + params[2]; return params })

  test.each(validInput)('%s and options %p => year: %p, month: %p, day of month: %p',
    (input, options, year, month, dayOfMonth) => {
      const day = Day(input, options)
      expect(day.getYear()).toBe(year)
      expect(day.getMonth()).toBe(month)
      expect(day.getDayOfMonth()).toBe(dayOfMonth)
    }
  )

  test.each(failureInput)('%s and options %p throws error matching %s', (input, options, errorMatch) =>
    expect(() => Day(input, options)).toThrow(new RegExp(errorMatch)))

  test.each(failureInput)('%s and context %p throws error matching %s', (input, context, errorMatch) => {
    context.type = Day
    expect(() => context.type(input)).toThrow(new RegExp(errorMatch))
  })

  test("Explicit name overrides 'this' context", () => {
    const obj = { name : 'foo', type : Day }
    expect(() => obj.type(undefined, { name : 'bar' })).toThrow(/argument 'bar'/)
  })

  test('Result valueOf() return epoch seconds',
    () => expect(Day('1 Jan 2024').valueOf()).toBe(new Date('1 Jan 2024').getTime()))
})
