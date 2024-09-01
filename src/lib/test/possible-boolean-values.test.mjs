import { possibleBooleanValues } from '../possible-boolean-values'

describe('possibleBooleanValues', () => {
  test.each([
    [{}, 'true/false, t/f, yes/no, y/n, or 0/positive number'],
    [
      { treatNegativeValuesAsFalse : true },
      'true/false, t/f, yes/no, y/n, or negative number-0/positive number',
    ],
    [{ noAbbreviations : true }, 'true/false, yes/no, or 0/positive number'],
    [{ noYesNo : true }, 'true/false, t/f, or 0/positive number'],
    [{ noNumeric : true }, 'true/false, t/f, yes/no, or y/n'],
  ])('options %p => %s', (options, expected) =>
    expect(possibleBooleanValues(options)).toBe(expected))
})
