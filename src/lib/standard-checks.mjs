import { checkRequired } from './check-required'
import { typeChecks } from './type-checks'

const standardChecks = (options) => {
  typeChecks(options)
  // 'typeChecks()' guarantees we have a string, so this is safe
  options.input = options.input.trim()

  checkRequired(options)

  return options.input
}

export { standardChecks }