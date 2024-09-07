import { Numeric } from '../numeric'

const validInputs = [
  ['0', undefined, 0],
  ['1', undefined, 1],
  ['-1', undefined, -1],
  ['1.343', undefined, 1.343],
  ['1e2', undefined, 100],
  ['1.55e3', undefined, 1550],
  ['0.5', undefined, 0.5],
  ['01.5', { allowLeadingZeros : true }, 1.5],
  ['1.5', { max : 1.6 }, 1.5],
  ['1.5', { max : 1.5 }, 1.5],
  ['1.5', { min : 1.4 }, 1.5],
  ['1.5', { min : 1.5 }, 1.5],
  ['1.5', { divisibleBy : 0.5 }, 1.5],
  ['1.5', { validateInput : (input) => input.endsWith('5') }, 1.5],
  ['1.5', { validateValue : (value) => value === 1.5 }, 1.5],
  // trimmed values
  [' 1', {}, 1],
  ['1 ', {}, 1],
  ['', {}, undefined],
]

const failureInput = [
  ['01', {}, 'leading zeros'],
  ['1.6', { max : 1.5 }, "less than or equal to '1.5'"],
  ['1.4', { min : 1.5 }, "greater than or equal to '1.5'"],
  ['1.6', { divisibleBy : 1.5 }, "divisible by '1.5'"],
].map((params) => {
  params[1].name = 'foo'
  params[2] = "argument 'foo'.*?" + params[2]

  return params
})

describe('Numeric', () => {
  test.each(validInputs)(
    "'%s' with options %p => %s",
    (input, options, expected) => expect(Numeric(input, options)).toBe(expected)
  )

  test.each(failureInput)(
    'With input %s and options %p throws error matching %s',
    (input, options, errorMatch) =>
      expect(() => Numeric(input, options)).toThrow(new RegExp(errorMatch))
  )

  test.each(failureInput)(
    'With input %s and context %p throws error matching %s',
    (input, context, errorMatch) => {
      context.type = Numeric
      expect(() => context.type(input)).toThrow(new RegExp(errorMatch))
    }
  )
})
