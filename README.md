# string-input

[![coverage: 100%](./.readme-assets/coverage.svg)](https://github.com/liquid-labs/string-input/pulls?q=is%3Apr+is%3Aclosed) [![Unit tests](https://github.com/liquid-labs/string-input/actions/workflows/unit-tests-node.yaml/badge.svg)](https://github.com/liquid-labs/string-input/actions/workflows/unit-tests-node.yaml)

A library to validate user input strings; compatible with command-line-args.

This package is currently a prototype.

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
##  API reference
_API generated with [dmd-readme-api](https://www.npmjs.com/package/dmd-readme-api)._

<span id="global-function-index"></span>
- Functions:
  - [`BooleanString()`](#BooleanString): Parses and validates an input string as a boolean.
  - [`CardNumber()`](#CardNumber): Validates an input string as a syntactically valid card number.
  - [`DateTime()`](#DateTime): Parses and validates a wide range of date-time formats.
  - [`Day()`](#Day): Parses and validates input string as a specific day (date).
  - [`EIN()`](#EIN): Validates the input as a valid EIN.
  - [`Email()`](#Email): Parses and validates an input string as a valid email address according to RFC 5322 (email messaging), RFC 6531/6532 (internationalized email), and RFC 5890 (internationalized domain names).
  - [`getLatestTLDs()`](#getLatestTLDs): Dynamically retrieves the latest list of valid TLDs from the Internet Assigned Numbers Authority (IANA).
  - [`Integer()`](#Integer): Parses and validates an input string as an integer.
  - [`Numeric()`](#Numeric): Parses and validates an input string as a valid number (float).
  - [`SSN()`](#SSN): Parses and validates a string as a valid Social Security Number, with our without dashes.
  - [`TimeOfDay()`](#TimeOfDay): Parses and validates the input as a time-of-day.
  - [`ValidatedString()`](#ValidatedString): Validates a string according to the provided options.
<span id="global-typedef-index"></span>
- Typedefs:
  - [`DateTimeData`](#DateTimeData): Date-time components.
  - [`DayData`](#DayData): Represents the components of specific day.
  - [`EmailData`](#EmailData): Email address and components.
  - [`TimeData`](#TimeData): Represents the time components.

<a id="BooleanString"></a>
### `BooleanString(input, options)` ⇒ `boolean` <sup>↱<sup>[source code](./src/boolean-string.mjs#L28)</sup></sup> <sup>⇧<sup>[global function index](#global-function-index)</sup></sup>

Parses and validates an input string as a boolean. By default recognizes true/t/yes/y/any positive number as `true`
and false/f/no/n/0 as `false` (case insensitive).


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| `input` | `string` |  | The input string. |
| `options` | `object` |  | The validation options. |
| `options.name` | `string` |  | The 'name' by which to refer to the input when generating error messages for the user. |
| [`options.failureStatus`] | `number` | `400` | The HTTP status to use when throwing `ArgumentInvalidError` errors.   This can be used to mark arguments specified by in code or configurations without user input. |
| `options.noAbbreviations` | `boolean` |  | = Disallow t/f/y/n responses. |
| `options.noNumeric` | `boolean` |  | Disallow numeric answers. |
| `options.noYesNo` | `boolean` |  | Disallow yes/no/y/n responses. |
| `options.treatNegativeValuesAsFalse` | `boolean` |  | When true, inputs that parse as a negative numeric value will   be treated as `false` instead of raising an exception. |
| `options.validateInput` | `function` |  | A custom validation function which looks at the original input string. See   the [custom validation functions](#custom-validation-functions) section for details on input and return values. |
| `options.validateValue` | `function` |  | A custom validation function which looks at the transformed value. See the   [custom validation functions](#custom-validation-functions) section for details on input and return values. |

**Returns**: `boolean` - A primitive boolean.

<a id="CardNumber"></a>
### `CardNumber(input, options)` ⇒ `string` <sup>↱<sup>[source code](./src/card-number.mjs#L30)</sup></sup> <sup>⇧<sup>[global function index](#global-function-index)</sup></sup>

Validates an input string as a syntactically valid card number.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| `input` | `string` |  | The input string. |
| `options` | `object` |  | The validation options. |
| `options.name` | `string` |  | The 'name' by which to refer to the input when generating error messages for the user. |
| [`options.failureStatus`] | `number` | `400` | The HTTP status to use when throwing `ArgumentInvalidError` errors.   This can be used to mark arguments specified by in code or configurations without user input. |
| `options.iins` | `Array.<string>` |  | A list of acceptable Industry Identifier Numbers, or initial card numbers. E.g.,   iins : ['123']` would only accept cards with an account number starting with '123'. If left undefined, then all   otherwise valid card numbers are treated as valid. |
| `options.length` | `Array.<number>` |  | An array of integers defining acceptable card lengths. The default value is any   length between 12 and 19, inclusive.` |
| `options.validateInput` | `function` |  | A custom validation function which looks at the original input string. See   the [custom validation functions](#custom-validation-functions) section for details on input and return values. |
| `options.validateValue` | `function` |  | A custom validation function which looks at the transformed value. See the   [custom validation functions](#custom-validation-functions) section for details on input and return values. |

**Returns**: `string` - A number-string with no delimiters. Note, there are valid card numbers beginning with 0.

<a id="DateTime"></a>
### `DateTime(input, options)` ⇒ [`DateTimeData`](#DateTimeData) <sup>↱<sup>[source code](./src/date-time.mjs#L59)</sup></sup> <sup>⇧<sup>[global function index](#global-function-index)</sup></sup>

Parses and validates a wide range of date-time formats. Accepts RFC 8601 style date times (e.g.:
`2024-01-01T12:30:00Z`) as well RFC-2822 style dates (e.g., '1 Jan 2024'), year-first, and US style dates combined
with standard (AP/PM), twenty-four hour, and military time designations in either '[date] [time]' or '[time] [date]'
order.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| `input` | `string` |  | The input string. |
| `options` | `object` |  | The validation options. |
| `options.name` | `string` |  | The 'name' by which to refer to the input when generating error messages for the user. |
| [`options.failureStatus`] | `number` | `400` | The HTTP status to use when throwing `ArgumentInvalidError` errors.   This can be used to mark arguments specified by in code or configurations without user input. |
| `options.localTimezone` | `string` |  | For otherwise valid date time input with no time zone component, then the   `localTimeZone` must be specified as an option. This value is only used if the timezone is not specified in the   input string and any timezone specified in the input string will override this value. |
| `options.min` | `string` \| `number` \| `Date` |  | The earliest valid time, inclusive. This may be specified as any string   parseable by this function, milliseconds since the epoch (UTC), or a Date object. |
| `options.max` | `string` \| `number` \| `Date` |  | The latest valid time, inclusive. This may be specified as any string   parseable by this function, milliseconds since the epoch (UTC), or a Date object. |
| `options.noEOD` | `boolean` |  | Disallows the special times '24:00:00', which represents the last moment of the day. |
| `options.validateInput` | `function` |  | A custom validation function which looks at the original input string. See   the [custom validation functions](#custom-validation-functions) section for details on input and return values. |
| `options.validateValue` | `function` |  | A custom validation function which looks at the transformed value. See the   [custom validation functions](#custom-validation-functions) section for details on input and return values. |

**Returns**: [`DateTimeData`](#DateTimeData) - The date-time data.

<a id="Day"></a>
### `Day(input, options)` ⇒ [`DayData`](#DayData) <sup>↱<sup>[source code](./src/day.mjs#L39)</sup></sup> <sup>⇧<sup>[global function index](#global-function-index)</sup></sup>

Parses and validates input string as a specific day (date). Can handle year first and US format, with or without
delimiters, along with RFC 2822 style dates like '1 Jan 2024'.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| `input` | `string` |  | The input string. |
| `options` | `object` |  | The validation options. |
| `options.name` | `string` |  | The 'name' by which to refer to the input when generating error messages for the user. |
| `options.max` | `string` \| `number` \| `Date` |  | The latest day to be considered valid. |
| `options.min` | `string` \| `number` \| `Date` |  | The earliest day to be considered valid. |
| [`options.failureStatus`] | `number` | `400` | The HTTP status to use when throwing `ArgumentInvalidError` errors.   This can be used to mark arguments specified by in code or configurations without user input. |
| `options.validateInput` | `function` |  | A custom validation function which looks at the original input string. See   the [custom validation functions](#custom-validation-functions) section for details on input and return values. |
| `options.validateValue` | `function` |  | A custom validation function which looks at the transformed value. See the   [custom validation functions](#custom-validation-functions) section for details on input and return values. |

**Returns**: [`DayData`](#DayData) - The day/date data.

<a id="EIN"></a>
### `EIN(input, options)` ⇒ `string` <sup>↱<sup>[source code](./src/ein.mjs#L21)</sup></sup> <sup>⇧<sup>[global function index](#global-function-index)</sup></sup>

Validates the input as a valid EIN.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| `input` | `string` |  | The input string. |
| `options` | `object` |  | The validation options. |
| `options.name` | `string` |  | The 'name' by which to refer to the input when generating error messages for the user. |
| [`options.failureStatus`] | `number` | `400` | The HTTP status to use when throwing `ArgumentInvalidError` errors.   This can be used to mark arguments specified by in code or configurations without user input. |
| `options.validateInput` | `function` |  | A custom validation function which looks at the original input string. See   the [custom validation functions](#custom-validation-functions) section for details on input and return values. |
| `options.validateValue` | `function` |  | A custom validation function which looks at the transformed value. See the   [custom validation functions](#custom-validation-functions) section for details on input and return values. |

**Returns**: `string` - A canonically formatted EIN 'XX-XXXXXXX'.

<a id="Email"></a>
### `Email(input, options)` ⇒ [`EmailData`](#EmailData) <sup>↱<sup>[source code](./src/email.mjs#L106)</sup></sup> <sup>⇧<sup>[global function index](#global-function-index)</sup></sup>

Parses and validates an input string as a valid email address according to RFC 5322 (email messaging), RFC 6531/6532
(internationalized email), and RFC 5890 (internationalized domain names). Validation happens in two general steps.
First, the input is parsed according to the relevant RFC specifications. If this is successful, then the result will
always contain a `username`,`address`, and either `domain` or `domainLiteral` fields. If these are present, you know
that the email was successfully parsed. The second stage validates the parsed email components against the provided
options or option defaults. Therefore, you can have a situation where an email address is valid according to the
specs and can be parsed without an issue, but is still _invalid_ according to the effective options (or defaults).

By default, the validation restricts possible features in the email address—such as comments and domain
literals—which are not normally wanted in basic email address. In particular, the default options:
- disallow embedded comments,
- disallow domain literal (IP addressing),
- disallow the 'localhost' domain,
- restricts possible TLDs to known good TLDs,
- restricts domain names to valid subdomain and TLDs based on DNS and ICANN rules beyond the email address
specification, and
- performs extra validation for known provider domains google.com and hotmail.com.

Options can be explicitly defined to allow for a more liberal or restrictive validation.

This type uses [true-email-validator](https://github.com/liquid-labs/true-email-validator/) under the hood.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| `input` | `string` |  | The input string. |
| `options` | `object` |  | The validation options. |
| `options.name` | `string` |  | The 'name' by which to refer to the input when generating error messages for the user. |
| [`options.failureStatus`] | `number` | `400` | The HTTP status to use when throwing `ArgumentInvalidError` errors.   This can be used to mark arguments specified by in code or configurations without user input. |
| `options.allowComments` | `boolean` |  | If true, allows embedded comments in the address like '(comment)   john@foo.com', which are disallowed by default. Note, the comments, if present, will be extracted regardless of   this setting, the result `valid` field will just be set false and an issue will be reported. |
| `options.allowAnyDomain` | `boolean` |  | If true, then overrides all default restrictions and format checks of the   domain value and allows any syntactically valid domain value except a localhost name or address (unless   `allowLocalHost` is also set true). Note that impossible sub-domain labels (e.g., a label more than 63 characters   long or a single digit) or TLDs (e.g. '123') will still trigger an invalid result. Otherwise, the domain value is   verified as recognizable as a domain name (as opposed to an IP address, for instance). |
| `options.allowAnyDomainLiteral` | `boolean` |  | If true, then overrides default restrictions and format checks of   domain literal values and allows any syntactically valid domain literal value that is not a localhost address (   unless `allowLocalhost` is also true). In general, domain literal values point to IPV4/6 addresses and the   validation will (when `allowIP4` and/or`allowIPV6` are true), allow valid IP address values but would reject other   domain literal values, unless this value is set true. Note, if this value is true then allowIPV4` and `allowIPV6`   are essentially ignored. |
| `options.allowIPV4` | `boolean` |  | Allows IPV4 domain literal values. Note that any loopback address will still   cause a validation error unless `allowLocalHost` is also set true. See `allowAnyDomainLiteral`, `allowIPV6`, and  `allowLocahost`.` |
| `options.allowIPV6` | `boolean` |  | Allows IPV6 domain literal values. Note that the localhost address will still   cause a validation error unless `allowLocaHost` is also set true. See `allowAnyDomainLiteral`, `allowIPV4`, and  `allowLocahost`.` |
| `options.allowLocalhost` | `boolean` |  | Allows `localhost` domain value or (when `allowIPV6` and/or `allowIPV4`   also set true) loopback IP addresses. |
| `options.allowedTLDs` | `object.<string, true>` |  | By default, the TLD portion of a domain name will be validated   against known good TLDs. To limit this list or use an updated list, set this value to an array of acceptable TLDs   or a map with valid TLD keys (the value is not used). You can use the `getLatestTLDs`, also exported by this   package, to get an object defining the most current TLDs as registered with ICANN. See `arbitraryTLDs`. |
| `options.allowQuotedLocalPart` | `boolean` |  | Overrides default restriction and allows quoted username/local parts. |
| `options.arbitraryTLDs` | `boolean` |  | Skips the 'known TLD' check and allows any validly formatted TLD name. This   is still restricted by the TLD name restrictions which are tighter than standard domain labels. |
| `options.excludeChars` | `boolean` |  | Either a string or array of excluded characters. In the array form, it will   match the whole string, so you can also use this to exclude specific character sequences. |
| `options.excludeDomains` | `boolean` |  | An array of domains to exclude. Excluding a domain also excludes all   subdomains so eclxuding 'foo.com' would exclude 'john@foo.com' and 'john@bar.foo.com'. Initial periods are ignored   so `excludeDomains: ['com']', and `excludeDomains: ['.com']` are equivalent. |
| `options.noDomainSpecificValidation` | `boolean` |  | Setting this to true will skip domain specific validations. By   default, the validation includes domain specific checks for 'google.com' and 'hotmail.com' domains. These domains   are known to have more restrictive policies regarding what is and is not a valid email address. |
| `options.noLengthCheck` | `boolean` |  | If true, then skips username (local part) and total email address length   restrictions. Note that domain name label lengths are still enforced. |
| `options.noPlusEmails` | `boolean` |  | If true, then '+' is not allowed in the username/local part. This is   equivalent to setting `excludeChars = '+'.` |
| `options.noTLDOnly` | `boolean` |  | If true, then disallows TLD only domains in an address like 'john@com'. |
| `options.noNonASCIILocalPart` | `boolean` |  | If true, then disallows non-ASCII/international characters in the   username/local part of the address. |
| `options.validateInput` | `function` |  | A custom validation function which looks at the original input string. See   the [custom validation functions](#custom-validation-functions) section for details on input and return values. |
| `options.validateValue` | `function` |  | A custom validation function which looks at the transformed value. See the   [custom validation functions](#custom-validation-functions) section for details on input and return values. |

**Returns**: [`EmailData`](#EmailData) - Email data object.

<a id="getLatestTLDs"></a>
### `getLatestTLDs()` ⇒ `Promise.<object>` <sup>↱<sup>[source code](./src/email.mjs#L152)</sup></sup> <sup>⇧<sup>[global function index](#global-function-index)</sup></sup>

Dynamically retrieves the latest list of valid TLDs from the Internet Assigned Numbers Authority (IANA).
International domains are decoded and both the decoded (international domain) and encoded ('xn--`) domain will be
present in the results object as both represent valid domains from a user's point of view. The resolved result can
be passed to the `Email` ``

**Returns**: `Promise.<object>` - A Promise resolving to an object whose keys are valid domains; the value of each entry
  is `true`. ASCII characters are always lowercased, but the international domains are not transformed after
  decoding and may contain uppercase non-ASCII unicode characters per [RFC 4343](https://www.rfc-editor.org/rfc/
  rfc4343).

<a id="Integer"></a>
### `Integer(input, options)` ⇒ `number` <sup>↱<sup>[source code](./src/integer.mjs#L29)</sup></sup> <sup>⇧<sup>[global function index](#global-function-index)</sup></sup>

Parses and validates an input string as an integer.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| `input` | `string` |  | The input string. |
| `options` | `object` |  | The validation options. |
| `options.name` | `string` |  | The 'name' by which to refer to the input when generating error messages for the user. |
| [`options.failureStatus`] | `number` | `400` | The HTTP status to use when throwing `ArgumentInvalidError` errors.   This can be used to mark arguments specified by in code or configurations without user input. |
| `options.allowLeadingZeros` | `boolean` |  | Overrides default behavior which rejects strings with leading zeros. |
| `options.divisibleBy` | `number` |  | Requires the resulting integer value be divisible by the indicated number (   which need not itself be an integer). |
| `options.max` | `number` |  | The largest value considered valid. |
| `options.min` | `number` |  | The smallest value considered valid. |
| `options.validateInput` | `function` |  | A custom validation function which looks at the original input string. See   the [custom validation functions](#custom-validation-functions) section for details on input and return values. |
| `options.validateValue` | `function` |  | A custom validation function which looks at the transformed value. See the   [custom validation functions](#custom-validation-functions) section for details on input and return values. |

**Returns**: `number` - A primitive integer.

<a id="Numeric"></a>
### `Numeric(input, options)` ⇒ `number` <sup>↱<sup>[source code](./src/numeric.mjs#L28)</sup></sup> <sup>⇧<sup>[global function index](#global-function-index)</sup></sup>

Parses and validates an input string as a valid number (float).


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| `input` | `string` |  | The input string. |
| `options` | `object` |  | The validation options. |
| `options.name` | `string` |  | The 'name' by which to refer to the input when generating error messages for the user. |
| [`options.failureStatus`] | `number` | `400` | The HTTP status to use when throwing `ArgumentInvalidError` errors.   This can be used to mark arguments specified by in code or configurations without user input. |
| `options.allowLeadingZeros` | `boolean` |  | Overrides default behavior which rejects strings with leading zeros. |
| `options.divisibleBy` | `number` |  | Requires the resulting integer value be divisible by the indicated number (   which need not be an integer). |
| `options.max` | `number` |  | The largest value considered valid. |
| `options.min` | `number` |  | The smallest value considered valid. |
| `options.validateInput` | `function` |  | A custom validation function which looks at the original input string. See   the [custom validation functions](#custom-validation-functions) section for details on input and return values. |
| `options.validateValue` | `function` |  | A custom validation function which looks at the transformed value. See the   [custom validation functions](#custom-validation-functions) section for details on input and return values. |

**Returns**: `number` - A primitive number.

<a id="SSN"></a>
### `SSN(input, options)` ⇒ `string` <sup>↱<sup>[source code](./src/ssn.mjs#L21)</sup></sup> <sup>⇧<sup>[global function index](#global-function-index)</sup></sup>

Parses and validates a string as a valid Social Security Number, with our without dashes.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| `input` | `string` |  | The input string. |
| `options` | `object` |  | The validation options. |
| `options.name` | `string` |  | The 'name' by which to refer to the input when generating error messages for the user. |
| [`options.failureStatus`] | `number` | `400` | The HTTP status to use when throwing `ArgumentInvalidError` errors.   This can be used to mark arguments specified by in code or configurations without user input. |
| `options.validateInput` | `function` |  | A custom validation function which looks at the original input string. See   the [custom validation functions](#custom-validation-functions) section for details on input and return values. |
| `options.validateValue` | `function` |  | A custom validation function which looks at the transformed value. See the   [custom validation functions](#custom-validation-functions) section for details on input and return values. |

**Returns**: `string` - A canonically formatted SSN like 'XX-XXX-XXXX'.

<a id="TimeOfDay"></a>
### `TimeOfDay(input, options)` ⇒ [`TimeData`](#TimeData) <sup>↱<sup>[source code](./src/time-of-day.mjs#L40)</sup></sup> <sup>⇧<sup>[global function index](#global-function-index)</sup></sup>

Parses and validates the input as a time-of-day. Because there is no date component and some timezones would be
ambiguous, this type does not recognize nor accepts timezone specification.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| `input` | `string` |  | The input string. |
| `options` | `object` |  | The validation options. |
| `options.name` | `string` |  | The 'name' by which to refer to the input when generating error messages for the user. |
| [`options.failureStatus`] | `number` | `400` | The HTTP status to use when throwing `ArgumentInvalidError` errors.   This can be used to mark arguments specified by in code or configurations without user input. |
| `options.max` | `string` |  | A string, parseable by this function, representing the latest valid time. |
| `options.min` | `string` |  | A string, parseable by this function, representing the earliest valid time. |
| `options.noEOD` | `boolean` |  | Disallows the special times '24:00:00', which represents the last moment of the day. |
| `options.validateInput` | `function` |  | A custom validation function which looks at the original input string. See   the [custom validation functions](#custom-validation-functions) section for details on input and return values. |
| `options.validateValue` | `function` |  | A custom validation function which looks at the transformed value. See the   [custom validation functions](#custom-validation-functions) section for details on input and return values. |

**Returns**: [`TimeData`](#TimeData) - The parsed time data.

<a id="ValidatedString"></a>
### `ValidatedString(input, options)` ⇒ `string` <sup>↱<sup>[source code](./src/validated-string.mjs#L29)</sup></sup> <sup>⇧<sup>[global function index](#global-function-index)</sup></sup>

Validates a string according to the provided options. This is useful when there's not a pre-built type like `Email`.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| `input` | `string` |  | The input string. |
| `options` | `object` |  | The validation options. |
| `options.name` | `string` |  | The 'name' by which to refer to the input when generating error messages for the user. |
| [`options.failureStatus`] | `number` | `400` | The HTTP status to use when throwing `ArgumentInvalidError` errors.   This can be used to mark arguments specified by in code or configurations without user input. |
| `options.after` | `string` |  | The input must be or lexicographically sort after this string. |
| `options.before` | `string` |  | The input must be or lexicographically sort before this string. |
| `options.endsWith` | `string` |  | The input string must end with the indicated string. |
| `options.maxLength` | `number` |  | The longest valid input string in terms of characters. |
| `options.matchRe` | `string` \| `RegExp` |  | The input string must match the provided regular expression. Specifying a   string which is an invalid regular expression will cause an exception to be thrown. |
| `options.minLength` | `number` |  | The shortest valid input string in terms of characters. |
| `options.oneOf` | `Array.<string>` |  | The input string must be exactly one of the members of this array. |
| `options.startsWith` | `string` |  | The input string must start with the indicated string. |
| `options.validateInput` | `function` |  | A custom validation function which looks at the original input string. See   the [custom validation functions](#custom-validation-functions) section for details on input and return values. |
| `options.validateValue` | `function` |  | A custom validation function which looks at the transformed value. See the   [custom validation functions](#custom-validation-functions) section for details on input and return values. |

**Returns**: `string` - Returns the input.

<a id="DateTimeData"></a>
### `DateTimeData` : `object` <sup>↱<sup>[source code](./src/date-time.mjs#L14)</sup></sup> <sup>⇧<sup>[global typedef index](#global-typedef-index)</sup></sup>

Date-time components.

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| `isDateTimeObject()` | `function` | Used for duck-typing. Always returns true. |
| `getYear()` | `function` | The year component of the date-time (integer). |
| `getMonth()` | `function` | The month of the year (1-indexed; integer). |
| `getDayOfMonth()` | `function` | The numerical day of the month (integer). |
| `isEOD()` | `function` | Whether or not the time is the special 'end of day' time. |
| `getHours()` | `function` | The hours component of the date-time (integer). |
| `getMinutes()` | `function` | The minutes component of the date-time (integer). |
| `getSeconds()` | `function` | The seconds component of the date-time (integer). |
| `getFractionalSeconds()` | `function` | The fractional seconds component of the date-time. |
| `getMilliseconds()` | `function` | The fractional seconds component of the date-time expressed as   milliseconds (integer). |
| `getTimezoneOffset()` | `function` | The timezone offset of the original input string in minutes.   May be positive, or negative (integer). |
| `getDate()` | `function` | A `Date` object corresponding to the original input string. |
| `valueOf()` | `function` | The milliseconds since the epoch (UTC) represented by the original   input string (integer). |

<a id="DayData"></a>
### `DayData` <sup>↱<sup>[source code](./src/day.mjs#L10)</sup></sup> <sup>⇧<sup>[global typedef index](#global-typedef-index)</sup></sup>

Represents the components of specific day.

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| `isDateTimeObject()` | `function` | Used for duck-typing. Always returns true. |
| `getYear()` | `function` | The year component of the date-time (integer). |
| `getMonth()` | `function` | The month of the year (1-indexed) (integer). |
| `getDayOfMonth()` | `function` | The numerical day of the month (integer). |
| `getDate()` | `function` | A `Date` object corresponding to the original input string. The time   components of the `Date` will all be set to 0 and the timezone is always UTC. |
| `valueOf()` | `function` | The seconds since the epoch (UTC) represented by the original input   string (at the start of the UTC day). |

<a id="EmailData"></a>
### `EmailData` <sup>↱<sup>[source code](./src/email.mjs#L6)</sup></sup> <sup>⇧<sup>[global typedef index](#global-typedef-index)</sup></sup>

Email address and components.

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| `address` | `string` | The normalized email address. The domain portion, if any, will always be in lowercase (   the `domain` property will preserve the original case). |
| `username` | `string` | The username or local part of the email address. |
| `domain` | `string` \| `undefined` | The domain value, if present. Exactly one of `domain` and `domainLiteral` will   always be defined for a syntactically valid email address. The original case of the domain is preserved. |
| `domainLiteral` | `string` \| `undefined` | The domain literal value, if present. Exactly one of `domain` and   `domainLiteral` will always be defined for a syntactically valid email address. |
| `commentLocalPartPrefix` | `string` \| `undefined` | The embedded comment, if any, immediately before the address   username (local part). |
| `commentLocalPartSuffix` | `string` \| `undefined` | The embedded comment, if any, immediately following the   address username (local part). |
| `commentDomainPrefix` | `string` \| `undefined` | The embedded comment, if any, immediately before the domain or   domain literal. |
| `commentDomainSuffix` | `string` \| `undefined` | The embedded comment, if any, immediately after the domain or   domain literal. |

<a id="TimeData"></a>
### `TimeData` <sup>↱<sup>[source code](./src/time-of-day.mjs#L9)</sup></sup> <sup>⇧<sup>[global typedef index](#global-typedef-index)</sup></sup>

Represents the time components.

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| `isEOD()` | `function` | Whether or not the time is the special 'end of day' time. |
| `getHours()` | `function` | The hours component of the date-time (integer). |
| `getMinutes()` | `function` | The minutes component of the date-time (integer). |
| `getSeconds()` | `function` | The seconds component of the date-time (integer). |
| `getFractionalSeconds()` | `function` | The fractional seconds component of the date-time; this will   always be a float less than 1. |
| `getMilliseconds()` | `function` | The fractional seconds component of the date-time expressed as   milliseconds (integer). |
| `valueOf()` | `function` | Seconds (including fractional seconds) since 00:00:00. |

## Common description field and `toString()`

All the type functions provide a `description` field for use in reporting issues or describing the type. E.g., `EIN.description = 'EIN'`. They also override the `toString()` function, which will print the description.
