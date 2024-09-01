const possibleBooleanValues = ({
  noAbbreviations,
  noNumeric,
  noYesNo,
  treatNegativeValuesAsFalse,
}) => {
  let response = 'true/false'
  if (noAbbreviations !== true) {
    response += ', t/f'
  }
  if (noYesNo !== true) {
    response += ', yes/no'
    if (noAbbreviations !== true) {
      response += ', y/n'
    }
  }
  if (noNumeric !== true) {
    response += ', '
    if (treatNegativeValuesAsFalse === true) {
      response += 'negative number-'
    }
    response += '0/positive number'
  }

  return response.replace(/(.+),([^,]+)+$/, '$1, or$2')
}

export { possibleBooleanValues }
