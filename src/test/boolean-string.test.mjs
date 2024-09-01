import { BooleanString } from '../boolean-string'

const validInput = [
  ['true', undefined, true],
  ['True', undefined, true],
  ['false', undefined, false],
  ['T', undefined, true],
  ['t', undefined, true],
  ['F', undefined, false],
  ['f', undefined, false],
  ['yes', undefined, true],
  ['y', undefined, true],
  ['false', undefined, false],
  ['f', undefined, false],
  ['0', undefined, false],
  ['0.234', undefined, true],
  ['1', undefined, true],
  ['1.2e5', undefined, true],
  ['0e5', undefined, false],
  ['-1', { treatNegativeValuesAsFalse : true }, false],
]

describe('BooleanString', () => {
  test.each(validInput)('%s, options %p -> %s', (input, options, expected) =>
    expect(BooleanString(input, options)).toBe(expected))

  test('disallows negative numerics by default', () =>
    expect(() => BooleanString('-1')).toThrow(
      /is ambiguous negative numeric value\. Use true\/false, t\/f, yes\/no, y\/n, or 0\/positive number\.$/
    ))

  test.each(['t', 'T', 'f', 'y', 'n'])(
    "respects 'noAbbreviations' with input %s",
    (input) =>
      expect(() => BooleanString(input, { noAbbreviations : true })).toThrow(
        /is disallowed abbreviated value\. Use true\/false, yes\/no, or 0\/positive number.$/
      )
  )

  test.each(['Yes', 'yes', 'no', 'y', 'n'])(
    "respects 'noYesNo' with input %s",
    (input) =>
      expect(() => BooleanString(input, { noYesNo : true })).toThrow(
        /is disallowed yes\/no value\. Use true\/false, t\/f, or 0\/positive number\.$/
      )
  )

  test.each(['-1', '0', '1'])("respects 'noNumeric' with input %s'", (input) =>
    expect(() => BooleanString(input, { noNumeric : true })).toThrow(
      /is disallowed numeric value. Use true\/false, t\/f, yes\/no, or y\/n\.$/
    ))

  test.each(['foo', 'trueeee', '1.0.0'])('throws parse error on %s', (input) =>
    expect(() => BooleanString(input)).toThrow(
      /could not be parsed as a boolean value/
    ))
})
