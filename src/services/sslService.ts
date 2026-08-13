/**
 * SSL Certificate Checker Service
 *
 * Currently uses mock data for frontend development.
 * NOTE: SSL certificate inspection cannot be done directly from the browser
 *       due to browser security restrictions. This service is designed for
 *       future backend integration.
 * TODO: Replace with real API:
 *   POST /api/ssl/check
 *   Body: { domain: string }
 */

import type { SSLResult } from '@/types'
import { sleep } from '@/lib/utils'

const MOCK_DATA: Record<string, SSLResult> = {
  'google.com': {
    domain: 'google.com',
    status: 'valid',
    issuer: 'GTS CA 1C3',
    issuedDate: '2026-01-15T00:00:00Z',
    expiryDate: '2026-04-09T00:00:00Z',
    daysRemaining: 58,
    tlsVersion: 'TLS 1.3',
    subjectAltNames: ['*.google.com', 'google.com'],
    warnings: [],
    queryTime: 145,
    timestamp: new Date().toISOString(),
  },
  'github.com': {
    domain: 'github.com',
    status: 'valid',
    issuer: "DigiCert TLS Hybrid ECC SHA384 2020 CA1",
    issuedDate: '2026-02-01T00:00:00Z',
    expiryDate: '2027-03-01T00:00:00Z',
    daysRemaining: 203,
    tlsVersion: 'TLS 1.3',
    subjectAltNames: ['github.com', 'www.github.com'],
    warnings: [],
    queryTime: 112,
    timestamp: new Date().toISOString(),
  },
  'example.com': {
    domain: 'example.com',
    status: 'valid',
    issuer: "DigiCert Global G2 TLS RSA SHA256 2020 CA1",
    issuedDate: '2026-01-01T00:00:00Z',
    expiryDate: '2026-04-01T00:00:00Z',
    daysRemaining: 51,
    tlsVersion: 'TLS 1.2',
    subjectAltNames: ['example.com', 'www.example.com'],
    warnings: ['Certificate is using TLS 1.2. Upgrade to TLS 1.3 for better security and performance.'],
    queryTime: 98,
    timestamp: new Date().toISOString(),
  },
  'microsoft.com': {
    domain: 'microsoft.com',
    status: 'valid',
    issuer: 'Microsoft Azure TLS Issuing CA 05',
    issuedDate: '2025-12-01T00:00:00Z',
    expiryDate: '2026-11-30T00:00:00Z',
    daysRemaining: 111,
    tlsVersion: 'TLS 1.3',
    subjectAltNames: ['microsoft.com', 'www.microsoft.com', '*.microsoft.com'],
    warnings: [],
    queryTime: 88,
    timestamp: new Date().toISOString(),
  },
}

function generateMockResult(domain: string): SSLResult {
  const now = new Date()
  const issuedDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const expiryDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
  return {
    domain,
    status: 'valid',
    issuer: "Let's Encrypt Authority X3",
    issuedDate: issuedDate.toISOString(),
    expiryDate: expiryDate.toISOString(),
    daysRemaining: 60,
    tlsVersion: 'TLS 1.3',
    subjectAltNames: [domain, `www.${domain}`],
    warnings: [],
    queryTime: Math.floor(Math.random() * 100) + 80,
    timestamp: new Date().toISOString(),
  }
}

export async function check(domain: string): Promise<SSLResult> {
  await sleep(1000 + Math.random() * 600)

  const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')

  if (MOCK_DATA[cleanDomain]) {
    return { ...MOCK_DATA[cleanDomain], timestamp: new Date().toISOString() }
  }

  return generateMockResult(cleanDomain)
}

export const sslService = { check }
