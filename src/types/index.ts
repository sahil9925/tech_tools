export type ToolCategory =
  | 'DNS & Networking'
  | 'Email & Deliverability'
  | 'SSL & Security'
  | 'Developer Utilities'
  | 'Networking'
  | 'Data & Developer'
  | 'Security & Developer'
  | 'Developer'
  | 'DevOps'

export interface Tool {
  id: string
  name: string
  slug: string
  category: ToolCategory
  description: string
  longDescription?: string
  keywords: string[]
  icon: string
  seoTitle: string
  seoDescription: string
  relatedTools: string[]
  isNew?: boolean
  isPopular?: boolean
}

export interface Category {
  id: string
  name: ToolCategory
  description: string
  icon: string
  color: string
}

// DNS Service Types
export interface DNSRecord {
  type: string
  host: string
  value: string
  ttl: number
  priority?: number
}

export interface DNSResult {
  domain: string
  recordType: string
  records: DNSRecord[]
  queryTime: number
  timestamp?: string
  status?: 'pass' | 'fail' | 'not-found'
}

// MX Service Types
export interface MXRecord {
  priority: number
  mailServer: string
  ttl: number
  status: 'healthy' | 'degraded' | 'error' | 'unknown'
}

export interface MXResult {
  domain: string
  records: MXRecord[]
  queryTime: number
  timestamp?: string
  status?: 'pass' | 'fail' | 'not-found'
}

// TXT Service Types
export interface TXTRecord {
  host: string
  value: string
  ttl: number
  type: 'spf' | 'dkim' | 'dmarc' | 'google' | 'microsoft' | 'generic'
}

export interface TXTResult {
  domain: string
  records: TXTRecord[]
  queryTime: number
  timestamp?: string
  status?: 'pass' | 'fail' | 'not-found'
}

// CNAME Service Types
export interface CNAMERecord {
  hostname: string
  target: string
  ttl: number
  status: 'active' | 'inactive' | 'error' | 'valid'
}

export interface CNAMEResult {
  hostname: string
  record: CNAMERecord | null
  queryTime: number
  timestamp?: string
  status?: 'pass' | 'fail' | 'not-found'
}

// SPF Service Types
export interface SPFCheck {
  label: string
  passed: boolean
  detail?: string
}

export interface SPFResult {
  domain: string
  status: 'pass' | 'fail' | 'neutral' | 'none' | 'warning'
  record: string | null
  checks: SPFCheck[]
  warnings: string[]
  summary: string
  queryTime: number
  timestamp?: string
}

// DKIM Service Types
export interface DKIMResult {
  domain: string
  selector: string
  status: 'pass' | 'fail' | 'not-found' | 'warning'
  record: string | null
  publicKey: string | null
  keyLength: number | null
  warnings: string[]
  queryTime: number
  timestamp?: string
}

// DMARC Service Types
export interface DMARCResult {
  domain: string
  status: 'pass' | 'warning' | 'fail' | 'none'
  policy: 'none' | 'quarantine' | 'reject' | null
  record: string | null
  percentage: number | null
  rua?: string | null
  ruf?: string | null
  spfAlignment?: 'strict' | 'relaxed' | null
  dkimAlignment?: 'strict' | 'relaxed' | null
  warnings: string[]
  queryTime: number
  timestamp?: string
}

// SSL Service Types
export interface SSLResult {
  domain: string
  status: 'valid' | 'expired' | 'invalid' | 'error'
  issuer: string | null
  issuedDate: string | null
  expiryDate: string | null
  daysRemaining: number | null
  tlsVersion: string | null
  subjectAltNames: string[]
  warnings: string[]
  queryTime: number
  timestamp: string
}

// CIDR Types
export interface CIDRResult {
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
  binaryMask: string
  hexMask: string
}

// Common service response
export interface ServiceResponse<T> {
  data: T | null
  error: string | null
  loading: boolean
}
