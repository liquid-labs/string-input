# string-input

[![coverage: 100%](./.readme-assets/coverage.svg)](https://github.com/liquid-labs/string-input/pulls?q=is%3Apr+is%3Aclosed) [![Unit tests](https://github.com/liquid-labs/string-input/actions/workflows/unit-tests-node.yaml/badge.svg)](https://github.com/liquid-labs/string-input/actions/workflows/unit-tests-node.yaml)

A library to validate user input strings; compatible with command-line-args.

This package is currently a prototype.

- [Install](#install)
- [Usage](#usage)
- [Empty string handling](#empty-string-handling)
- [Custom validation functions](#custome-validation-functions)
- [Invoking with context](#invoking-with-context)
- [API reference](#api-reference)
- [Common description field and `toString()`](#common-description-field-and-tostring)

## Install

```bash
npm i string-input
```

## Usage

General usage:

```javascript
import { readFileSync } from 'node:fs'
import { Day, Email } from 'string-input'

const csv = readFileSync(process.env.FILE_PATH, { encoding: 'utf8' })
const lines = csv.split('\n') // of course in reality we'd use a library here

for (const line of lines) {
  const [name, email, birthday] = line.split(/\s*,\s*/)
  // validate contents
  Email(email)
  const bdayBoundary = new Date()
  bdayBoundary = bdayBoundary.setYear(bdayBoundary.getFullYear() - 125)
  Day(birthday, { after: bdayBoundary }) // no one's older than 125
}
```

With [command-line-args](https://github.com/75lb/command-line-args#readme) (or similar), you can make set the type options directly on the option specification:

```javascript
import commandLineArgs from 'command-line-args'
import { Day, Email, ValidatedString }

const bdayBoundary = new Date()
bdayBoundary = bdayBoundary.setYear(bdayBoundary.getFullYear() - 125)

const optionSpec = [
  { name: 'name', defaultOption: true, type: ValidatedString, maxLength: 40 },
  { name: 'birthday', type: Date, after: bdayBoundary },
  { name: 'email', type: Email }
]

const options = commandLineArgs(optionSpec)
```

See notes on [invoking with context](#invoking-with-context)

## Empty string handling

By default, all [type functions](#global-function-index) accept the empty string ('') as input, which results in a return value of `undefined`. In that case, no other validation checks are performed except for the `required` validation, which, if true, will cause the type function to reject the empty string and throw `ArgumentMissingError`.

## Custom validation functions

Both `validateInput` and `validateValue` can be used for custom validation. `validateInput` looks at the original input and is called after all other input validations but before `input` is converted to `value`. `validateValue` is then called after any native value validations.

These functions each take two arguments: either the original input or the processed value, respectively, and an options object containing all the original options passed into the type function or set on the context plus `input` (which is useful for `validateValue` which otherwise wouldn't see the original input), if any. E.g.:

```javascript
const options = {
  name: 'email',
  noPlusEmails: true,
  propertyForValidationFunction: 'BAIL OUT!',
  validateInput: (input, { propertyForValidationFunction }) => {
    if (propertyForValidationFunction === 'BAIL OUT!') {
      // on error, we return the 'issue description', which will be used to construct an error message that
      // incorporates the argument name and value
      return `is bailing out`
    }
  },
}
```

The validate functions _must_ return `true` if validated. Any non-`true` result is treated as indicative of failure. If the validation function returns a string, than that is treated as an explanation of the issue and it is embedded in a string like: `${type} ${name} input '${input} ${result}.` E.g., if our validation function returns 'contains offensive words', then the error message raised would be something like, "Email personalEmail input 'asshat@foo.com' contains offensive words."

## Invoking with context

All the functions will take their options either 1) passed in as the second argument or 2) from the `this` context (passed in options override `this` options). This allows you do something like:

```javascript
const context = { allowQuotedLocalPart: true, type: Email }
context.type('"quoted local part"@foo.com') // is valid because `context` is treated as `this`
```

This is how this library integrates with [command-line-args](https://github.com/75lb/command-line-args#readme). You can specify the options right in the option spec and internally, the `type` function is invoked like in our example above.
