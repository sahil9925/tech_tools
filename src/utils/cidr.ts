/**
 * CIDR Calculator Utility
 * Works entirely client-side - no API needed.
 */

import type { CIDRResult } from '@/types'

function ipToInt(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) | parseInt(octet, 10), 0) >>> 0
}

function intToIp(int: number): string {
  return [
    (int >>> 24) & 0xff,
    (int >>> 16) & 0xff,
    (int >>> 8) & 0xff,
    int & 0xff,
  ].join('.')
}

function ipToBinary(ip: string): string {
  return ip
    .split('.')
    .map((octet) => parseInt(octet, 10).toString(2).padStart(8, '0'))
    .join('.')
}

function ipToHex(ip: string): string {
  return '0x' + ip
    .split('.')
    .map((octet) => parseInt(octet, 10).toString(16).padStart(2, '0').toUpperCase())
    .join('')
}

function getIpClass(ip: string): string {
  const firstOctet = parseInt(ip.split('.')[0], 10)
  if (firstOctet >= 1 && firstOctet <= 126) return 'A'
  if (firstOctet === 127) return 'Loopback'
  if (firstOctet >= 128 && firstOctet <= 191) return 'B'
  if (firstOctet >= 192 && firstOctet <= 223) return 'C'
  if (firstOctet >= 224 && firstOctet <= 239) return 'D (Multicast)'
  if (firstOctet >= 240 && firstOctet <= 255) return 'E (Reserved)'
  return 'Unknown'
}

function isPrivateIP(ip: string): boolean {
  const n = ipToInt(ip)
  const ranges = [
    { start: ipToInt('10.0.0.0'), end: ipToInt('10.255.255.255') },
    { start: ipToInt('172.16.0.0'), end: ipToInt('172.31.255.255') },
    { start: ipToInt('192.168.0.0'), end: ipToInt('192.168.255.255') },
    { start: ipToInt('127.0.0.0'), end: ipToInt('127.255.255.255') },
  ]
  return ranges.some((r) => n >= r.start && n <= r.end)
}

export function validateCIDR(cidr: string): string | null {
  const cidrRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/
  const match = cidr.trim().match(cidrRegex)

  if (!match) {
    return 'Invalid CIDR format. Expected format: 192.168.1.0/24'
  }

  const octets = [match[1], match[2], match[3], match[4]].map(Number)
  for (const octet of octets) {
    if (octet < 0 || octet > 255) {
      return 'Invalid IP address — each octet must be between 0 and 255.'
    }
  }

  const prefix = Number(match[5])
  if (prefix < 0 || prefix > 32) {
    return 'Invalid prefix length — must be between 0 and 32.'
  }

  return null
}

export function calculate(cidr: string): CIDRResult {
  const [ipStr, prefixStr] = cidr.trim().split('/')
  const prefix = parseInt(prefixStr, 10)

  const subnetMaskInt = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0
  const wildcardInt = (~subnetMaskInt) >>> 0

  const ipInt = ipToInt(ipStr)
  const networkInt = (ipInt & subnetMaskInt) >>> 0
  const broadcastInt = (networkInt | wildcardInt) >>> 0

  const firstUsableInt = prefix < 31 ? (networkInt + 1) >>> 0 : networkInt
  const lastUsableInt = prefix < 31 ? (broadcastInt - 1) >>> 0 : broadcastInt

  const totalAddresses = Math.pow(2, 32 - prefix)
  const usableHosts = prefix >= 31 ? totalAddresses : Math.max(0, totalAddresses - 2)

  const networkAddress = intToIp(networkInt)
  const broadcastAddress = intToIp(broadcastInt)
  const subnetMask = intToIp(subnetMaskInt)
  const wildcardMask = intToIp(wildcardInt)

  return {
    cidr,
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
    binaryMask: ipToBinary(subnetMask),
    hexMask: ipToHex(subnetMask),
  }
}
