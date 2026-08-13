import type { ToolGuide } from '@/types/guide'

export const securityGuides: Record<string, ToolGuide> = {
  'jwt-decoder': {
    toolId: 'jwt-decoder',
    introduction: 'The JWT Decoder decodes JSON Web Tokens (RFC 7519) into readable JSON Headers, Payloads, and signature components directly in your browser. It calculates token expiration status (exp claim), issued-at timestamps (iat), and issuer claims without sending your sensitive token to any external server.',
    whatIsIt: {
      title: 'What is a JSON Web Token (JWT)?',
      content: [
        'A JWT (RFC 7519) is an open standard for securely transmitting information between parties as a compact, self-contained JSON object.',
        'JWTs consist of three parts separated by dots (.): Header, Payload, and Signature. Each part is Base64URL-encoded.'
      ],
      keyConcepts: [
        { term: 'Header', explanation: 'Contains algorithm metadata (e.g. {"alg": "RS256", "typ": "JWT"}).' },
        { term: 'Payload', explanation: 'Contains claims (statements about an entity such as user_id, role, exp, iat).' },
        { term: 'Signature', explanation: 'Cryptographic signature verifying sender identity and message integrity.' },
        { term: 'Base64URL Encoding', explanation: 'URL-safe Base64 variant replacing + with -, / with _, and omitting = padding.' }
      ]
    },
    howItWorks: {
      title: 'How JWT Decoding Logic Works',
      steps: [
        'Splits JWT string by dot delimiters into 3 parts: header, payload, and signature.',
        'Decodes Base64URL header and payload into UTF-8 JSON strings.',
        'Parses JSON strings into structured JavaScript objects.',
        'Reads standard timestamp claims (exp, iat, nbf) and compares against current epoch time.',
        'Displays token status (Active, Expired, Not Valid Yet).'
      ],
      technicalDetails: 'Decoding extracts payload claims. Signature verification requires the secret key or public RSA key, which is kept server-side.'
    },
    howToUse: {
      title: 'How to Decode a JWT',
      steps: [
        'Paste JWT token string (e.g. eyJhbGciOi...) into the input box.',
        'Click Decode Token.',
        'Inspect decoded Header JSON, Payload claims, and Expiration status.'
      ]
    },
    examples: [
      {
        title: 'Decoding Standard User Access Token',
        input: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        output: 'Header: { "alg": "HS256", "typ": "JWT" }\nPayload: { "sub": "1234567890", "name": "Alice", "iat": 1516239022 }',
        explanation: 'Decodes user identity claims (sub, name) and algorithm type (HS256).'
      }
    ],
    resultExplanation: {
      title: 'Understanding JWT Claims & Output',
      fields: [
        { name: 'sub (Subject)', type: 'String', description: 'Unique identifier for the user or entity.' },
        { name: 'exp (Expiration Time)', type: 'Unix Timestamp', description: 'Expiration epoch time after which token is rejected.' },
        { name: 'iat (Issued At)', type: 'Unix Timestamp', description: 'Timestamp when token was generated.' },
        { name: 'iss (Issuer)', type: 'String', description: 'Identity of server issuing the token.' },
        { name: 'aud (Audience)', type: 'String', description: 'Intended recipient or service for the token.' }
      ]
    },
    commonMistakes: [
      {
        title: 'Confusing Decoding with Signature Verification',
        description: 'Decoding a JWT simply extracts payload claims. Anyone can decode a JWT payload. Security relies on signature verification using your backend secret/public key.',
        badExample: 'Trusting unverified payload claims directly on client-side without backend verification.',
        goodExample: 'Always verify JWT signature on your backend API before trusting payload claim contents.'
      },
      {
        title: 'Storing Sensitive Passwords in JWT Payload',
        description: 'JWT payloads are only Base64URL-encoded, NOT encrypted.',
        badExample: 'Including user password hashes or SSNs inside JWT payload.',
        goodExample: 'Include only public claims like user_id, email, and roles.'
      }
    ],
    bestPractices: [
      'Keep JWT expiration times short (e.g. 15 to 60 minutes).',
      'Use HTTPS for all transmission of JWT tokens in Authorization headers.',
      'Never paste production JWT tokens into untrusted third-party remote API tools.'
    ],
    useCases: [
      { title: 'OAuth2 / OIDC Token Inspection', description: 'Inspect ID tokens and access tokens issued by Auth0, Okta, Keycloak, or AWS Cognito.' },
      { title: 'API Authentication Debugging', description: 'Diagnose 401 Unauthorized errors by checking token expiration timestamps.' }
    ],
    troubleshooting: [
      { problem: 'Invalid Token Format', cause: 'Token does not contain 3 dot-separated segments.', solution: 'Ensure full Bearer token string is copied.' }
    ],
    securityPrivacy: {
      isLocalProcessing: true,
      details: 'All JWT decoding happens 100% locally in your browser memory. Tokens are NEVER sent to any external server.'
    },
    faq: [
      { question: 'Can anyone read a JWT payload?', answer: 'Yes. Base64URL encoding is reversible without a secret key. Encrypting payloads requires JWE (JSON Web Encryption).' },
      { question: 'Does decoding a JWT verify its signature?', answer: 'No. Decoding extracts claims. Signature verification requires the secret HMAC key or public RSA/ECDSA key.' }
    ],
    technicalReferences: [
      { title: 'RFC 7519 - JSON Web Token (JWT)', url: 'https://datatracker.ietf.org/doc/html/rfc7519', description: 'Official RFC specification for JWT.' },
      { title: 'RFC 7515 - JSON Web Signature (JWS)', url: 'https://datatracker.ietf.org/doc/html/rfc7515', description: 'Cryptographic signature rules for JWT.' }
    ],
    summary: 'JWT decoding allows developers to inspect authentication claims and expiration dates instantly.'
  },

  'hash-generator': {
    toolId: 'hash-generator',
    introduction: 'The Hash Generator computes cryptographic message digests for text inputs or local files using the browser\'s native Web Crypto API (`crypto.subtle`). It supports SHA-256, SHA-512, SHA-384, and SHA-1 algorithms.',
    whatIsIt: {
      title: 'What is Cryptographic Hashing?',
      content: [
        'A cryptographic hash function maps arbitrary-length input data into a fixed-size hexadecimal string (digest).',
        'Hash functions are deterministic, one-way (irreversible), and collision-resistant. A tiny 1-bit change in input produces a completely different hash output (avalanche effect).'
      ],
      keyConcepts: [
        { term: 'SHA-256', explanation: 'Secure Hash Algorithm producing 256-bit (64-character hex) digest. Industry standard for integrity checks.' },
        { term: 'SHA-512', explanation: 'Produces 512-bit (128-character hex) digest for ultra-high security requirements.' },
        { term: 'One-Way Function', explanation: 'Computationally infeasible to reverse a hash digest back into original input.' }
      ]
    },
    howItWorks: {
      title: 'How Web Crypto Hashing Operates',
      steps: [
        'Encodes text into UTF-8 ArrayBuffer.',
        'Calls browser native crypto.subtle.digest(algorithm, buffer).',
        'Converts resulting ArrayBuffer bytes into hexadecimal string.',
        'Processes local files using FileReader chunks without uploading files.'
      ]
    },
    howToUse: {
      title: 'How to Generate Hashes',
      steps: [
        'Enter plain text or drag & drop a local file.',
        'Select algorithm (SHA-256, SHA-512, SHA-384, SHA-1).',
        'Click Generate Hash.',
        'Copy hexadecimal digest.'
      ]
    },
    examples: [
      {
        title: 'SHA-256 Text Hashing',
        input: '"hello world"',
        output: 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9',
        explanation: 'Produces fixed 64-character SHA-256 digest.'
      }
    ],
    resultExplanation: {
      title: 'Understanding Hash Results',
      fields: [
        { name: 'Hex Digest', type: 'String', description: 'Hexadecimal cryptographic fingerprint.' },
        { name: 'Bit Length', type: 'Number', description: 'Digest bit size (256-bit, 512-bit).' }
      ]
    },
    commonMistakes: [
      {
        title: 'Confusing Hashing with Encryption',
        description: 'Hashing is a ONE-WAY function without a decryption key. Encryption is TWO-WAY.',
        badExample: 'Attempting to "decrypt" a SHA-256 hash digest back into original text.',
        goodExample: 'Use symmetric AES encryption if two-way decryption is required.'
      },
      {
        title: 'Storing Raw Passwords Hashed with SHA-256 without Salt',
        description: 'Fast hashes like SHA-256 without salt are vulnerable to rainbow table attacks.',
        badExample: 'SHA-256(password)',
        goodExample: 'Use slow password hashing algorithms like bcrypt, Argon2, or PBKDF2 with unique salt.'
      }
    ],
    bestPractices: [
      'Use SHA-256 or SHA-512 for file integrity checks and API signature verification.',
      'Do not use SHA-1 or MD5 for security signatures due to known collision vulnerabilities.'
    ],
    useCases: [
      { title: 'Software Checksum Verification', description: 'Verify downloaded ISO or release binaries against vendor-published SHA-256 checksums.' },
      { title: 'API Request Signing', description: 'Generate HMAC / SHA-256 request signatures for webhooks.' }
    ],
    troubleshooting: [
      { problem: 'Hash value mismatch', cause: 'Extra trailing newline or space character in text input.', solution: 'Trim whitespace before hashing.' }
    ],
    securityPrivacy: { isLocalProcessing: true, details: 'Uses browser Web Crypto API. Files and text remain 100% on your local machine.' },
    faq: [
      { question: 'Is SHA-256 reversible?', answer: 'No. SHA-256 is mathematically irreversible.' }
    ],
    technicalReferences: [
      { title: 'FIPS PUB 180-4 - Secure Hash Standard (SHS)', url: 'https://csrc.nist.gov/publications/detail/fips/180/4/final', description: 'NIST SHA specifications.' }
    ],
    summary: 'Cryptographic hashing provides tamper-proof digital fingerprints for file integrity and security verification.'
  },

  'base64': {
    toolId: 'base64',
    introduction: 'The Base64 Encoder/Decoder converts text or binary data into ASCII text encoding and decodes Base64 strings back to UTF-8 text. It handles multi-byte Unicode characters (emojis, international text) safely.',
    whatIsIt: {
      title: 'What is Base64 Encoding?',
      content: [
        'Base64 (RFC 4648) represents binary data in an ASCII string format by translating 24 bits of data into four 6-bit index characters (2^6 = 64 characters: A-Z, a-z, 0-9, +, /).'
      ]
    },
    howItWorks: {
      title: 'How Base64 Encoding Works',
      steps: [
        'Converts UTF-8 text characters into byte array using TextEncoder.',
        'Groups bytes into 6-bit blocks.',
        'Maps 6-bit values to 64 ASCII character lookup table.',
        'Applies = padding for remaining byte alignments.'
      ]
    },
    howToUse: {
      title: 'How to Encode and Decode Base64',
      steps: [
        'Select mode (Encode or Decode).',
        'Paste text into input field.',
        'Click Convert.',
        'Copy result string.'
      ]
    },
    examples: [
      {
        title: 'Encoding Text to Base64',
        input: 'DevOpsTools',
        output: 'RGV2T3BzVG9vbHM=',
        explanation: 'Converts 11 ASCII characters into 16-character Base64 string with = padding.'
      }
    ],
    resultExplanation: {
      title: 'Understanding Base64 Results',
      fields: [
        { name: 'Base64 Output', type: 'String', description: 'ASCII encoded text payload.' }
      ]
    },
    commonMistakes: [
      {
        title: 'Mistaking Base64 for Security or Encryption',
        description: 'Base64 is ENCODING, NOT ENCRYPTION. Anyone can decode Base64 instantly.',
        badExample: 'Storing passwords in Base64 thinking they are secure.',
        goodExample: 'Use AES encryption or bcrypt hashing for security.'
      }
    ],
    bestPractices: [
      'Use Base64URL mode (- and _ instead of + and /) when inserting values into URL query parameters.'
    ],
    useCases: [
      { title: 'HTTP Basic Authentication', description: 'Format username:password credentials for Authorization: Basic header.' },
      { title: 'Data URIs', description: 'Embed small images directly inside CSS or HTML data:image/png;base64,...' }
    ],
    troubleshooting: [
      { problem: 'The string to be decoded is not correctly encoded', cause: 'Invalid Base64 characters or missing padding =.', solution: 'Check input for non-Base64 characters.' }
    ],
    securityPrivacy: { isLocalProcessing: true, details: 'Processed locally in browser.' },
    faq: [
      { question: 'Why does Base64 output end with =?', answer: '= is padding added when the input length is not divisible by 3 bytes.' }
    ],
    technicalReferences: [
      { title: 'RFC 4648 - The Base16, Base32, and Base64 Data Encodings', url: 'https://datatracker.ietf.org/doc/html/rfc4648', description: 'Official Base64 specification.' }
    ],
    summary: 'Base64 encoding allows binary data to be safely transmitted across text-only protocols.'
  },

  'url-encoder': {
    toolId: 'url-encoder',
    introduction: 'The URL Encoder/Decoder encodes special characters into percent-encoded format (RFC 3986) for safe inclusion in URLs, or decodes percent-encoded URIs back to readable text.',
    whatIsIt: {
      title: 'What is Percent Encoding?',
      content: [
        'Percent-encoding replaces unsafe ASCII characters with a % followed by two hexadecimal digits representing the character\'s UTF-8 byte value.'
      ]
    },
    howItWorks: {
      title: 'How URL Encoding Works',
      steps: [
        'Uses encodeURIComponent() for component parameter encoding (encodes &, =, ?, #).',
        'Uses encodeURI() for full URL structure preservation.',
        'Decodes using decodeURIComponent().'
      ]
    },
    howToUse: {
      title: 'How to Encode / Decode URLs',
      steps: [
        'Select mode (Encode Component, Decode Component, Encode Full URL, Decode Full URL).',
        'Enter input string.',
        'Click Convert.'
      ]
    },
    examples: [
      {
        title: 'Encoding Query Parameter',
        input: 'hello world & foo=bar',
        output: 'hello%20world%20%26%20foo%3Dbar',
        explanation: 'Encodes space as %20, & as %26, and = as %3D.'
      }
    ],
    resultExplanation: {
      title: 'Understanding Output',
      fields: [
        { name: 'Encoded URL String', type: 'String', description: 'Percent-encoded safe URI text.' }
      ]
    },
    commonMistakes: [
      {
        title: 'Using encodeURI on Query String Values',
        description: 'encodeURI preserves & and = so it will fail to escape query parameter delimiters.',
        badExample: 'encodeURI("q=a&b")',
        goodExample: 'encodeURIComponent("a&b")'
      }
    ],
    bestPractices: [
      'Always encode dynamic parameters before building HTTP GET request URLs.'
    ],
    useCases: [
      { title: 'Web Development Query String Handling', description: 'Prevent parameter splitting vulnerabilities in web applications.' }
    ],
    troubleshooting: [
      { problem: 'URIError: URI malformed', cause: 'Invalid percent sequence (e.g. %zz).', solution: 'Fix invalid percent hex characters.' }
    ],
    securityPrivacy: { isLocalProcessing: true, details: 'Client-side execution.' },
    faq: [
      { question: 'What is the difference between encodeURI and encodeURIComponent?', answer: 'encodeURIComponent encodes special characters like & = ? #, whereas encodeURI preserves them.' }
    ],
    technicalReferences: [
      { title: 'RFC 3986 - Uniform Resource Identifier (URI): Generic Syntax', url: 'https://datatracker.ietf.org/doc/html/rfc3986', description: 'Official URI specification.' }
    ],
    summary: 'URL encoding prevents special characters from breaking HTTP request structure.'
  },

  'regex-tester': {
    toolId: 'regex-tester',
    introduction: 'The Regex Tester evaluates regular expressions against test text in real time using the browser\'s native RegExp engine. It highlights matches, extracts capture groups, and supports all standard JS flags (g, i, m, s, u, y).',
    whatIsIt: {
      title: 'What is a Regular Expression (Regex)?',
      content: [
        'A regular expression is a sequence of characters defining a search pattern. Regex is widely used in log parsing, string validation, data extraction, and find-and-replace routines.'
      ]
    },
    howItWorks: {
      title: 'How Regex Execution Works',
      steps: [
        'Compiles pattern and flags into native JavaScript RegExp instance.',
        'Executes regexp.exec() iteratively to extract matches, start/end indices, and capture groups.',
        'Wraps matched text spans in HTML <mark> tags for visual highlight.'
      ]
    },
    howToUse: {
      title: 'How to Test Regular Expressions',
      steps: [
        'Enter regex pattern (e.g. [a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}).',
        'Toggle flags (g, i, m, s, u, y).',
        'Paste test text into input box.',
        'Inspect highlighted matches and capture group lists.'
      ]
    },
    examples: [
      {
        title: 'Matching IPv4 Addresses',
        input: 'Pattern: \\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b\nTest: Host 192.168.1.1 connected',
        output: 'Match 1: "192.168.1.1" at index 5',
        explanation: 'Extracts IPv4 address pattern from log line.'
      }
    ],
    resultExplanation: {
      title: 'Understanding Regex Results',
      fields: [
        { name: 'Matches', type: 'Array', description: 'List of matching substrings with index offsets.' },
        { name: 'Capture Groups', type: 'Array', description: 'Parenthesized group sub-match values ($1, $2).' }
      ]
    },
    commonMistakes: [
      {
        title: 'Creating Catastrophic Backtracking Patterns',
        description: 'Nested quantifiers like (a+)+ can cause exponential CPU backtracking on long non-matching strings.',
        badExample: '(a+)+$',
        goodExample: 'a+$'
      }
    ],
    bestPractices: [
      'Use character classes and anchors (^ and $) when performing full string validation.'
    ],
    useCases: [
      { title: 'Log File Data Extraction', description: 'Extract IP addresses, HTTP status codes, or timestamps from Nginx log files.' }
    ],
    troubleshooting: [
      { problem: 'Invalid regular expression', cause: 'Unmatched parenthesis or unescaped special character.', solution: 'Check syntax error message details.' }
    ],
    securityPrivacy: { isLocalProcessing: true, details: 'Executed entirely in local browser memory.' },
    faq: [
      { question: 'What does the g flag do?', answer: 'Global flag (g) finds ALL matches in the text rather than stopping after the first match.' }
    ],
    technicalReferences: [
      { title: 'MDN Web Docs - Regular Expressions', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions', description: 'JavaScript RegExp guide.' }
    ],
    summary: 'Regex testing speeds up building and validating pattern matching rules for code and log parsing.'
  }
}
