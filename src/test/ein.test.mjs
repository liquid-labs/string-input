import { EIN } from '../ein'

const validInput = [
  ['12-3456789', undefined, '12-3456789'],
  ['123456789', undefined, '12-3456789'],
  [
    '123456789',
    { validateInput : (input) => /^\d+$/.test(input) },
    '12-3456789',
  ],
  ['123456789', { validateValue : (value) => /-/.test(value) }, '12-3456789'],
]

const failureInput = [
  ['12-345678', {}, 'not a valid EIN'],
  ['12-34567890', {}, 'not a valid EIN'],
  ['49-0456789', {}, 'not a valid EIN'],
  [
    '123456789',
    { validateInput : (input) => input.startsWith('2') },
    'failed custom input validation',
  ],
  [
    '123456789',
    { validateValue : (value) => value.startsWith('2') },
    'failed custom value validation',
  ],
  [
    '12-3456789',
    {
      validateInput : (input, { validationProperty }) =>
        `secret is ${validationProperty}`,
      validationProperty : 'abc',
    },
    'secret is abc',
  ],
  [
    '12-3456789',
    {
      validateValue : (value, { validationProperty }) =>
        `secret is ${validationProperty}`,
      validationProperty : 'abc',
    },
    'secret is abc',
  ],
].map((params) => {
  params[1].name = 'foo'
  params[2] = "argument 'foo'.*?" + params[2]

  return params
})

describe('EIN', () => {
  test.each(validInput)(
    '%s with options %p => %s',
    (input, options, expected) => expect(EIN(input, options)).toBe(expected)
  )

  test.each(failureInput)(
    '%s and options %p throws error matching %s',
    (input, options, errorMatch) =>
      expect(() => EIN(input, options)).toThrow(new RegExp(errorMatch))
  )

  test.each(failureInput)(
    '%s and context %p throws error matching %s',
    (input, context, errorMatch) => {
      context.type = EIN
      expect(() => context.type(input)).toThrow(new RegExp(errorMatch))
    }
  )
})
