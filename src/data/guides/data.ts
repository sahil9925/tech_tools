import type { ToolGuide } from '@/types/guide'

export const dataGuides: Record<string, ToolGuide> = {
  'json-formatter': {
    toolId: 'json-formatter',
    introduction: 'The JSON Formatter pretty-prints raw, unformatted JSON strings with customizable indentation (2 spaces, 4 spaces, tabs). It validates JSON syntax, highlights line numbers, detects parsing errors, and allows minification.',
    whatIsIt: {
      title: 'What is JSON (JavaScript Object Notation)?',
      content: [
        'JSON (RFC 8259 / ECMA-404) is a lightweight, text-based data interchange format.',
        'JSON relies on two structures: objects (unordered key/value pairs) and arrays (ordered lists of values). Permitted primitives are strings, numbers, booleans, and null.'
      ],
      keyConcepts: [
        { term: 'Object', explanation: 'Enclosed in curly braces { "key": "value" } with double-quoted string keys.' },
        { term: 'Array', explanation: 'Ordered list enclosed in square brackets [ 1, 2, 3 ].' },
        { term: 'Strict Types', explanation: 'Strings MUST use double quotes. Single quotes and trailing commas are invalid in strict JSON.' }
      ]
    },
    howItWorks: {
      title: 'How JSON Formatting Logic Works',
      steps: [
        'Parses input using native JSON.parse() inside a try-catch wrapper.',
        'Extracts line and column numbers if syntax error occurs.',
        'Formats valid JavaScript objects back to string via JSON.stringify(data, null, indentSpace).',
        'Calculates character savings when switching to minified output.'
      ]
    },
    howToUse: {
      title: 'How to Format JSON',
      steps: [
        'Paste raw or minified JSON into the left input area.',
        'Select indentation depth (2 spaces, 4 spaces, or Tab).',
        'Click Format JSON.',
        'Copy or download the formatted output.'
      ]
    },
    examples: [
      {
        title: 'Minified to Formatted JSON',
        input: '{"name":"DevOps","active":true,"tags":["aws","docker"]}',
        output: '{\n  "name": "DevOps",\n  "active": true,\n  "tags": [\n    "aws",\n    "docker"\n  ]\n}',
        explanation: 'Transforms compact string into readable indented structure.'
      }
    ],
    resultExplanation: {
      title: 'Understanding JSON Output',
      fields: [
        { name: 'Formatted String', type: 'String', description: 'Cleanly indented, syntax-highlighted JSON text.' },
        { name: 'Byte Size', type: 'Number', description: 'Character count of formatted vs minified data.' }
      ]
    },
    commonMistakes: [
      {
        title: 'Trailing Commas in Arrays or Objects',
        description: 'Trailing commas after the final element are forbidden in JSON.',
        badExample: '{ "key": "value", }',
        goodExample: '{ "key": "value" }'
      },
      {
        title: 'Using Single Quotes for String Keys',
        description: 'JSON keys and string values must use double quotes (").',
        badExample: "{ 'name': 'test' }",
        goodExample: '{ "name": "test" }'
      }
    ],
    bestPractices: [
      'Use 2 spaces for indentation in web APIs to balance readability and payload size.',
      'Always validate JSON responses before storing in NoSQL databases.'
    ],
    useCases: [
      { title: 'API Response Debugging', description: 'Format unreadable single-line REST API responses for inspection.' },
      { title: 'Configuration File Editing', description: 'Format package.json or application configuration files.' }
    ],
    troubleshooting: [
      { problem: 'Unexpected token in JSON', cause: 'Unquoted key or single quotes.', solution: 'Replace single quotes with double quotes.' }
    ],
    securityPrivacy: { isLocalProcessing: true, details: '100% processed locally in browser memory. Sensitive configuration values remain private.' },
    faq: [
      { question: 'Why does JSON prohibit single quotes?', answer: 'ECMA-404 specification mandates double quotes to maintain cross-language parsing consistency.' }
    ],
    technicalReferences: [
      { title: 'RFC 8259 - The JavaScript Object Notation (JSON) Data Interchange Format', url: 'https://datatracker.ietf.org/doc/html/rfc8259', description: 'Official IETF JSON standard.' }
    ],
    summary: 'JSON formatting cleans up messy data payloads for easy reading and debugging.'
  },

  'json-validator': {
    toolId: 'json-validator',
    introduction: 'The JSON Validator verifies JSON text against strict ECMA-404 / RFC 8259 specifications. It pinpoints line and column positions of syntax errors such as unquoted keys, single quotes, unescaped characters, and trailing commas.',
    whatIsIt: {
      title: 'What is JSON Syntax Validation?',
      content: [
        'Validation checks whether a string adheres strictly to JSON syntax rules.',
        'Common syntax rules include double-quoted keys, valid numeric literals, escaped control characters, and matching brackets.'
      ]
    },
    howItWorks: {
      title: 'How JSON Validation Works',
      steps: [
        'Reads input string character-by-character.',
        'Runs JSON.parse() and catches SyntaxError exceptions.',
        'Parses error position from error message to extract line/column numbers.'
      ]
    },
    howToUse: {
      title: 'How to Validate JSON',
      steps: [
        'Paste JSON text into the editor.',
        'Click Validate JSON.',
        'Review validation status. If invalid, inspect the line number error callout.'
      ]
    },
    examples: [
      {
        title: 'Detecting Trailing Comma Error',
        input: '{\n  "status": 200,\n}',
        output: 'Error on line 3: Unexpected token } in JSON at position 18',
        explanation: 'Line 3 contains trailing comma after status value.'
      }
    ],
    resultExplanation: {
      title: 'Understanding Validation Results',
      fields: [
        { name: 'Status', type: 'Boolean', description: 'Valid or Invalid JSON.' },
        { name: 'Error Position', type: 'Line/Column', description: 'Exact line location of syntax mistake.' }
      ]
    },
    commonMistakes: [
      {
        title: 'Unescaped Newlines inside String Literals',
        description: 'Multi-line strings must use \\n escape sequences.',
        badExample: '{ "bio": "line1\nline2" }',
        goodExample: '{ "bio": "line1\\nline2" }'
      }
    ],
    bestPractices: [
      'Validate JSON data before feeding into automated CI/CD pipelines.'
    ],
    useCases: [
      { title: 'Webhook Data Verification', description: 'Validate incoming payload structure before processing.' }
    ],
    troubleshooting: [
      { problem: 'Unexpected end of JSON input', cause: 'Missing closing brace } or bracket ].', solution: 'Check matching brackets.' }
    ],
    securityPrivacy: { isLocalProcessing: true, details: 'Validation occurs in local browser memory.' },
    faq: [
      { question: 'Does JSON support comments?', answer: 'Standard RFC 8259 JSON does NOT support comments (// or /* */).' }
    ],
    technicalReferences: [
      { title: 'ECMA-404 Standard', url: 'https://www.ecma-international.org/publications-and-standards/standards/ecma-404/', description: 'The JSON Data Interchange Syntax.' }
    ],
    summary: 'Validating JSON prevents syntax crashes in production APIs and configuration pipelines.'
  },

  'json-minifier': {
    toolId: 'json-minifier',
    introduction: 'The JSON Minifier strips unnecessary whitespace, line breaks, and indentation from JSON payloads to produce a compact, single-line output optimized for bandwidth saving and API transfer.',
    whatIsIt: {
      title: 'What is JSON Minification?',
      content: [
        'Minification removes non-functional whitespace outside of string literals, reducing payload file size by 10% to 40%.'
      ]
    },
    howItWorks: {
      title: 'How Minification Works',
      steps: [
        'Parses input to ensure valid JSON.',
        'Executes stringification with 0 whitespace indentation: JSON.stringify(obj).',
        'Calculates byte reduction stats.'
      ]
    },
    howToUse: {
      title: 'How to Minify JSON',
      steps: [
        'Paste formatted JSON string.',
        'Click Minify JSON.',
        'Copy compact output string.'
      ]
    },
    examples: [
      {
        title: 'Minifying Multi-line JSON',
        input: '{\n  "id": 1,\n  "name": "App"\n}',
        output: '{"id":1,"name":"App"}',
        explanation: 'Removes 4 spaces and 2 newlines.'
      }
    ],
    resultExplanation: {
      title: 'Understanding Minification Stats',
      fields: [
        { name: 'Original Size', type: 'Bytes', description: 'Uncompressed string size.' },
        { name: 'Minified Size', type: 'Bytes', description: 'Size after removing whitespace.' },
        { name: 'Reduction %', type: 'Percentage', description: 'Percentage of payload saved.' }
      ]
    },
    commonMistakes: [
      {
        title: 'Attempting to Minify Invalid JSON',
        description: 'Minifying invalid JSON will fail parsing.',
        badExample: 'Minifying text with missing quotes.',
        goodExample: 'Validate JSON before minifying.'
      }
    ],
    bestPractices: [
      'Minify JSON payloads sent over mobile networks or stored in Redis key caches.'
    ],
    useCases: [
      { title: 'Database Payload Optimization', description: 'Store minified JSON in MySQL/PostgreSQL JSONB columns.' }
    ],
    troubleshooting: [
      { problem: 'SyntaxError', cause: 'Input contains invalid JSON syntax.', solution: 'Fix syntax error using JSON Validator.' }
    ],
    securityPrivacy: { isLocalProcessing: true, details: 'Executed locally in browser.' },
    faq: [
      { question: 'Does minification change data values?', answer: 'No. Minification strictly removes formatting whitespace outside string literals.' }
    ],
    technicalReferences: [
      { title: 'RFC 8259', url: 'https://datatracker.ietf.org/doc/html/rfc8259', description: 'JSON standard.' }
    ],
    summary: 'Minifying JSON saves network bandwidth and reduces database storage overhead.'
  },

  'json-yaml': {
    toolId: 'json-yaml',
    introduction: 'The JSON ↔ YAML Converter converts data bi-directionally between JSON and YAML formats. It allows developers to seamlessly translate between web API JSON payloads and Kubernetes/Docker Compose YAML configurations.',
    whatIsIt: {
      title: 'What is JSON to YAML Conversion?',
      content: [
        'JSON and YAML are structurally equivalent data serialization formats. YAML is human-optimized using indentation, while JSON is machine-optimized using explicit punctuation.'
      ]
    },
    howItWorks: {
      title: 'How Conversion Works',
      steps: [
        'Parses input format (JSON or YAML) into an intermediate JavaScript object memory tree.',
        'Serializes intermediate object into target format with proper indentation.'
      ]
    },
    howToUse: {
      title: 'How to Convert JSON and YAML',
      steps: [
        'Select conversion direction (JSON to YAML or YAML to JSON).',
        'Paste source data into left box.',
        'Click Convert.',
        'Copy converted output from right box.'
      ]
    },
    examples: [
      {
        title: 'JSON to YAML',
        input: '{"app":"nginx","replicas":3}',
        output: 'app: nginx\nreplicas: 3',
        explanation: 'Converts JSON key-value object to clean YAML.'
      }
    ],
    resultExplanation: {
      title: 'Understanding Output',
      fields: [
        { name: 'Target Format String', type: 'String', description: 'Equivalent converted YAML or JSON text.' }
      ]
    },
    commonMistakes: [
      {
        title: 'Tab Characters in YAML Output',
        description: 'YAML forbids ASCII tab characters for indentation.',
        badExample: 'Using \\t for indentation in YAML.',
        goodExample: 'Use 2 spaces per indentation level.'
      }
    ],
    bestPractices: [
      'Convert JSON config files to YAML for easier human editing in DevOps pipelines.'
    ],
    useCases: [
      { title: 'Kubernetes Config Translation', description: 'Convert Helm JSON values into deployment YAML manifests.' }
    ],
    troubleshooting: [
      { problem: 'YAML parse error', cause: 'Invalid spacing or missing colon.', solution: 'Check line indentation.' }
    ],
    securityPrivacy: { isLocalProcessing: true, details: 'Client-side processing.' },
    faq: [
      { question: 'Is valid JSON also valid YAML?', answer: 'Yes. YAML 1.2 is a superset of JSON, meaning valid JSON is technically valid YAML.' }
    ],
    technicalReferences: [
      { title: 'YAML 1.2 Specification', url: 'https://yaml.org/spec/1.2.2/', description: 'Official YAML language specification.' }
    ],
    summary: 'Converting between JSON and YAML streamlines cloud configuration management.'
  },

  'json-csv': {
    toolId: 'json-csv',
    introduction: 'The JSON ↔ CSV Converter converts flat or nested JSON arrays into RFC 4180 CSV spreadsheet format, and parses CSV files back into structured JSON arrays.',
    whatIsIt: {
      title: 'What is JSON to CSV Conversion?',
      content: [
        'CSV (Comma-Separated Values) is a tabular format suited for spreadsheets (Excel, Google Sheets). Converting JSON arrays of objects to CSV maps keys to column headers and object values to table rows.'
      ]
    },
    howItWorks: {
      title: 'How CSV Parsing Works',
      steps: [
        'Extracts all unique keys across JSON objects to form CSV header row.',
        'Escapes double quotes and commas per RFC 4180 rules.',
        'Generates row lines for each array element.'
      ]
    },
    howToUse: {
      title: 'How to Convert JSON and CSV',
      steps: [
        'Paste JSON array of objects or CSV text.',
        'Click Convert.',
        'Download CSV file or copy output.'
      ]
    },
    examples: [
      {
        title: 'JSON Array to CSV',
        input: '[{"name":"Alice","role":"Admin"},{"name":"Bob","role":"User"}]',
        output: 'name,role\nAlice,Admin\nBob,User',
        explanation: 'Creates two-column tabular layout.'
      }
    ],
    resultExplanation: {
      title: 'Understanding Output',
      fields: [
        { name: 'CSV / JSON Output', type: 'Text', description: 'Tabular CSV text or JSON object array.' }
      ]
    },
    commonMistakes: [
      {
        title: 'Converting Deeply Nested JSON Objects directly to CSV',
        description: 'Nested objects cannot fit in flat rows without flattening key paths.',
        badExample: '[{"user": {"first": "A", "last": "B"}}]',
        goodExample: 'Flatten to {"user_first": "A", "user_last": "B"} before CSV export.'
      }
    ],
    bestPractices: [
      'Ensure input JSON is a flat array of uniform objects for best CSV layout.'
    ],
    useCases: [
      { title: 'Data Export for Reporting', description: 'Convert database API JSON query results to CSV for financial analysis in Excel.' }
    ],
    troubleshooting: [
      { problem: 'Input is not an array', cause: 'Passing a single JSON object instead of an array [...].', solution: 'Wrap object in square brackets [...].' }
    ],
    securityPrivacy: { isLocalProcessing: true, details: 'Client-side processing.' },
    faq: [
      { question: 'How are commas inside text values handled in CSV?', answer: 'Values containing commas are enclosed in double quotes per RFC 4180.' }
    ],
    technicalReferences: [
      { title: 'RFC 4180 - Common Format for CSV Files', url: 'https://datatracker.ietf.org/doc/html/rfc4180', description: 'Standard specification for CSV format.' }
    ],
    summary: 'Converting JSON to CSV enables easy spreadsheet reporting and data export.'
  },

  'yaml-validator': {
    toolId: 'yaml-validator',
    introduction: 'The YAML Validator inspects YAML text for indentation errors, invalid syntax, unquoted strings, and scalar formatting mistakes. It renders a structured JSON preview upon successful validation.',
    whatIsIt: {
      title: 'What is YAML Syntax Validation?',
      content: [
        'YAML relies on exact indentation spacing to define data hierarchies. A single misaligned space alters document structure or causes syntax errors.'
      ]
    },
    howItWorks: {
      title: 'How YAML Validation Works',
      steps: [
        'Scans YAML document line-by-line.',
        'Verifies key-value pairs, sequence indicators (-), and indentation levels.',
        'Outputs structural JSON object or line error message.'
      ]
    },
    howToUse: {
      title: 'How to Validate YAML',
      steps: [
        'Paste YAML configuration into the editor.',
        'Click Validate YAML.',
        'View validation status and structural preview.'
      ]
    },
    examples: [
      {
        title: 'Validating Docker Compose YAML',
        input: 'version: "3.8"\nservices:\n  web:\n    image: nginx:latest',
        output: 'Valid YAML. Parsed Structure Preview: { "version": "3.8", "services": { "web": { "image": "nginx:latest" } } }',
        explanation: 'Confirms correct nested indentation.'
      }
    ],
    resultExplanation: {
      title: 'Understanding Output',
      fields: [
        { name: 'Validation Status', type: 'Boolean', description: 'Valid or Invalid YAML.' },
        { name: 'JSON Structure Preview', type: 'Object', description: 'Parsed tree representation.' }
      ]
    },
    commonMistakes: [
      {
        title: 'Mixing Tabs and Spaces',
        description: 'YAML forbids tab characters for indentation.',
        badExample: 'Using TAB character before key name.',
        goodExample: 'Use exactly 2 spaces per level.'
      }
    ],
    bestPractices: [
      'Configure code editor to convert Tabs to 2 spaces automatically.'
    ],
    useCases: [
      { title: 'CI/CD Pipeline Validation', description: 'Validate GitHub Actions or GitLab CI YAML files before committing.' }
    ],
    troubleshooting: [
      { problem: 'Bad indentation error', cause: 'Misaligned key indentation.', solution: 'Check space counts on error line.' }
    ],
    securityPrivacy: { isLocalProcessing: true, details: 'Processed locally in browser.' },
    faq: [
      { question: 'Why does YAML reject tabs?', answer: 'Different text editors render tab characters with different widths, corrupting structural hierarchy.' }
    ],
    technicalReferences: [
      { title: 'YAML 1.2 Standard', url: 'https://yaml.org/spec/1.2.2/', description: 'Official spec.' }
    ],
    summary: 'Validating YAML prevents deployment crashes caused by whitespace misalignment.'
  },

  'xml-formatter': {
    toolId: 'xml-formatter',
    introduction: 'The XML Formatter formats, pretty-prints, minifies, and validates XML documents using the browser\'s native DOMParser engine. It fixes tag indentation and highlights unclosed tags.',
    whatIsIt: {
      title: 'What is XML Formatting?',
      content: [
        'XML (Extensible Markup Language) is a tree-structured markup format. Well-formed XML requires matching start/end tags, proper nesting, and root element enclosure.'
      ]
    },
    howItWorks: {
      title: 'How XML Formatting Works',
      steps: [
        'Parses string using browser DOMParser API (text/xml).',
        'Checks for parsererror elements in DOM.',
        'Recursively prints XML tree with customizable indent levels.'
      ]
    },
    howToUse: {
      title: 'How to Format XML',
      steps: [
        'Paste raw XML into the editor.',
        'Click Format XML or Minify XML.',
        'Copy formatted XML output.'
      ]
    },
    examples: [
      {
        title: 'Formatting Raw XML',
        input: '<root><user id="1"><name>Alice</name></user></root>',
        output: '<root>\n  <user id="1">\n    <name>Alice</name>\n  </user>\n</root>',
        explanation: 'Indents tree levels clearly.'
      }
    ],
    resultExplanation: {
      title: 'Understanding Results',
      fields: [
        { name: 'Formatted XML String', type: 'String', description: 'Indented XML text.' }
      ]
    },
    commonMistakes: [
      {
        title: 'Unclosed Tags or Mis-matched Tag Names',
        description: 'XML enforces strict tag closing matching.',
        badExample: '<title>DevOpsTools</name>',
        goodExample: '<title>DevOpsTools</title>'
      }
    ],
    bestPractices: [
      'Ensure XML documents include a single root element.'
    ],
    useCases: [
      { title: 'SOAP Web Services', description: 'Format SOAP XML payloads for inspection.' }
    ],
    troubleshooting: [
      { problem: 'XML Parsing Error: mismatched tag', cause: 'Closing tag does not match opening tag name.', solution: 'Check tag spelling.' }
    ],
    securityPrivacy: { isLocalProcessing: true, details: 'Parsed in browser via DOMParser.' },
    faq: [
      { question: 'What is well-formed XML?', answer: 'XML that complies with all basic syntax rules (proper nesting, root element, quotes around attribute values).' }
    ],
    technicalReferences: [
      { title: 'W3C XML 1.0 Recommendation', url: 'https://www.w3.org/TR/xml/', description: 'Official W3C XML standard.' }
    ],
    summary: 'Formatting XML makes legacy enterprise payloads easy to read and troubleshoot.'
  }
}
