import type { ToolGuide } from '@/types/guide'

export const dnsGuides: Record<string, ToolGuide> = {
  'dns-lookup': {
    toolId: 'dns-lookup',
    introduction: 'The DNS Lookup tool queries Domain Name System (DNS) servers to resolve hostname records into network addresses and server configurations. It sends live DNS queries directly via DoH (DNS-over-HTTPS) to retrieve A, AAAA, MX, TXT, NS, CNAME, and SOA resource records.',
    whatIsIt: {
      title: 'What is DNS and Domain Resolution?',
      content: [
        'The Domain Name System (DNS) is a hierarchical, distributed database that translates human-readable domain names (like example.com) into numerical IP addresses required by networking protocols.',
        'DNS resolution relies on authoritative name servers that store resource records defining how traffic for a zone should be routed across IPv4 (A records), IPv6 (AAAA records), mail exchange servers (MX records), and domain verification records (TXT).'
      ],
      keyConcepts: [
        { term: 'A Record', explanation: 'Maps a hostname to an IPv4 address (e.g. 93.184.216.34).' },
        { term: 'AAAA Record', explanation: 'Maps a hostname to a 128-bit IPv6 address (e.g. 2606:2800:220:1:248:1893:25c8:1946).' },
        { term: 'NS Record', explanation: 'Delegates a DNS zone to use specific authoritative name servers.' },
        { term: 'SOA Record', explanation: 'Start of Authority record containing administrative details, serial number, and refresh timers for the zone.' }
      ]
    },
    howItWorks: {
      title: 'How DNS Lookup Operates',
      steps: [
        'User submits a domain name and optional target record type.',
        'The application sends an HTTP GET request to Cloudflare DNS-over-HTTPS (DoH) JSON endpoint (https://1.1.1.1/dns-query).',
        'Cloudflare recursive DNS resolves the requested record against the domain\'s authoritative name servers.',
        'The JSON response is parsed for TTL (Time-To-Live), record type IDs, and record data (rdata).',
        'Results are formatted into readable cards with TTL status and IP metadata.'
      ],
      technicalDetails: 'Requests use RFC 8484 DNS-over-HTTPS standard, preventing local DNS cache pollution and ensuring browser-native TLS security.'
    },
    howToUse: {
      title: 'How to Perform a DNS Lookup',
      steps: [
        'Enter a root domain or hostname (e.g. example.com or api.example.com).',
        'Select the target record type (A, AAAA, MX, TXT, NS, CNAME, SOA, or ALL).',
        'Click Lookup DNS Records to initiate the query.',
        'Inspect returned records, TTL values, and target IP addresses.'
      ]
    },
    examples: [
      {
        title: 'Querying A and AAAA Records',
        input: 'example.com (Type: ALL)',
        output: 'A -> 93.184.216.34 (TTL: 86400)\nAAAA -> 2606:2800:220:1:248:1893:25c8:1946',
        explanation: 'Indicates the domain is reachable over both IPv4 and IPv6 protocols.'
      },
      {
        title: 'Verifying Name Server Delegation',
        input: 'github.com (Type: NS)',
        output: 'NS -> ns-421.awsdns-52.com.\nNS -> ns-1707.awsdns-21.co.uk.',
        explanation: 'Shows Amazon Route 53 authoritative name servers handling delegation for github.com.'
      }
    ],
    resultExplanation: {
      title: 'Understanding DNS Lookup Results',
      fields: [
        { name: 'Record Type', type: 'String', description: 'The RR type (A, AAAA, CNAME, MX, TXT, NS, SOA).' },
        { name: 'TTL (Time To Live)', type: 'Number', description: 'Seconds DNS resolvers may cache this response before re-querying.' },
        { name: 'Data (RDATA)', type: 'String', description: 'The target IP address, canonical name, or text string assigned to the record.' }
      ]
    },
    commonMistakes: [
      {
        title: 'Expecting Instant Propagation After DNS Edits',
        description: 'DNS updates are cached by ISPs and resolvers according to the TTL value set on old records.',
        badExample: 'Changing A record and testing immediately expecting 100% global traffic shift.',
        goodExample: 'Lowering TTL to 300 seconds 24 hours prior to a planned DNS migration.'
      },
      {
        title: 'Entering URL Instead of Hostname',
        description: 'DNS queries require a pure hostname, not HTTP protocol or URI paths.',
        badExample: 'https://example.com/api/v1',
        goodExample: 'example.com'
      }
    ],
    bestPractices: [
      'Set TTL low (e.g. 300s) before server migrations to allow fast fallback if issues occur.',
      'Always configure dual-stack IPv4 (A) and IPv6 (AAAA) records for public web servers.',
      'Ensure at least two geographically separated NS records exist for redundancy.'
    ],
    useCases: [
      { title: 'Server Migration Verification', description: 'Confirm that A records reflect new infrastructure IP addresses following a migration.' },
      { title: 'DNS Propagation Monitoring', description: 'Track whether global DNS resolvers have updated cached entries.' },
      { title: 'Debugging Connectivity Failure', description: 'Determine if website downtime is caused by unresolved hostnames or web server outages.' }
    ],
    troubleshooting: [
      { problem: 'NXDOMAIN (Non-Existent Domain)', cause: 'The domain name is not registered or DNS zone files are unconfigured.', solution: 'Check spelling and verify domain registration status using WHOIS.' },
      { problem: 'SERVFAIL', cause: 'Authoritative name servers failed to respond or DNSSEC validation failed.', solution: 'Check registrar name server glue records and DNSSEC DS record configuration.' }
    ],
    securityPrivacy: {
      isLocalProcessing: true,
      details: 'Queries are transmitted over encrypted HTTPS to Cloudflare DNS-over-HTTPS API. No personal data or credentials are included in DNS queries.'
    },
    faq: [
      { question: 'What is DNS TTL?', answer: 'TTL (Time-To-Live) tells recursive resolvers how many seconds to cache a record before checking for updates.' },
      { question: 'Why does DNS lookup return multiple IP addresses for one domain?', answer: 'Multiple A records are used for Round-Robin DNS load balancing across cluster nodes.' }
    ],
    technicalReferences: [
      { title: 'RFC 1035 - Domain Names - Implementation and Specification', url: 'https://datatracker.ietf.org/doc/html/rfc1035', description: 'Core IETF standard for DNS query and record structures.' },
      { title: 'RFC 8484 - DNS Queries over HTTPS (DoH)', url: 'https://datatracker.ietf.org/doc/html/rfc8484', description: 'Specification for executing DNS queries over TLS/HTTPS.' }
    ],
    summary: 'Regular DNS lookups are fundamental when configuring cloud services, migrating hosts, and verifying DNS propagation. Using DoH queries guarantees accurate, un-poisoned lookup results.'
  },

  'mx-lookup': {
    toolId: 'mx-lookup',
    introduction: 'The MX Lookup tool inspects Mail Exchange (MX) records for a domain to identify which email servers are responsible for accepting incoming email messages. It retrieves priority values and hostname targets to assist email delivery setup.',
    whatIsIt: {
      title: 'What are MX Records?',
      content: [
        'Mail Exchange (MX) records are specialized DNS records that specify which mail servers accept email sent to a domain name.',
        'Each MX record contains a preference priority integer and a domain name. Receiving MTA (Mail Transfer Agents) connect to the server with the lowest preference number first.'
      ],
      keyConcepts: [
        { term: 'Preference / Priority Number', explanation: 'Lower values indicate higher priority (e.g. priority 5 is attempted before priority 10).' },
        { term: 'Mail Transfer Agent (MTA)', explanation: 'Software like Postfix, Exchange, or Gmail that transfers email between hosts using SMTP.' }
      ]
    },
    howItWorks: {
      title: 'How MX Record Lookup Works',
      steps: [
        'Submits DNS query for MX type via Cloudflare DNS-over-HTTPS endpoint.',
        'Extracts MX preference weight and target hostname for each record.',
        'Validates target hostnames and checks corresponding IP addresses.',
        'Renders priority-ordered breakdown of incoming mail gateways.'
      ]
    },
    howToUse: {
      title: 'How to Check MX Records',
      steps: [
        'Enter the target domain name (e.g. google.com or company.com).',
        'Click Lookup MX Records.',
        'Verify that priority values and mail server hostnames match your provider setup.'
      ]
    },
    examples: [
      {
        title: 'Google Workspace MX Records',
        input: 'example.com',
        output: '1 smtp.google.com\n5 alt1.aspmx.l.google.com',
        explanation: 'Primary mail goes to smtp.google.com (priority 1). If down, backup alt1 is used.'
      }
    ],
    resultExplanation: {
      title: 'Understanding MX Lookup Results',
      fields: [
        { name: 'Priority / Preference', type: 'Number', description: 'Connection preference order. Lower numbers take precedence.' },
        { name: 'Host / Mail Server', type: 'String', description: 'Fully Qualified Domain Name (FQDN) of the mail server.' }
      ]
    },
    commonMistakes: [
      {
        title: 'Pointing MX Record Directly to an IP Address',
        description: 'RFC 2181 strictly prohibits placing IP addresses in MX record target fields.',
        badExample: 'example.com. IN MX 10 192.0.2.1',
        goodExample: 'example.com. IN MX 10 mail.example.com.'
      }
    ],
    bestPractices: [
      'Ensure all MX hostnames resolve to valid A/AAAA records.',
      'Do not point MX records to CNAME aliases.',
      'Configure SPF, DKIM, and DMARC alongside MX records for deliverability.'
    ],
    useCases: [
      { title: 'Email Service Migration', description: 'Verify new mail provider MX records are active before switching MX records in DNS.' },
      { title: 'Email Bounce Troubleshooting', description: 'Diagnose why external mail servers cannot deliver messages to your domain.' }
    ],
    troubleshooting: [
      { problem: 'No MX Records Found', cause: 'Domain does not have MX records or mail is meant to fall back to A record.', solution: 'Add appropriate MX records provided by your mail host.' }
    ],
    securityPrivacy: {
      isLocalProcessing: true,
      details: 'Queries are processed via DNS-over-HTTPS. No email addresses or message content are accessed.'
    },
    faq: [
      { question: 'What happens if two MX records have equal priority?', answer: 'Sending MTA load-balances mail randomly between hosts with identical priority numbers.' }
    ],
    technicalReferences: [
      { title: 'RFC 5321 - Simple Mail Transfer Protocol', url: 'https://datatracker.ietf.org/doc/html/rfc5321', description: 'SMTP specification including MX record resolution rules.' }
    ],
    summary: 'Checking MX records ensures incoming mail routes correctly to active mail servers.'
  },

  'txt-lookup': {
    toolId: 'txt-lookup',
    introduction: 'The TXT Record Lookup tool fetches arbitrary text records associated with a domain. TXT records are primarily used for domain ownership verification, SPF policies, DKIM keys, DMARC policies, and SSL certificate authorization.',
    whatIsIt: {
      title: 'What are TXT Records?',
      content: [
        'TXT records store human-readable or machine-readable text attributes inside the DNS zone.',
        'Modern security protocols use TXT records extensively to publish cryptographic signatures, authentication policies, and ownership validation strings.'
      ]
    },
    howItWorks: {
      title: 'How TXT Lookup Works',
      steps: [
        'Sends DoH query for TXT records for the specified hostname.',
        'Parses character strings (rdata) enclosed in quotes.',
        'Formats and categorizes records into SPF, DKIM, DMARC, or verification categories.'
      ]
    },
    howToUse: {
      title: 'How to Check TXT Records',
      steps: [
        'Enter domain name or specific TXT subdomain (e.g. google._domainkey.example.com).',
        'Click Lookup TXT Records.',
        'Inspect text attributes and string keys.'
      ]
    },
    examples: [
      {
        title: 'Google Site Verification',
        input: 'example.com',
        output: '"google-site-verification=abc123xyz..."',
        explanation: 'Proves ownership of example.com to Google Search Console.'
      }
    ],
    resultExplanation: {
      title: 'Understanding TXT Record Results',
      fields: [
        { name: 'TXT Value', type: 'String', description: 'The text payload published in the DNS zone.' }
      ]
    },
    commonMistakes: [
      {
        title: 'Exceeding 255-character String Limits Without Chunking',
        description: 'Single TXT string tokens cannot exceed 255 bytes; longer values (like DKIM 2048-bit keys) must be split into multiple quoted strings.',
        badExample: 'Single 300 character unsplit string in DNS panel.',
        goodExample: '"part1..." "part2..." in DNS zone file.'
      }
    ],
    bestPractices: [
      'Wrap multiple DKIM keys in distinct subdomains (e.g. selector._domainkey.domain.com).',
      'Remove outdated verification TXT records after verification completes.'
    ],
    useCases: [
      { title: 'Domain Verification', description: 'Verify ownership for Google Workspace, Microsoft 365, or GitHub.' },
      { title: 'Security Auditing', description: 'Inspect SPF and DMARC TXT records published on the domain.' }
    ],
    troubleshooting: [
      { problem: 'TXT Record Not Found', cause: 'Record has not propagated or subdomain selector was mistyped.', solution: 'Check exact subdomain path and TTL propagation time.' }
    ],
    securityPrivacy: { isLocalProcessing: true, details: 'Queries are executed via DoH.' },
    faq: [
      { question: 'Can a domain have multiple TXT records?', answer: 'Yes. A domain can host multiple TXT records simultaneously.' }
    ],
    technicalReferences: [
      { title: 'RFC 1035 Section 3.3.14', url: 'https://datatracker.ietf.org/doc/html/rfc1035', description: 'Definition of TXT resource record format.' }
    ],
    summary: 'TXT lookup is invaluable for verifying domain ownership and auditing email security configurations.'
  },

  'cname-lookup': {
    toolId: 'cname-lookup',
    introduction: 'The CNAME Lookup tool queries Canonical Name records to identify hostname aliases and their canonical target hostnames. It resolves alias chains used in CDNs, PaaS platforms, and subdomains.',
    whatIsIt: {
      title: 'What is a CNAME Record?',
      content: [
        'A CNAME (Canonical Name) record creates an alias pointing one domain name to another domain name.',
        'When a DNS lookup encounters a CNAME record, it replaces the queried name with the canonical target and restarts resolution.'
      ]
    },
    howItWorks: {
      title: 'How CNAME Lookup Works',
      steps: [
        'Queries DoH endpoint for CNAME record on specified subdomain.',
        'Extracts the target canonical hostname.',
        'Follows alias chain if multiple nested CNAME records exist.'
      ]
    },
    howToUse: {
      title: 'How to Check CNAME Records',
      steps: [
        'Enter subdomain (e.g. www.example.com or app.example.com).',
        'Click Lookup CNAME.',
        'View canonical target hostname.'
      ]
    },
    examples: [
      {
        title: 'CDN Alias Resolution',
        input: 'www.example.com',
        output: 'www.example.com -> d12345.cloudfront.net',
        explanation: 'Points www.example.com to AWS CloudFront distribution.'
      }
    ],
    resultExplanation: {
      title: 'Understanding CNAME Lookup Results',
      fields: [
        { name: 'Alias Hostname', type: 'String', description: 'The subdomain acting as an alias.' },
        { name: 'Canonical Target', type: 'String', description: 'The destination domain name receiving traffic.' }
      ]
    },
    commonMistakes: [
      {
        title: 'Creating a CNAME Record at Root Domain Apex (@)',
        description: 'RFC 1034 prohibits CNAME records at apex (@) because CNAME overrides all other record types (SOA, NS, MX).',
        badExample: 'example.com IN CNAME target.com',
        goodExample: 'Use ALIAS or ANAME record provided by DNS host, or CNAME only on subdomains like www.example.com.'
      }
    ],
    bestPractices: [
      'Only use CNAME on subdomains (e.g. www, app, mail).',
      'Avoid deep CNAME chaining (>3 hops) to minimize DNS resolution latency.'
    ],
    useCases: [
      { title: 'CDN Setup Verification', description: 'Verify custom subdomains point to Cloudflare, AWS CloudFront, or Fastly targets.' },
      { title: 'PaaS Integration', description: 'Confirm Vercel, Netlify, or Heroku custom domains are correctly aliased.' }
    ],
    troubleshooting: [
      { problem: 'CNAME Loop Error', cause: 'Domain A points to Domain B, which points back to Domain A.', solution: 'Break circular aliasing in DNS manager.' }
    ],
    securityPrivacy: { isLocalProcessing: true, details: 'Executed over DNS-over-HTTPS.' },
    faq: [
      { question: 'Can CNAME coexist with MX records on the same subdomain?', answer: 'No. RFC 1034 specifies that CNAME cannot coexist with any other record type on the same name.' }
    ],
    technicalReferences: [
      { title: 'RFC 1034 - Domain Concepts and Facilities', url: 'https://datatracker.ietf.org/doc/html/rfc1034', description: 'Specifies CNAME alias rules and restrictions.' }
    ],
    summary: 'CNAME lookup allows network administrators to verify alias hostnames for CDNs and cloud applications.'
  },

  'spf-checker': {
    toolId: 'spf-checker',
    introduction: 'The SPF Checker inspects Sender Policy Framework records published in DNS. It validates SPF syntax, checks for the 10 DNS lookup limit, identifies unauthorized IP ranges, and highlights misconfigured mechanisms.',
    whatIsIt: {
      title: 'What is SPF (Sender Policy Framework)?',
      content: [
        'SPF (RFC 7208) is an email authentication mechanism that allows domain owners to publish a list of authorized IP addresses and servers allowed to send mail on behalf of their domain.',
        'Receiving mail servers check the SPF TXT record during SMTP connection to detect spoofed sender addresses.'
      ],
      keyConcepts: [
        { term: 'v=spf1', explanation: 'Required version prefix identifier.' },
        { term: 'include:', explanation: 'Includes authorized IP lists from external service providers (e.g. include:_spf.google.com).' },
        { term: '10 DNS Lookup Limit', explanation: 'RFC 7208 hard limit restricting SPF evaluation to a maximum of 10 nested DNS queries.' }
      ]
    },
    howItWorks: {
      title: 'How SPF Validation Operates',
      steps: [
        'Fetches TXT records starting with v=spf1 for the target domain.',
        'Parses mechanisms: ip4, ip6, include, a, mx, redirect, and modifier tags.',
        'Recursively evaluates nested include directives to count total DNS lookups.',
        'Reports syntax errors, DNS lookup counts, and default qualifier (~all or -all).'
      ]
    },
    howToUse: {
      title: 'How to Check SPF Records',
      steps: [
        'Enter domain name (e.g. company.com).',
        'Click Check SPF Record.',
        'Review lookup counts, authorized IPs, and syntax status.'
      ]
    },
    examples: [
      {
        title: 'Valid Google & SendGrid SPF Record',
        input: 'example.com',
        output: 'v=spf1 include:_spf.google.com include:sendgrid.net ~all',
        explanation: 'Valid SPF record permitting Google Workspace and SendGrid to send emails for example.com.'
      }
    ],
    resultExplanation: {
      title: 'Understanding SPF Checker Results',
      fields: [
        { name: 'SPF Record String', type: 'String', description: 'Raw v=spf1 string from DNS.' },
        { name: 'DNS Lookup Count', type: 'Number', description: 'Total DNS lookups (must not exceed 10).' },
        { name: 'Default Enforcement', type: 'String', description: 'Policy qualifier (-all = Hard Fail, ~all = Soft Fail).' }
      ]
    },
    commonMistakes: [
      {
        title: 'Exceeding 10 DNS Lookups (PermError)',
        description: 'Having too many include: or a/mx mechanisms causes SPF evaluation to fail with PermError on receiving servers.',
        badExample: 'v=spf1 include:a.com include:b.com include:c.com include:d.com include:e.com (over 10 total lookups)',
        goodExample: 'Use SPF flattening to replace nested domain includes with direct ip4 ranges.'
      },
      {
        title: 'Publishing Multiple SPF Records for One Domain',
        description: 'A domain MUST NOT have more than one SPF TXT record.',
        badExample: 'Record 1: v=spf1 include:_spf.google.com ~all\nRecord 2: v=spf1 ip4:192.0.2.1 ~all',
        goodExample: 'Merge into one record: v=spf1 include:_spf.google.com ip4:192.0.2.1 ~all'
      }
    ],
    bestPractices: [
      'Use ~all (SoftFail) during initial deployment, then move to -all (HardFail) when verified.',
      'Regularly audit included third-party email providers and remove legacy services.',
      'Keep total DNS lookup count well under 10.'
    ],
    useCases: [
      { title: 'Email Deliverability Optimization', description: 'Prevent legitimate emails from being marked as spam due to SPF PermError.' },
      { title: 'Email Spoofing Prevention', description: 'Block unauthorized servers from spoofing your domain name.' }
    ],
    troubleshooting: [
      { problem: 'SPF PermError (Too many DNS lookups)', cause: 'Nested includes exceeded 10 queries.', solution: 'Flatten SPF records into direct IP ranges.' }
    ],
    securityPrivacy: { isLocalProcessing: true, details: 'DNS lookup executed via DoH.' },
    faq: [
      { question: 'What is the difference between ~all and -all?', answer: '~all (SoftFail) accepts mail but marks it suspicious; -all (HardFail) instructs receiving servers to reject unauthorized mail.' }
    ],
    technicalReferences: [
      { title: 'RFC 7208 - Sender Policy Framework (SPF)', url: 'https://datatracker.ietf.org/doc/html/rfc7208', description: 'Official RFC specification for SPF.' }
    ],
    summary: 'Auditing SPF records is essential to prevent email spoofing and ensure message deliverability.'
  },

  'dkim-checker': {
    toolId: 'dkim-checker',
    introduction: 'The DKIM Checker verifies DomainKeys Identified Mail (DKIM) records by fetching selector-based TXT public keys from DNS. It checks cryptographic key length, algorithm types (RSA/Ed25519), and key formatting.',
    whatIsIt: {
      title: 'What is DKIM?',
      content: [
        'DKIM (RFC 6376) provides cryptographic email authentication. The sender\'s mail server signs outgoing emails with a private key, and the receiver verifies the signature against the public key published in DNS.'
      ],
      keyConcepts: [
        { term: 'Selector', explanation: 'Subdomain prefix identifying specific signing keys (e.g. google._domainkey.example.com).' },
        { term: 'Public Key (p=)', explanation: 'Base64-encoded public key string published in DNS.' }
      ]
    },
    howItWorks: {
      title: 'How DKIM Verification Works',
      steps: [
        'Queries DNS for <selector>._domainkey.<domain> TXT record.',
        'Parses tags: v=DKIM1, k=rsa, p=<public_key>.',
        'Validates Base64 decoding and measures public key bit length (1024-bit vs 2048-bit).'
      ]
    },
    howToUse: {
      title: 'How to Check DKIM Records',
      steps: [
        'Enter domain name (e.g. example.com).',
        'Enter selector name (e.g. google, default, s1, k1).',
        'Click Check DKIM Record.'
      ]
    },
    examples: [
      {
        title: 'Google Workspace DKIM Selector Lookup',
        input: 'Domain: example.com, Selector: google',
        output: 'v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQ...',
        explanation: 'Valid 2048-bit RSA public key retrieved from google._domainkey.example.com.'
      }
    ],
    resultExplanation: {
      title: 'Understanding DKIM Checker Results',
      fields: [
        { name: 'DKIM Selector Host', type: 'String', description: 'Full DNS path queried.' },
        { name: 'Key Length', type: 'Number', description: 'Bit size of public key (2048-bit recommended).' },
        { name: 'Key Algorithm (k=)', type: 'String', description: 'Algorithm type (rsa or ed25519).' }
      ]
    },
    commonMistakes: [
      {
        title: 'Using Weak 1024-bit DKIM Keys',
        description: '1024-bit RSA keys are vulnerable to factoring attacks; modern security standards require 2048-bit keys.',
        badExample: 'k=rsa; p=1024-bit key string',
        goodExample: 'k=rsa; p=2048-bit key string'
      }
    ],
    bestPractices: [
      'Use 2048-bit RSA keys or Ed25519 keys.',
      'Rotate DKIM keys at least once per year.',
      'Maintain unique DKIM selectors for each third-party sending service.'
    ],
    useCases: [
      { title: 'Email Deliverability Repair', description: 'Fix DKIM verification failures on incoming mail gateways.' },
      { title: 'Email Spoofing Defense', description: 'Ensure digital signatures match published DNS public keys.' }
    ],
    troubleshooting: [
      { problem: 'DKIM Record Not Found', cause: 'Incorrect selector name or missing DNS TXT record.', solution: 'Confirm selector string in your email provider admin console.' }
    ],
    securityPrivacy: { isLocalProcessing: true, details: 'DNS query via DoH. No private keys are ever exposed or queried.' },
    faq: [
      { question: 'What is a DKIM selector?', answer: 'A selector is a string tag allowing a domain to publish multiple public keys for different mail servers.' }
    ],
    technicalReferences: [
      { title: 'RFC 6376 - DomainKeys Identified Mail (DKIM)', url: 'https://datatracker.ietf.org/doc/html/rfc6376', description: 'Core specification for DKIM signatures.' }
    ],
    summary: 'DKIM records establish cryptographic authenticity for outgoing domain email.'
  },

  'dmarc-checker': {
    toolId: 'dmarc-checker',
    introduction: 'The DMARC Checker inspects Domain-based Message Authentication, Reporting, and Conformance (DMARC) records published at _dmarc.domain. It evaluates enforcement policy (none, quarantine, reject), alignment directives, and aggregate/forensic reporting endpoints.',
    whatIsIt: {
      title: 'What is DMARC?',
      content: [
        'DMARC (RFC 7489) builds upon SPF and DKIM protocols to specify how receiving mail servers should handle messages that fail authentication checks.',
        'DMARC allows domain owners to request feedback reports (rua/ruf) detailing all mail sent using their domain.'
      ],
      keyConcepts: [
        { term: 'p=none', explanation: 'Monitoring policy. Unauthenticated emails are delivered normally, but reports are sent.' },
        { term: 'p=quarantine', explanation: 'Enforcement policy. Unauthenticated emails are sent to spam/quarantine folders.' },
        { term: 'p=reject', explanation: 'Full enforcement policy. Unauthenticated emails are blocked outright by receiving mail servers.' }
      ]
    },
    howItWorks: {
      title: 'How DMARC Checking Works',
      steps: [
        'Queries DNS for _dmarc.<domain> TXT record.',
        'Parses tags: v=DMARC1, p=policy, rua=mailto:..., pct=100.',
        'Evaluates alignment settings (aspf, adkim) and reporting URI syntax.',
        'Provides security rating based on enforcement policy strength.'
      ]
    },
    howToUse: {
      title: 'How to Check DMARC Records',
      steps: [
        'Enter root domain name (e.g. example.com).',
        'Click Check DMARC Record.',
        'Review enforcement policy (none, quarantine, reject) and aggregate report receivers.'
      ]
    },
    examples: [
      {
        title: 'Strict DMARC Policy Example',
        input: 'example.com',
        output: 'v=DMARC1; p=reject; rua=mailto:dmarc-reports@example.com; pct=100',
        explanation: 'Instructs receivers to reject 100% of emails failing SPF/DKIM alignment and send reports to dmarc-reports@example.com.'
      }
    ],
    resultExplanation: {
      title: 'Understanding DMARC Results',
      fields: [
        { name: 'Policy (p=)', type: 'String', description: 'Action for unauthenticated email (none, quarantine, reject).' },
        { name: 'Aggregate Reports (rua=)', type: 'String', description: 'Email address receiving XML summary reports.' },
        { name: 'Percentage (pct=)', type: 'Number', description: 'Percentage of messages subjected to policy filtering (1-100).' }
      ]
    },
    commonMistakes: [
      {
        title: 'Staying on p=none Indefinitely',
        description: 'p=none provides monitoring but zero active protection against spoofing attacks.',
        badExample: 'v=DMARC1; p=none (left unmonitored for years)',
        goodExample: 'Transition from p=none -> p=quarantine -> p=reject after reviewing rua reports.'
      }
    ],
    bestPractices: [
      'Set up a dedicated report processing inbox for rua addresses.',
      'Achieve 100% SPF/DKIM alignment before moving policy to p=reject.',
      'Set sp= policy tag to protect subdomains.'
    ],
    useCases: [
      { title: 'Domain Brand Protection', description: 'Stop phishing campaigns spoofing your corporate domain.' },
      { title: 'BIMI Qualification', description: 'Strict DMARC (quarantine/reject) is required to display verified brand logos in inboxes (BIMI).' }
    ],
    troubleshooting: [
      { problem: 'DMARC Record Missing', cause: 'No TXT record found at _dmarc.yourdomain.com.', solution: 'Add a DMARC TXT record with at least v=DMARC1; p=none; rua=mailto:your@email.com.' }
    ],
    securityPrivacy: { isLocalProcessing: true, details: 'DNS query via DoH.' },
    faq: [
      { question: 'What is the difference between SPF/DKIM alignment and pass?', answer: 'Alignment requires the domain in the From: header to match the domain validated by SPF or DKIM.' }
    ],
    technicalReferences: [
      { title: 'RFC 7489 - DMARC Specification', url: 'https://datatracker.ietf.org/doc/html/rfc7489', description: 'Official RFC for DMARC policy enforcement.' }
    ],
    summary: 'DMARC is the final line of defense for domain email authentication and anti-phishing enforcement.'
  },

  'ssl-checker': {
    toolId: 'ssl-checker',
    introduction: 'The SSL/TLS Checker verifies SSL/TLS certificates for HTTPS hostnames. It checks certificate expiration dates, issuing Certificate Authority (CA), SAN hostname coverage, protocol support, and TLS handshake health.',
    whatIsIt: {
      title: 'What is an SSL/TLS Certificate?',
      content: [
        'SSL/TLS certificates authenticate server identity and establish encrypted HTTPS sessions between web browsers and web servers using X.509 PKI standards.'
      ],
      keyConcepts: [
        { term: 'X.509 Certificate', explanation: 'Digital certificate format containing public key, issuer signature, and domain Subject Alternative Names (SAN).' },
        { term: 'Certificate Authority (CA)', explanation: 'Trusted third party (e.g. Let\'s Encrypt, DigiCert) that signs SSL certificates.' },
        { term: 'Expiration / Lifetime', explanation: 'Max validity for public SSL certificates is 398 days.' }
      ]
    },
    howItWorks: {
      title: 'How SSL Checking Works',
      steps: [
        'Initiates TLS handshake over port 443 with target hostname.',
        'Extracts leaf certificate, issuer chain, and expiration timestamps.',
        'Calculates remaining days until expiration.',
        'Validates host SAN matching.'
      ]
    },
    howToUse: {
      title: 'How to Check SSL Certificates',
      steps: [
        'Enter domain name (e.g. example.com or api.example.com).',
        'Click Check SSL Certificate.',
        'Inspect validity status, days remaining, and issuer identity.'
      ]
    },
    examples: [
      {
        title: 'Checking Valid SSL Certificate',
        input: 'example.com',
        output: 'Status: Valid\nIssuer: Let\'s Encrypt Authority X3\nDays Remaining: 72 days\nSANs: example.com, www.example.com',
        explanation: 'Shows active, valid TLS certificate.'
      }
    ],
    resultExplanation: {
      title: 'Understanding SSL Checker Results',
      fields: [
        { name: 'Expiration Date', type: 'Date', description: 'Date when certificate becomes invalid.' },
        { name: 'Days Remaining', type: 'Number', description: 'Days left before renewal required.' },
        { name: 'Subject Alternative Names (SAN)', type: 'Array', description: 'Hostnames covered by this single certificate.' }
      ]
    },
    commonMistakes: [
      {
        title: 'Allowing Certificates to Expire',
        description: 'Expired certificates trigger severe browser warnings blocking 100% of user traffic.',
        badExample: 'Renewing 1 hour before expiration manually.',
        goodExample: 'Automate renewal with Certbot / ACME 30 days prior to expiration.'
      }
    ],
    bestPractices: [
      'Automate certificate renewal using ACME / Let\'s Encrypt.',
      'Configure automated alerts 30 days before expiration date.',
      'Ensure intermediate CA certificates are properly chained on your web server.'
    ],
    useCases: [
      { title: 'Outage Prevention', description: 'Prevent unexpected downtime caused by expired TLS certificates.' },
      { title: 'Compliance Auditing', description: 'Ensure all corporate public web endpoints use valid SSL certificates.' }
    ],
    troubleshooting: [
      { problem: 'Intermediate Certificate Missing', cause: 'Server sends leaf certificate without intermediate chain.', solution: 'Bundle fullchain.pem on Nginx / Apache config.' }
    ],
    securityPrivacy: { isLocalProcessing: true, details: 'TLS handshake performed via browser fetch API.' },
    faq: [
      { question: 'Why are SSL certificates limited to 398 days?', answer: 'Browser vendors enforcement reduces risk of compromised key longevity.' }
    ],
    technicalReferences: [
      { title: 'RFC 5280 - X.509 PKI Certificate Profile', url: 'https://datatracker.ietf.org/doc/html/rfc5280', description: 'RFC specification for X.509 certificates.' }
    ],
    summary: 'Checking SSL/TLS health guarantees secure encrypted sessions and prevents costly outage downtime.'
  }
}
