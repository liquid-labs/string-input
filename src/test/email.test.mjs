import { Email } from '../email'

const validInput = [
  ['foo@bar.com', undefined, 'foo@bar.com'],
  ['foo+bar@baz.com', undefined, 'foo+bar@baz.com'],
  ['Foo@BAR.COM', undefined, 'Foo@bar.com'],
  ['"foo\\@bar"@baz.com', { allowQuotedLocalPart : true }, '"foo\\@bar"@baz.com'],
  ['(comment)foo@bar.com', { allowComments : true }, 'foo@bar.com'],
  ['foo@(comment)bar.com', { allowComments : true }, 'foo@bar.com'],
  ['foo@bar.com', { noPlusEmails : true }, 'foo@bar.com'],
  ['foo@bar.com', { restrictToKnownTLDs : true }, 'foo@bar.com'],
  ['foo@BAR.COM', { validateInput : (input) => input.endsWith('BAR.COM') }, 'foo@bar.com'],
  ['foo@BAR.COM', { validateValue : (value) => value.address.endsWith('bar.com') }, 'foo@bar.com']
]

const failureInput = [
  ['foo(@bar.com', {}, 'not recognized as a valid email address'],
  ['foo\\@bar.com', {}, 'not recognized as a valid email address'],
  ['foo bar@baz.com', {}, 'not recognized as a valid email address'],
  ['foo.@baz.com', {}, 'not recognized as a valid email address'],
  ['.foo@baz.com', {}, 'not recognized as a valid email address'],
  ['f..oo@baz.com', {}, 'not recognized as a valid email address'],
  ['(comment)foo@bar.com', {}, 'contains disallowed comment'],
  ['"foo\\@bar"@baz.com', {}, 'uses disallowed quoted username'],
  ['f@oo@baz.com', {}, "parsed as a 'partial' address"],
  ['foo+bar@baz.com', { noPlusEmails : true }, "contains excluded character '\\+' in username"],
  ['foo@bar.notavalidtld', { restrictToKnownTLDs : true }, "contains unknown TLD 'notavalidtld'"],
  ['foo@baz.com', { validateInput : (input) => input.startsWith('2') }, 'failed custom input validation'],
  ['foo@baz.com', { validateValue : (value) => value.address.startsWith('2') }, 'failed custom result validation'],
  ['foo@baz.com', { validateInput : () => undefined }, 'failed custom input validation'],
  ['foo@baz.com', { validateValue : () => undefined }, 'failed custom result validation'],
  ['foo@baz.com',
    {
      validateInput      : (input, { validationProperty }) => `secret is ${validationProperty}`,
      validationProperty : 'abc'
    },
    'secret is abc'],
  ['foo@baz.com',
    {
      validateValue      : (value, { validationProperty }) => `secret is ${validationProperty}`,
      validationProperty : 'abc'
    },
    'secret is abc'],
  ['foo@baz.com', { validateValue : () => undefined }, 'failed custom result validation']
].map((params) => { params[1].name = 'foo'; params[2] = "Email 'foo'.*?" + params[2]; return params })

describe('Email', () => {
  test.each(validInput)('%s with options %p => %s',
    (input, options, expected) => expect(Email(input, options).address).toBe(expected))

  test.each(failureInput)('%s and options %p throws error matching %s', (input, options, errorMatch) =>
    expect(() => Email(input, options)).toThrow(new RegExp(errorMatch)))

  test.each(failureInput)('%s and context %p throws error matching %s', (input, context, errorMatch) => {
    context.type = Email
    expect(() => context.type(input)).toThrow(new RegExp(errorMatch))
  })
})
