import { BooleanString } from '../boolean-string'

describe('BooleanString', () => {
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
    ['', {}, undefined],
    ['true', { required: true }, true],
  ]

  const noAbbreviationsRe = /is disallowed abbreviated value\. Use true\/false, yes\/no, or 0\/positive number\.$/
  const noYesNoRe = /is disallowed yes\/no value\. Use true\/false, t\/f, or 0\/positive number\.$/
  const noNumericRe = /is disallowed numeric value. Use true\/false, t\/f, yes\/no, or y\/n\.$/
  const unrecognizedRe = /could not be parsed as a boolean value/

  const invalidInput = [
    // respects 'noAbbreviations'
    ['t', { noAbbreviations : true }, noAbbreviationsRe],
    ['T', { noAbbreviations : true }, noAbbreviationsRe],
    ['f', { noAbbreviations : true }, noAbbreviationsRe],
    ['y', { noAbbreviations : true }, noAbbreviationsRe],
    ['n', { noAbbreviations : true }, noAbbreviationsRe],
    ['Yes', { noYesNo : true }, noYesNoRe],
    ['yes', { noYesNo : true }, noYesNoRe],
    ['no', { noYesNo : true }, noYesNoRe],
    ['y', { noYesNo : true }, noYesNoRe],
    ['n', { noYesNo : true }, noYesNoRe],
    ['0', { noNumeric : true }, noNumericRe],
    ['1', { noNumeric : true }, noNumericRe],
    ['1.0', { noNumeric : true }, noNumericRe],
    ['foo', {}, unrecognizedRe],
    ['trueeeee', {}, unrecognizedRe],
    ['1.0.0', {}, unrecognizedRe],
    ['', { required: true }, /is required\.$/],
  ]

  test.each(validInput)('%s, options %p -> %s', (input, options, expected) =>
    expect(BooleanString(input, options)).toBe(expected))

  test('disallows negative numerics by default', () =>
    expect(() => BooleanString('-1')).toThrow(
      /is ambiguous negative numeric value\. Use true\/false, t\/f, yes\/no, y\/n, or 0\/positive number\.$/
    ))

  test.each(invalidInput)("'%s', options %p -> %s", (input, options, errorMatch) =>
    expect(() => BooleanString(input, options)).toThrow(errorMatch))
})
