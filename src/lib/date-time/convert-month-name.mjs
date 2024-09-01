const convertMonthName = (monthName) => {
  switch (monthName) {
    case 'Jan':
      return 1
    case 'Feb':
      return 2
    case 'Mar':
      return 3
    case 'Apr':
      return 4
    case 'May':
      return 5
    case 'Jun':
      return 6
    case 'Jul':
      return 7
    case 'Aug':
      return 8
    case 'Sep':
      return 9
    case 'Oct':
      return 10
    case 'Nov':
      return 11
    case 'Dec':
      return 12
  }
}

export { convertMonthName }
