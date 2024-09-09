const standardFailureDataMap = (record) => {
  record[1].name = 'foo'
  if (record[3] === false) {
    record.pop()
  }
  else {
    record[2] = "argument 'foo'.*?" + record[2]
  }

  return record
}

export { standardFailureDataMap }
