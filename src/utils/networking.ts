/**
 * Networking Utility Functions
 * All calculations are client-side. No network requests made.
 */

// ─── IPv4 helpers ────────────────────────────────────────────────────────────

export function ipToInt(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) | parseInt(octet, 10), 0) >>> 0
}

export function intToIp(n: number): string {
  return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff].join('.')
}

export function ipToBinary(ip: string): string {
  return ip
    .split('.')
    .map((o) => parseInt(o, 10).toString(2).padStart(8, '0'))
    .join('.')
}

export function getIpClass(ip: string): string {
  const first = parseInt(ip.split('.')[0], 10)
  if (first >= 1 && first <= 126) return 'A'
  if (first === 127) return 'Loopback'
  if (first >= 128 && first <= 191) return 'B'
  if (first >= 192 && first <= 223) return 'C'
  if (first >= 224 && first <= 239) return 'D (Multicast)'
  if (first >= 240 && first <= 255) return 'E (Reserved)'
  return 'Unknown'
}

export function isPrivateIP(ip: string): boolean {
  const n = ipToInt(ip)
  return (
    (n >= ipToInt('10.0.0.0') && n <= ipToInt('10.255.255.255')) ||
    (n >= ipToInt('172.16.0.0') && n <= ipToInt('172.31.255.255')) ||
    (n >= ipToInt('192.168.0.0') && n <= ipToInt('192.168.255.255')) ||
    (n >= ipToInt('127.0.0.0') && n <= ipToInt('127.255.255.255'))
  )
}

export function validateIPv4(ip: string): string | null {
  const parts = ip.trim().split('.')
  if (parts.length !== 4) return 'IPv4 address must have 4 octets.'
  for (const part of parts) {
    if (!/^\d+$/.test(part)) return 'Each octet must be a number.'
    const n = parseInt(part, 10)
    if (n < 0 || n > 255) return 'Each octet must be 0–255.'
  }
  return null
}

export function validateCIDRv4(cidr: string): string | null {
  const m = cidr.trim().match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/)
  if (!m) return 'Invalid CIDR format. Example: 192.168.1.0/24'
  const ipErr = validateIPv4(m[1])
  if (ipErr) return ipErr
  const prefix = parseInt(m[2], 10)
  if (prefix < 0 || prefix > 32) return 'Prefix must be 0–32.'
  return null
}

export interface SubnetInfo {
  cidr: string
  ipAddress: string
  networkAddress: string
  broadcastAddress: string
  subnetMask: string
  wildcardMask: string
  firstUsableIP: string
  lastUsableIP: string
  totalAddresses: number
  usableHosts: number
  prefixLength: number
  ipClass: string
  isPrivate: boolean
  binaryAddress: string
  binaryMask: string
  ipRange: string
  specialNote: string | null
}

export function calculateSubnet(cidrStr: string): SubnetInfo {
  const [ipStr, prefixStr] = cidrStr.trim().split('/')
  const prefix = parseInt(prefixStr, 10)

  const subnetMaskInt = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0
  const wildcardInt = (~subnetMaskInt) >>> 0
  const ipInt = ipToInt(ipStr)
  const networkInt = (ipInt & subnetMaskInt) >>> 0
  const broadcastInt = (networkInt | wildcardInt) >>> 0
  const totalAddresses = Math.pow(2, 32 - prefix)

  let firstUsableInt: number
  let lastUsableInt: number
  let usableHosts: number
  let specialNote: string | null = null

  if (prefix === 32) {
    firstUsableInt = networkInt
    lastUsableInt = networkInt
    usableHosts = 1
    specialNote = '/32 is a host route. It refers to exactly one IP address.'
  } else if (prefix === 31) {
    firstUsableInt = networkInt
    lastUsableInt = broadcastInt
    usableHosts = 2
    specialNote = '/31 is used for point-to-point links (RFC 3021). Both addresses are usable — there is no network or broadcast address.'
  } else {
    firstUsableInt = networkInt + 1
    lastUsableInt = broadcastInt - 1
    usableHosts = Math.max(0, totalAddresses - 2)
  }

  const networkAddress = intToIp(networkInt)
  const broadcastAddress = intToIp(broadcastInt)
  const subnetMask = intToIp(subnetMaskInt)
  const wildcardMask = intToIp(wildcardInt)

  return {
    cidr: cidrStr,
    ipAddress: ipStr,
    networkAddress,
    broadcastAddress,
    subnetMask,
    wildcardMask,
    firstUsableIP: intToIp(firstUsableInt),
    lastUsableIP: intToIp(lastUsableInt),
    totalAddresses,
    usableHosts,
    prefixLength: prefix,
    ipClass: getIpClass(networkAddress),
    isPrivate: isPrivateIP(networkAddress),
    binaryAddress: ipToBinary(ipStr),
    binaryMask: ipToBinary(subnetMask),
    ipRange: `${intToIp(firstUsableInt)} – ${intToIp(lastUsableInt)}`,
    specialNote,
  }
}

// ─── IP Range ────────────────────────────────────────────────────────────────

export interface IPRangeInfo {
  startIP: string
  endIP: string
  startInt: number
  endInt: number
  totalAddresses: number
  cidrApproximation: string
}

export function calculateIPRange(startIP: string, endIP: string): IPRangeInfo {
  const startInt = ipToInt(startIP)
  const endInt = ipToInt(endIP)
  const total = endInt - startInt + 1
  // Approximate CIDR: find the largest prefix that fits
  const bits = Math.ceil(Math.log2(Math.max(total, 1)))
  const prefix = Math.max(0, 32 - bits)
  return {
    startIP,
    endIP,
    startInt,
    endInt,
    totalAddresses: total,
    cidrApproximation: `/${prefix} (approx. ${Math.pow(2, 32 - prefix).toLocaleString()} addresses)`,
  }
}

// ─── IPv6 helpers ────────────────────────────────────────────────────────────

export function expandIPv6(ip: string): string {
  // Handle :: expansion
  let addr = ip.trim()
  // Handle IPv4-mapped: strip any trailing /prefix for expansion
  const slashIdx = addr.indexOf('/')
  let prefix = ''
  if (slashIdx !== -1) {
    prefix = addr.slice(slashIdx)
    addr = addr.slice(0, slashIdx)
  }

  // Replace :: with the correct number of zero groups
  if (addr.includes('::')) {
    const sides = addr.split('::')
    const left = sides[0] ? sides[0].split(':') : []
    const right = sides[1] ? sides[1].split(':') : []
    const missing = 8 - left.length - right.length
    const middle = Array(missing).fill('0000')
    const groups = [...left, ...middle, ...right]
    addr = groups.map((g) => g.padStart(4, '0')).join(':')
  } else {
    addr = addr.split(':').map((g) => g.padStart(4, '0')).join(':')
  }
  return addr + prefix
}

export function compressIPv6(expanded: string): string {
  const slashIdx = expanded.indexOf('/')
  let prefix = ''
  let addr = expanded
  if (slashIdx !== -1) {
    prefix = expanded.slice(slashIdx)
    addr = expanded.slice(0, slashIdx)
  }
  // Remove leading zeros in each group
  const compressed = addr
    .split(':')
    .map((g) => g.replace(/^0+/, '') || '0')
    .join(':')
  // Replace longest run of :0: with ::
  const result = compressed.replace(/(?:^|:)(?:0+:)+0*(?:$|:)/, (m) => {
    // We want the longest consecutive set
    return '::'
  })
  return result + prefix
}

export function getIPv6Type(expanded: string): string {
  const addr = expanded.replace(/\//g, '').toLowerCase()
  const groups = addr.split(':').map((g) => parseInt(g, 16))

  // Loopback ::1
  if (groups.slice(0, 7).every((g) => g === 0) && groups[7] === 1) return 'Loopback'
  // Unspecified ::
  if (groups.every((g) => g === 0)) return 'Unspecified'
  // Link-local fe80::/10
  if (groups[0] === 0xfe80) return 'Link-local'
  // Unique local fc00::/7
  if ((groups[0] & 0xfe00) === 0xfc00) return 'Unique Local'
  // Multicast ff00::/8
  if ((groups[0] & 0xff00) === 0xff00) return 'Multicast'
  // IPv4-mapped ::ffff:0:0/96
  if (groups.slice(0, 5).every((g) => g === 0) && groups[5] === 0xffff) return 'IPv4-mapped'
  // Documentation 2001:db8::/32
  if (groups[0] === 0x2001 && groups[1] === 0x0db8) return 'Documentation (not routable)'
  // Global unicast 2000::/3
  if ((groups[0] & 0xe000) === 0x2000) return 'Global Unicast'
  return 'Unknown'
}

export function validateIPv6(ip: string): string | null {
  const addr = ip.trim().split('/')[0]
  // Basic structure check
  if (addr.includes(':::')) return 'Invalid IPv6: triple colon not allowed.'
  const doubleColons = (addr.match(/::/g) || []).length
  if (doubleColons > 1) return 'Invalid IPv6: only one :: allowed.'

  const groups = addr.replace('::', ':xxxx:').split(':').filter(Boolean)
  if (!doubleColons && groups.length !== 8) return 'Invalid IPv6: must have 8 groups without ::.'
  if (groups.length > 8) return 'Invalid IPv6: too many groups.'

  for (const g of addr.split(':').filter(Boolean)) {
    if (!/^[0-9a-fA-F]{1,4}$/.test(g)) return `Invalid IPv6 group: "${g}"`
  }
  return null
}
