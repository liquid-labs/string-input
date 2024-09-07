import { ValidatedString } from '../validated-string'

const validInput = [
  ['foo', undefined],
  ['foo', { after : 'a' }],
  ['foo', { before : 'x' }],
  ['foo', { endsWith : 'oo' }],
  ['foo', { startsWith : 'f' }],
  ['foo', { matchRe : 'foo' }],
  ['foo', { matchRe : /foo/ }],
  ['foo', { maxLength : 4 }],
  ['foo', { maxLength : 3 }],
  ['foo', { minLength : 2 }],
  ['foo', { minLength : 3 }],
  ['foo', { oneOf : ['foo', 'bar'] }],
  ['foo', { validateInput : (input) => input.startsWith('f') }],
  ['foo', { validateValue : (value) => value.startsWith('f') }],
  ['', {}], // this is a special case in the test
]

const failureInput = [
  ['foo', { after : 'm' }, "lexicographically after 'm'"],
  ['foo', { before : 'a' }, "lexicographically before 'a'"],
  ['foo', { endsWith : 'a' }, "must end with 'a'"],
  ['foo', { startsWith : 'a' }, "must start with 'a'"],
  ['foo', { matchRe : 'bar' }, 'must match /bar/'],
  ['foo', { maxLength : 2 }, 'may be no more than 2 characters long'],
  ['foo', { minLength : 4 }, 'must be at least 4 characters long'],
  ['foo', { oneOf : ['a'] }, "must be 'a'"],
  ['foo', { oneOf : ['a', 'b'] }, "must be one of 'a', 'b'"],
  ['foo', { oneOf : 'a, b' }, "must be one of 'a', 'b'"],
  [
    'foo',
    { validateInput : (input) => input.startsWith('a') },
    'failed custom input validation',
  ],
  [
    'foo',
    { validateValue : (value) => value.startsWith('a') },
    'failed custom value validation',
  ],
].map((params) => {
  params[1].name = 'bar'
  params[2] = "argument 'bar'.*?" + params[2]

  return params
})

describe('ValidatedString', () => {
  test.each(validInput)('%s with options %p passes', (input, options) =>
    expect(ValidatedString(input, options)).toBe(input === '' ? undefined : input))

  test.each(failureInput)(
    '%s and options %p throws error matching %s',
    (input, options, errorMatch) =>
      expect(() => ValidatedString(input, options)).toThrow(
        new RegExp(errorMatch)
      )
  )

  test.each(failureInput)(
    '%s and context %p throws error matching %s',
    (input, context, errorMatch) => {
      context.type = ValidatedString
      expect(() => context.type(input)).toThrow(new RegExp(errorMatch))
    }
  )
})
