import type { ToolGuide } from '@/types/guide'

export const networkingGuides: Record<string, ToolGuide> = {
  'subnet-calculator': {
    toolId: 'subnet-calculator',
    introduction: 'An IPv4 subnet calculator helps you determine the network address, broadcast address, subnet mask, address range, and usable host capacity for a given CIDR block. It is essential when designing networks, configuring cloud VPC subnets, planning Kubernetes pod networks, or troubleshooting routing and IP allocations.',
    whatIsIt: {
      title: 'What is IPv4 Subnetting?',
      content: [
        'Subnetting is the practice of logically partitioning a single physical IPv4 network into multiple smaller sub-networks (subnets).',
        'An IPv4 address consists of 32 bits divided into four 8-bit octets. Subnetting uses a subnet mask (or CIDR prefix) to divide these 32 bits into a Network ID portion and a Host ID portion.'
      ],
      keyConcepts: [
        { term: 'IPv4 Address', explanation: '32-bit binary number represented as 4 decimal octets (e.g. 192.168.1.1).' },
        { term: 'Subnet Mask', explanation: 'Bitmask where 1s designate network bits and 0s designate host bits (e.g. 255.255.255.0).' },
        { term: 'CIDR Notation', explanation: 'Classless Inter-Domain Routing prefix length denoting network bits (e.g. /24).' },
        { term: 'Network Address', explanation: 'First address in a subnet range where all host bits are set to 0. Cannot be assigned to a host.' },
        { term: 'Broadcast Address', explanation: 'Last address in a subnet range where all host bits are set to 1. Used to broadcast packets to all hosts in the subnet.' }
      ]
    },
    howItWorks: {
      title: 'How Subnet Calculation Logic Works',
      steps: [
        'Converts the 4 decimal octets of the IPv4 address into a 32-bit unsigned integer.',
        'Calculates the 32-bit subnet mask integer using the prefix length N: mask = (0xFFFFFFFF << (32 - N)) & 0xFFFFFFFF.',
        'Computes Network Address by applying bitwise AND: network = ip & mask.',
        'Computes Broadcast Address by applying bitwise OR with inverted mask: broadcast = network | (~mask).',
        'Derives First Usable IP (network + 1) and Last Usable IP (broadcast - 1).',
        'Calculates Total Hosts (2^(32 - N)) and Usable Hosts (Total - 2).'
      ],
      technicalDetails: 'All bitwise arithmetic is performed locally in browser memory without sending data to servers.'
    },
    howToUse: {
      title: 'How to Use the Subnet Calculator',
      steps: [
        'Enter an IPv4 address (e.g. 10.0.0.1 or 192.168.1.0).',
        'Select or enter the CIDR prefix length (e.g. /24, /16, /28).',
        'Click Calculate.',
        'Review network address, broadcast address, netmask, wildcard mask, and usable host count.'
      ]
    },
    examples: [
      {
        title: 'Standard Office Network (/24)',
        input: '192.168.1.50 /24',
        output: 'Network: 192.168.1.0\nSubnet Mask: 255.255.255.0\nBroadcast: 192.168.1.255\nUsable Range: 192.168.1.1 - 192.168.1.254\nUsable Hosts: 254',
        explanation: '/24 leaves 8 host bits (2^8 = 256 addresses). Subtracting network and broadcast leaves 254 assignable host addresses.'
      },
      {
        title: 'Cloud Micro-Subnet (/28)',
        input: '10.0.1.35 /28',
        output: 'Network: 10.0.1.32\nSubnet Mask: 255.255.255.240\nBroadcast: 10.0.1.47\nUsable Hosts: 14',
        explanation: '/28 allocates 16 total IP addresses per subnet, ideal for small database clusters or internal load balancers.'
      },
      {
        title: 'Point-to-Point Link (/30)',
        input: '172.16.0.1 /30',
        output: 'Network: 172.16.0.0\nSubnet Mask: 255.255.255.252\nBroadcast: 172.16.0.3\nUsable Hosts: 2',
        explanation: '/30 produces exactly 2 usable host IPs, traditionally used for point-to-point router links.'
      }
    ],
    resultExplanation: {
      title: 'Understanding Subnet Calculation Output',
      fields: [
        { name: 'Network Address', type: 'IPv4 String', description: 'The identifier for the subnet itself. All host bits are 0.' },
        { name: 'Subnet Mask', type: 'Dotted Decimal', description: 'Bitmask separating network portion from host portion.' },
        { name: 'Wildcard Mask', type: 'Dotted Decimal', description: 'Inverted subnet mask used in Cisco ACLs and firewall rules.' },
        { name: 'Broadcast Address', type: 'IPv4 String', description: 'Special destination address to send packets to all hosts in subnet.' },
        { name: 'First Usable Host', type: 'IPv4 String', description: 'First assignable IP address for devices (Network + 1).' },
        { name: 'Last Usable Host', type: 'IPv4 String', description: 'Last assignable IP address for devices (Broadcast - 1).' },
        { name: 'Total Addresses', type: 'Integer', description: 'Total IP count mathematically in the block (2^(32 - CIDR)).' },
        { name: 'Usable Hosts', type: 'Integer', description: 'Total IP count available for assignment (Total - 2, or AWS/GCP reserve 5).' }
      ]
    },
    commonMistakes: [
      {
        title: 'Assigning Network or Broadcast Address to a Host Interface',
        description: 'Attempting to configure a router or server interface with the network or broadcast address will cause IP assignment failures.',
        badExample: 'Assigning 192.168.1.0/24 to a server network interface card.',
        goodExample: 'Assign 192.168.1.1 through 192.168.1.254 to hosts; reserve 192.168.1.0 as the network ID.'
      },
      {
        title: 'Ignoring Cloud Provider Reserved IPs (AWS/Azure/GCP)',
        description: 'AWS VPCs reserve the first 4 IP addresses and the last IP address in every subnet (5 IPs total), not just 2.',
        badExample: 'Assuming a /28 subnet in AWS VPC has 14 usable IPs.',
        goodExample: 'In AWS VPC /28, 16 - 5 = 11 usable host IP addresses.'
      }
    ],
    bestPractices: [
      'Always leave growth capacity (e.g. 20-30% extra IPs) when designing subnets.',
      'Document CIDR allocations in an IPAM (IP Address Management) tool to prevent subnet overlaps.',
      'Use /24 or /23 for Kubernetes node subnets to ensure sufficient Pod IPs per node.'
    ],
    useCases: [
      { title: 'Cloud VPC Architecture', description: 'Partitioning a /16 VPC into public, private, and database subnets across availability zones.' },
      { title: 'Kubernetes Pod Networking', description: 'Calculating CIDR ranges for CNI plugins (Calico, Flannel, AWS CNI) to support pod density.' },
      { title: 'Firewall & ACL Configuration', description: 'Deriving wildcard masks for Cisco or Juniper firewall rule definitions.' }
    ],
    troubleshooting: [
      { problem: 'Invalid IP or CIDR format', cause: 'Entering numbers >255 or prefix outside 0-32 range.', solution: 'Ensure IP octets are 0-255 and CIDR is between /0 and /32.' }
    ],
    securityPrivacy: {
      isLocalProcessing: true,
      details: 'Subnet calculations are performed 100% locally in browser memory. IP addresses and subnets entered are never transmitted to any external server.'
    },
    faq: [
      { question: 'What does /24 mean in IP address notation?', answer: '/24 means the first 24 bits are network bits, leaving 8 host bits (256 addresses, 254 usable).' },
      { question: 'What is the difference between /31 and /30 for point-to-point links?', answer: 'RFC 3021 allows /31 subnets (2 addresses) to be used without network/broadcast overhead on point-to-point links, saving IP addresses.' },
      { question: 'What is a wildcard mask?', answer: 'A wildcard mask is the bitwise inverse of a subnet mask (e.g. mask 255.255.255.0 -> wildcard 0.0.0.255), used in ACL rules.' }
    ],
    technicalReferences: [
      { title: 'RFC 4632 - Classless Inter-domain Routing (CIDR)', url: 'https://datatracker.ietf.org/doc/html/rfc4632', description: 'Core standard defining CIDR IP addressing and subnet masks.' },
      { title: 'RFC 3021 - Using 31-Bit Prefix Lengths on Point-to-Point Links', url: 'https://datatracker.ietf.org/doc/html/rfc3021', description: 'Standard for /31 point-to-point link allocation.' }
    ],
    summary: 'Subnet calculation is fundamental for cloud engineers and network administrators to plan IP space efficiently and prevent network overlaps.'
  },

  'cidr-calculator': {
    toolId: 'cidr-calculator',
    introduction: 'The CIDR Calculator allows network engineers to inspect, divide, and aggregate Classless Inter-Domain Routing (CIDR) blocks. It provides subnet breakdown, binary representations, mask details, and usable IP counts.',
    whatIsIt: {
      title: 'What is CIDR Notation?',
      content: [
        'Classless Inter-Domain Routing (CIDR) replaced the legacy Class A, B, and C networking system in 1993 to stop rapid IPv4 exhaustion.',
        'CIDR uses a variable-length subnet mask (VLSM) indicated by a slash followed by prefix length (e.g. /16 or /24).'
      ]
    },
    howItWorks: {
      title: 'How CIDR Calculations Work',
      steps: [
        'Parses CIDR notation into IP base address and prefix integer.',
        'Computes bitmasks and binary representation.',
        'Splits parent CIDR into smaller child subnets on request.'
      ]
    },
    howToUse: {
      title: 'How to Use CIDR Calculator',
      steps: [
        'Enter CIDR string (e.g. 10.0.0.0/16).',
        'Click Calculate.',
        'Inspect netmask, IP range, and host capacities.'
      ]
    },
    examples: [
      {
        title: 'VPC CIDR Block (/16)',
        input: '10.100.0.0/16',
        output: 'Subnet Mask: 255.255.0.0\nTotal IPs: 65,536\nUsable Range: 10.100.0.1 - 10.100.255.254',
        explanation: 'Provides 65,536 addresses suitable for large enterprise cloud deployments.'
      }
    ],
    resultExplanation: {
      title: 'Understanding CIDR Calculation Results',
      fields: [
        { name: 'CIDR Block', type: 'String', description: 'Full CIDR specification.' },
        { name: 'Mask Bits', type: 'Number', description: 'Count of network bits.' },
        { name: 'Host Bits', type: 'Number', description: 'Count of assignable host bits (32 - CIDR).' }
      ]
    },
    commonMistakes: [
      {
        title: 'Overlapping CIDR Blocks in Peer Networks',
        description: 'Assigning identical CIDR ranges (e.g. 10.0.0.0/16) to two VPCs prevents VPC peering and VPN routing.',
        badExample: 'VPC A = 10.0.0.0/16, VPC B = 10.0.0.0/16',
        goodExample: 'VPC A = 10.1.0.0/16, VPC B = 10.2.0.0/16'
      }
    ],
    bestPractices: [
      'Use RFC 1918 private ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) for internal networks.',
      'Allocate CIDR blocks hierarchically to allow route summarization.'
    ],
    useCases: [
      { title: 'VPC Peering Planning', description: 'Ensure CIDR ranges do not collide across cloud regions or multi-cloud setups.' }
    ],
    troubleshooting: [
      { problem: 'Host bits set in network address', cause: 'Entering 192.168.1.50/24 instead of 192.168.1.0/24.', solution: 'Tool automatically zeroes host bits to display true network ID.' }
    ],
    securityPrivacy: { isLocalProcessing: true, details: 'Processed locally in browser.' },
    faq: [
      { question: 'What is CIDR aggregation / supernetting?', answer: 'Combining multiple smaller adjacent CIDR blocks into one larger prefix to shrink routing tables.' }
    ],
    technicalReferences: [
      { title: 'RFC 4632 - CIDR Specification', url: 'https://datatracker.ietf.org/doc/html/rfc4632', description: 'IETF standard for CIDR.' }
    ],
    summary: 'CIDR calculation is vital for clean network hierarchy and cloud VPC architecture.'
  },

  'ipv4-calculator': {
    toolId: 'ipv4-calculator',
    introduction: 'The IPv4 Calculator analyzes any IPv4 address to determine its IP class (A, B, C, D, E), private vs public status, binary representation, integer representation, hexadecimal format, and loopback/multicast properties.',
    whatIsIt: {
      title: 'What is an IPv4 Address?',
      content: [
        'IPv4 addresses are 32-bit numeric identifiers formatted into four 8-bit octets separated by dots.',
        'Addresses are categorized into RFC 1918 Private Ranges, Public Ranges, Loopback (127.0.0.0/8), Link-Local (169.254.0.0/16), and Multicast Class D.'
      ]
    },
    howItWorks: {
      title: 'How IPv4 Analysis Works',
      steps: [
        'Splits octets and validates range (0-255).',
        'Converts IP into 32-bit binary string and unsigned integer.',
        'Evaluates RFC 1918 private scopes and special-use address registers (RFC 6890).'
      ]
    },
    howToUse: {
      title: 'How to Analyze IPv4 Address',
      steps: [
        'Enter IPv4 address (e.g. 172.16.25.4).',
        'Click Analyze.',
        'View binary, hex, class type, and public/private status.'
      ]
    },
    examples: [
      {
        title: 'RFC 1918 Private Class B Address',
        input: '172.16.50.1',
        output: 'Class: B\nType: Private (RFC 1918)\nBinary: 10101100.00010000.00110010.00000001\nHex: AC103201',
        explanation: 'Identifies private range address safely usable behind NAT routers.'
      }
    ],
    resultExplanation: {
      title: 'Understanding IPv4 Analysis Results',
      fields: [
        { name: 'IP Class', type: 'String', description: 'Class A (1-126), Class B (128-191), Class C (192-223), Class D Multicast (224-239).' },
        { name: 'Scope Type', type: 'String', description: 'Public, Private, Loopback, Link-Local, or Reserved.' },
        { name: '32-Bit Integer', type: 'Number', description: 'Numeric integer equivalent used in database storage.' }
      ]
    },
    commonMistakes: [
      {
        title: 'Using Public IP Ranges on Internal LANs',
        description: 'Using unassigned public IPs internally prevents access to those real public websites.',
        badExample: 'Assigning 8.8.8.0/24 to office LAN hosts.',
        goodExample: 'Use RFC 1918 ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16).'
      }
    ],
    bestPractices: [
      'Store IP addresses in databases as 32-bit unsigned integers for fast indexing and query performance.'
    ],
    useCases: [
      { title: 'Log File Parsing', description: 'Convert hex or integer IP values from firewall logs into readable dotted-decimal notation.' }
    ],
    troubleshooting: [
      { problem: 'Leading Zero Octet Parse Error', cause: 'Entering 192.168.01.1 leading zero can be parsed as octal in some system tools.', solution: 'Avoid leading zeroes in octets.' }
    ],
    securityPrivacy: { isLocalProcessing: true, details: 'Analyzed entirely in browser memory.' },
    faq: [
      { question: 'What is a link-local APIPA address?', answer: '169.254.x.x addresses automatically assigned when DHCP server fails to respond.' }
    ],
    technicalReferences: [
      { title: 'RFC 6890 - Special-Purpose IP Address Registries', url: 'https://datatracker.ietf.org/doc/html/rfc6890', description: 'Specifies reserved IPv4 address scopes.' }
    ],
    summary: 'IPv4 address analysis aids network classification, debugging, and database conversion.'
  },

  'ipv6-calculator': {
    toolId: 'ipv6-calculator',
    introduction: 'The IPv6 Calculator analyzes 128-bit IPv6 addresses. It expands zero-compressed addresses, compresses full addresses to RFC 5952 standard format, calculates subnet boundaries, and determines address scope (Global Unicast, Link-Local, Unique Local, Loopback).',
    whatIsIt: {
      title: 'What is IPv6 Addressing?',
      content: [
        'IPv6 uses 128-bit addresses formatted as 8 hex quads separated by colons (e.g. 2001:0db8:85a3:0000:0000:8a2e:0370:7334).',
        'RFC 5952 defines standard zero compression using :: once per address for consecutive 16-bit zero fields.'
      ]
    },
    howItWorks: {
      title: 'How IPv6 Processing Operates',
      steps: [
        'Expands compressed :: notation into full 32-digit hexadecimal representation.',
        'Applies RFC 5952 compression rules to produce canonical short string.',
        'Parses prefix length (e.g. /64) to calculate network prefix and interface identifier.'
      ]
    },
    howToUse: {
      title: 'How to Calculate IPv6 Addresses',
      steps: [
        'Enter IPv6 address string (e.g. 2001:db8::1/64).',
        'Click Analyze IPv6.',
        'View expanded address, canonical short address, scope type, and network prefix.'
      ]
    },
    examples: [
      {
        title: 'Compressing & Expanding IPv6',
        input: '2001:0db8:0000:0000:0000:0000:0000:0001 /64',
        output: 'Canonical Compressed: 2001:db8::1\nFull Expanded: 2001:0db8:0000:0000:0000:0000:0000:0001\nScope: Documentation (RFC 3849)',
        explanation: 'Replaces longest sequence of zero fields with ::.'
      }
    ],
    resultExplanation: {
      title: 'Understanding IPv6 Calculator Output',
      fields: [
        { name: 'Full Expanded', type: 'String', description: 'Complete 39-character address with leading zeroes.' },
        { name: 'Compressed Canonical', type: 'String', description: 'RFC 5952 standardized minimal string.' },
        { name: 'Scope Type', type: 'String', description: 'Global Unicast (2000::/3), Link-Local (fe80::/10), Unique Local (fc00::/7).' }
      ]
    },
    commonMistakes: [
      {
        title: 'Using Double Colon (::) Multiple Times in One Address',
        description: 'Using :: twice creates ambiguity about how many zero quads each :: represents.',
        badExample: '2001::db8::1 (INVALID)',
        goodExample: '2001:db8::1 (VALID)'
      }
    ],
    bestPractices: [
      'Use standard /64 subnets on host LAN segments to ensure SLAAC autoconfiguration works.',
      'Follow RFC 5952 rules when displaying IPv6 in logs to maintain consistent text matching.'
    ],
    useCases: [
      { title: 'Dual-Stack IPv6 Deployment', description: 'Calculate IPv6 /64 subnets for cloud infrastructure.' }
    ],
    troubleshooting: [
      { problem: 'Invalid IPv6 Address', cause: 'Hex character out of range or more than 8 quads.', solution: 'Ensure only hex digits (0-9, a-f) and max 8 quads are used.' }
    ],
    securityPrivacy: { isLocalProcessing: true, details: 'Executed client-side in browser.' },
    faq: [
      { question: 'What is fe80::/10 used for?', answer: 'Link-Local addresses used strictly within a single local network segment.' }
    ],
    technicalReferences: [
      { title: 'RFC 5952 - Recommendation for IPv6 Address Text Representation', url: 'https://datatracker.ietf.org/doc/html/rfc5952', description: 'Canonical formatting rules for IPv6.' }
    ],
    summary: 'IPv6 calculation simplifies expanding, compressing, and subnetting 128-bit addresses.'
  },

  'ip-range-calculator': {
    toolId: 'ip-range-calculator',
    introduction: 'The IP Range Calculator converts start and end IPv4 addresses into a minimum set of matching CIDR blocks, or vice versa. It calculates total host count, address gaps, and CIDR coverage for firewall configurations.',
    whatIsIt: {
      title: 'What is IP Range to CIDR Conversion?',
      content: [
        'Firewall rules and cloud security groups usually require CIDR notation rather than arbitrary start-to-end IP ranges.',
        'This tool calculates the smallest set of aligned CIDR blocks that precisely cover an arbitrary IP range.'
      ]
    },
    howItWorks: {
      title: 'How Range Calculation Works',
      steps: [
        'Converts start IP and end IP to 32-bit integers.',
        'Iteratively finds largest power-of-two CIDR block that fits within remaining range and aligns with start address boundaries.',
        'Returns list of covering CIDR blocks.'
      ]
    },
    howToUse: {
      title: 'How to Calculate IP Range',
      steps: [
        'Enter Start IP (e.g. 192.168.1.10).',
        'Enter End IP (e.g. 192.168.1.50).',
        'Click Calculate CIDR Range.',
        'Copy generated CIDR blocks into firewall rules.'
      ]
    },
    examples: [
      {
        title: 'Covering Arbitrary Range with CIDRs',
        input: 'Start: 192.168.1.1, End: 192.168.1.10',
        output: '192.168.1.1/32, 192.168.1.2/31, 192.168.1.4/30, 192.168.1.8/31, 192.168.1.10/32',
        explanation: 'Generates 5 CIDR blocks covering exact 10 IP address span.'
      }
    ],
    resultExplanation: {
      title: 'Understanding Range Results',
      fields: [
        { name: 'Matching CIDRs', type: 'Array', description: 'List of CIDR blocks covering range.' },
        { name: 'Total IP Count', type: 'Number', description: 'Total IP addresses spanning range.' }
      ]
    },
    commonMistakes: [
      {
        title: 'Entering End IP Smaller Than Start IP',
        description: 'Start IP integer must be less than or equal to End IP integer.',
        badExample: 'Start: 10.0.0.50, End: 10.0.0.1',
        goodExample: 'Start: 10.0.0.1, End: 10.0.0.50'
      }
    ],
    bestPractices: [
      'Align firewall rules to standard CIDR boundaries whenever possible to minimize ACL rule counts.'
    ],
    useCases: [
      { title: 'Security Group Whitelisting', description: 'Convert vendor IP address range lists into CIDR blocks for AWS Security Groups.' }
    ],
    troubleshooting: [
      { problem: 'Start IP greater than End IP', cause: 'Inverted values.', solution: 'Swap start and end address values.' }
    ],
    securityPrivacy: { isLocalProcessing: true, details: 'Processed locally in browser memory.' },
    faq: [
      { question: 'Why does one IP range produce multiple CIDR blocks?', answer: 'CIDR blocks must align on binary power-of-two boundaries; arbitrary ranges require multiple boundary-aligned blocks.' }
    ],
    technicalReferences: [
      { title: 'RFC 4632', url: 'https://datatracker.ietf.org/doc/html/rfc4632', description: 'CIDR addressing specification.' }
    ],
    summary: 'Converting IP ranges into CIDR blocks enables precise firewall rule definition.'
  }
}
