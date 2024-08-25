import { getLatestTLDs, validateEmail } from 'true-email-validator'

import { describeInput } from './lib/describe-input'
import { typeChecks } from './lib/type-checks'

/**
 * Email address and components.
 * @typedef EmailData
 * @property {string} address - The normalized email address. The domain portion, if any, will always be in lowercase (
 *   the `domain` property will preserve the original case).
 * @property {string} username - The username or local part of the email address.
 * @property {string|undefined} domain - The domain value, if present. Exactly one of `domain` and `domainLiteral` will
 *   always be defined for a syntactically valid email address. The original case of the domain is preserved.
 * @property {string|undefined} domainLiteral - The domain literal value, if present. Exactly one of `domain` and
 *   `domainLiteral` will always be defined for a syntactically valid email address.
 * @property {string|undefined} commentLocalPartPrefix - The embedded comment, if any, immediately before the address
 *   username (local part).
 * @property {string|undefined} commentLocalPartSuffix - The embedded comment, if any, immediately following the
 *   address username (local part).
 * @property {string|undefined} commentDomainPrefix - The embedded comment, if any, immediately before the domain or
 *   domain literal.
 * @property {string|undefined} commentDomainSuffix - The embedded comment, if any, immediately after the domain or
 *   domain literal.
 */

// TODO: ESLint is complaining about 'object<string, true>'; it wants us to use 'object shorthand or index signatures',
// whic would make the spec '{[key: string]: true}', but the JSDoc parser chokes on it (even though lint passes it).
/* eslint-disable jsdoc/check-types */
/**
 * Parses and validates an input string as a valid email address according to RFC 5322 (email messaging), RFC 6531/6532
 * (internationalized email), and RFC 5890 (internationalized domain names). Validation happens in two general steps.
 * First, the input is parsed according to the relevant RFC specifications. If this is successful, then the result will
 * always contain a `username`,`address`, and either `domain` or `domainLiteral` fields. If these are present, you know
 * that the email was successfully parsed. The second stage validates the parsed email components against the provided
 * options or option defaults. Therefore, you can have a situation where an email address is valid according to the
 * specs and can be parsed without an issue, but is still _invalid_ according to the effective options (or defaults).
 *
 * By default, the validation restricts possible features in the email address—such as comments and domain
 * literals—which are not normally wanted in basic email address. In particular, the default options:
 * - disallow embedded comments,
 * - disallow domain literal (IP addressing),
 * - disallow the 'localhost' domain,
 * - restricts possible TLDs to known good TLDs,
 * - restricts domain names to valid subdomain and TLDs based on DNS and ICANN rules beyond the email address
 * specification, and
 * - performs extra validation for known provider domains google.com and hotmail.com.
 *
 * Options can be explicitly defined to allow for a more liberal or restrictive validation.
 *
 * This type uses [true-email-validator](https://github.com/liquid-labs/true-email-validator/) under the hood.
 * @param {string} input - The input string.
 * @param {object} options - The validation options.
 * @param {string} options.name - The 'name' by which to refer to the input when generating error messages for the user.
 * @param {boolean} options.allowComments - If true, allows embedded comments in the address like '(comment)
 *   john@foo.com', which are disallowed by default. Note, the comments, if present, will be extracted regardless of
 *   this setting, the result `valid` field will just be set false and an issue will be reported.
 * @param {boolean}options.allowAnyDomain - If true, then overrides all default restrictions and format checks of the
 *   domain value and allows any syntactically valid domain value except a localhost name or address (unless
 *   `allowLocalHost` is also set true). Note that impossible sub-domain labels (e.g., a label more than 63 characters
 *   long or a single digit) or TLDs (e.g. '123') will still trigger an invalid result. Otherwise, the domain value is
 *   verified as recognizable as a domain name (as opposed to an IP address, for instance).
 * @param {boolean} options.allowAnyDomainLiteral - If true, then overrides default restrictions and format checks of
 *   domain literal values and allows any syntactically valid domain literal value that is not a localhost address (
 *   unless `allowLocalhost` is also true). In general, domain literal values point to IPV4/6 addresses and the
 *   validation will (when `allowIP4` and/or`allowIPV6` are true), allow valid IP address values but would reject other
 *   domain literal values, unless this value is set true. Note, if this value is true then allowIPV4` and `allowIPV6`
 *   are essentially ignored.
 * @param {boolean} options.allowIPV4 - Allows IPV4 domain literal values. Note that any loopback address will still
 *   cause a validation error unless `allowLocalHost` is also set true. See `allowAnyDomainLiteral`, `allowIPV6`, and
 *  `allowLocahost`.`
 * @param {boolean} options.allowIPV6 - Allows IPV6 domain literal values. Note that the localhost address will still
 *   cause a validation error unless `allowLocaHost` is also set true. See `allowAnyDomainLiteral`, `allowIPV4`, and
 *  `allowLocahost`.`
 * @param {boolean} options.allowLocalhost - Allows `localhost` domain value or (when `allowIPV6` and/or `allowIPV4`
 *   also set true) loopback IP addresses.
 * @param {object<string,true>} options.allowedTLDs - By default, the TLD portion of a domain name will be validated
 *   against known good TLDs. To limit this list or use an updated list, set this value to an array of acceptable TLDs
 *   or a map with valid TLD keys (the value is not used). You can use the `getLatestTLDs`, also exported by this
 *   package, to get an object defining the most current TLDs as registered with ICANN. See `arbitraryTLDs`.
 * @param {boolean} options.allowQuotedLocalPart - Overrides default restriction and allows quoted username/local parts.
 * @param {boolean} options.arbitraryTLDs - Skips the 'known TLD' check and allows any validly formatted TLD name. This
 *   is still restricted by the TLD name restrictions which are tighter than standard domain labels.
 * @param {boolean} options.excludeChars - Either a string or array of excluded characters. In the array form, it will
 *   match the whole string, so you can also use this to exclude specific character sequences.
 * @param {boolean} options.excludeDomains - An array of domains to exclude. Excluding a domain also excludes all
 *   subdomains so eclxuding 'foo.com' would exclude 'john@foo.com' and 'john@bar.foo.com'. Initial periods are ignored
 *   so `excludeDomains: ['com']', and `excludeDomains: ['.com']` are equivalent.
 * @param {boolean} options.noDomainSpecificValidation - Setting this to true will skip domain specific validations. By
 *   default, the validation includes domain specific checks for 'google.com' and 'hotmail.com' domains. These domains
 *   are known to have more restrictive policies regarding what is and is not a valid email address.
 * @param {boolean} options.noLengthCheck - If true, then skips username (local part) and total email address length
 *   restrictions. Note that domain name label lengths are still enforced.
 * @param {boolean} options.noPlusEmails - If true, then '+' is not allowed in the username/local part. This is
 *   equivalent to setting `excludeChars = '+'.`
 * @param {boolean} options.noTLDOnly - If true, then disallows TLD only domains in an address like 'john@com'.
 * @param {boolean} options.noNonASCIILocalPart - If true, then disallows non-ASCII/international characters in the
 *   username/local part of the address.
 * @param {Function} options.validateInput - A custom validation function which looks at the original input string. See
 *   the [custom validation functions](#custom-validation-functions) section for details on input and return values.
 * @param {Function} options.validateValue - A custom validation function which looks at the transformed value. See the
 *   [custom validation functions](#custom-validation-functions) section for details on input and return values.
 * @returns {EmailData} Email data object.
 */
const Email = function (input, options = this || {}) {
  const { name } = options

  const selfDescription = describeInput('Email', name)

  typeChecks({ input, name })

  if (options.validateValue !== undefined) {
    options.validateResult = options.validateValue
  }

  const result = validateEmail(input, options)
  const { issues, isValid } = result
  delete result.issues
  delete result.isValid

  if (isValid === false) {
    if (issues.length === 0) { // shouldn't happen, but just in case
      issues.push('has unspecified issues')
    }
    throw new Error(`${selfDescription} input '${input}' ${issues.join(', ')}.`)
  }

  return result
}

Email.description = 'Email'
Email.toString = () => Email.description

export {
  Email,
  /**
   * Dynamically retrieves the latest list of valid TLDs from the Internet Assigned Numbers Authority (IANA).
   * International domains are decoded and both the decoded (international domain) and encoded ('xn--`) domain will be
   * present in the results object as both represent valid domains from a user's point of view. The resolved result can
   * be passed to the `Email` ``
   * @function
   * @returns {Promise<object>} A Promise resolving to an object whose keys are valid domains; the value of each entry
   *   is `true`. ASCII characters are always lowercased, but the international domains are not transformed after
   *   decoding and may contain uppercase non-ASCII unicode characters per [RFC 4343](https://www.rfc-editor.org/rfc/
   *   rfc4343).
   */
  getLatestTLDs
}
