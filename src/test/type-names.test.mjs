import * as types from '../index'

const typeList = Object.entries(types).filter(
  ([name]) => name !== 'getLatestTLDs'
)

test('all exported type functions define description', () =>
  expect(typeList).toHaveLength(Object.keys(types).length - 1))

test.each(typeList)('%s has a defined description', (name, type) =>
  expect(type.description).not.toBe(undefined))
test.each(typeList)('%s defines toString', (name, type) =>
  expect(type.toString).not.toBe(undefined))
test.each(typeList)('%s toString is equal to descripion', (name, type) =>
  expect('' + type).toBe(type.description))
