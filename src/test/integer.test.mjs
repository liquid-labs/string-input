import { Integer } from '../integer'
import { standardFailureDataMap } from './lib/standard-failure-data-map'

/**
 * Tests the `Integer` type. The tests drive off two test sets, `validInput` and `failureInput`. `validInput` is tested
 * by passing in the options directly as options. The `failureInput` test both the options and context settings. Also
 * note, the failure condition tests both the specific error messages and that the `name` setting is used in the error
 * message.
 */
describe('Integer', () => {
  const validInput = [
    ['100', undefined, 100],
    ['-12', undefined, -12],
    ['01', { allowLeadingZeros : true }, 1],
    ['01', { allowLeadingZeros : true }, 1],
    ['12', { max : 12 }, 12],
    ['12', { min : 12 }, 12],
    ['12', { divisibleBy : 3 }, 12],
    ['12', { validateInput : (input) => input === '12' }, 12],
    ['12', { validateValue : (value) => value === 12 }, 12],
    ['', {}, undefined],
    ['100', { required : true }, 100],
  ]

  const failureInput = [
    [undefined, {}, "is 'undefined'\\.$"],
    [null, {}, "is 'null'\\.$"],
    [12, {}, "type 'string' is wrong type."],
    ['1.2', {}, 'does not appear to be an integer'],
    ['01', {}, 'does not appear to be an integer'],
    ['foo', {}, 'does not appear to be an integer'],
    [
      '1.2',
      { allowLeadingZeros : true },
      'does not appear to be an integer \\(leading zeros allowed\\)',
    ],
    ['12', { max : 11 }, 'must be less than'],
    ['12', { min : 13 }, 'must be greater than'],
    ['12', { divisibleBy : 5 }, 'must be divisible by'],
    [
      '12',
      { validateInput : (input) => input === '13' },
      'failed custom input validation',
    ],
    [
      '12',
      { validateValue : (value) => value === 13 },
      'failed custom value validation',
    ],
    ['', { required : true }, 'is required\\.$'],
    ['', { required : true, message : 'foo' }, '^foo$', false],
    [1, { message : 'foo' }, '^foo$', false],
  ].map(standardFailureDataMap)
  // ^^ In order to keep the `failureInput` compact, we append the `name` and add the name check to the regex here

  test.each(validInput)(
    'With input %s and options %p yields %s',
    (input, options, expected) => expect(Integer(input, options)).toBe(expected)
  )

  test.each(failureInput)(
    'With input %s and options %p throws error matching %s',
    (input, options, errorMatch) =>
      expect(() => Integer(input, options)).toThrow(new RegExp(errorMatch))
  )

  test.each(failureInput)(
    'With input %s and context %p throws error matching %s',
    (input, context, errorMatch) => {
      context.type = Integer
      expect(() => context.type(input)).toThrow(new RegExp(errorMatch))
    }
  )
})
