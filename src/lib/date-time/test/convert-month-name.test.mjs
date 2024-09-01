import { convertMonthName } from '../convert-month-name'

describe('convertMonthName', () => {
  test.each([
    ['Jan', 1],
    ['Feb', 2],
    ['Mar', 3],
    ['Apr', 4],
    ['May', 5],
    ['Jun', 6],
    ['Jul', 7],
    ['Aug', 8],
    ['Sep', 9],
    ['Oct', 10],
    ['Nov', 11],
    ['Dec', 12],
  ])('%s => %s', (monthName, result) =>
    expect(convertMonthName(monthName)).toBe(result))
})
