/**
 * Security utilities — hashing (Web Crypto API), Base64 (UTF-8 safe), JWT decoding.
 * Nothing is sent to any server or stored in localStorage.
 */

// ─── Hash Generator ────────────────────────────────────────────────────────────

export type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'

export async function hashText(text: string, algorithm: HashAlgorithm): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest(algorithm, data)
  return bufferToHex(hashBuffer)
}

export async function hashFile(file: File, algorithm: HashAlgorithm): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest(algorithm, buffer)
  return bufferToHex(hashBuffer)
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// ─── Base64 ────────────────────────────────────────────────────────────────────

/**
 * Encode any string (including Unicode/emoji) to Base64.
 * Uses TextEncoder → Uint8Array → Base64 to handle UTF-8 correctly.
 */
export function encodeBase64(input: string): { result: string; error: string | null } {
  try {
    const bytes = new TextEncoder().encode(input)
    let binary = ''
    bytes.forEach((b) => (binary += String.fromCharCode(b)))
    return { result: btoa(binary), error: null }
  } catch (e) {
    return { result: '', error: e instanceof Error ? e.message : 'Encode error' }
  }
}

/**
 * Decode Base64 to a UTF-8 string.
 */
export function decodeBase64(input: string): { result: string; error: string | null } {
  try {
    const binary = atob(input.trim())
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return { result: new TextDecoder().decode(bytes), error: null }
  } catch (e) {
    return { result: '', error: e instanceof Error ? e.message : 'Invalid Base64 string.' }
  }
}

// ─── JWT Decoder ───────────────────────────────────────────────────────────────

export type JWTStatus = 'DECODED' | 'EXPIRED' | 'NOT_YET_VALID' | 'MALFORMED'

export interface JWTDecodeResult {
  status: JWTStatus
  header: Record<string, unknown> | null
  payload: Record<string, unknown> | null
  signature: string
  issuedAt: Date | null
  expiresAt: Date | null
  notBefore: Date | null
  expiresIn: string | null
  error: string | null
}

function base64UrlDecode(str: string): string {
  // Replace URL-safe chars and pad
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(
    str.length + ((4 - (str.length % 4)) % 4),
    '='
  )
  try {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return new TextDecoder().decode(bytes)
  } catch {
    throw new Error('Invalid Base64Url segment')
  }
}

function humanDuration(ms: number): string {
  const abs = Math.abs(ms)
  const s = Math.floor(abs / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ${s % 60}s`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ${m % 60}m`
  const d = Math.floor(h / 24)
  return `${d}d ${h % 24}h`
}

export function decodeJWT(token: string): JWTDecodeResult {
  const parts = token.trim().split('.')
  if (parts.length !== 3) {
    return {
      status: 'MALFORMED',
      header: null,
      payload: null,
      signature: '',
      issuedAt: null,
      expiresAt: null,
      notBefore: null,
      expiresIn: null,
      error: 'JWT must have exactly 3 parts separated by dots.',
    }
  }

  let header: Record<string, unknown>
  let payload: Record<string, unknown>

  try {
    header = JSON.parse(base64UrlDecode(parts[0]))
  } catch {
    return { status: 'MALFORMED', header: null, payload: null, signature: parts[2], issuedAt: null, expiresAt: null, notBefore: null, expiresIn: null, error: 'Could not decode header.' }
  }

  try {
    payload = JSON.parse(base64UrlDecode(parts[1]))
  } catch {
    return { status: 'MALFORMED', header, payload: null, signature: parts[2], issuedAt: null, expiresAt: null, notBefore: null, expiresIn: null, error: 'Could not decode payload.' }
  }

  const now = Date.now()
  const issuedAt = typeof payload.iat === 'number' ? new Date(payload.iat * 1000) : null
  const expiresAt = typeof payload.exp === 'number' ? new Date(payload.exp * 1000) : null
  const notBefore = typeof payload.nbf === 'number' ? new Date(payload.nbf * 1000) : null

  let status: JWTStatus = 'DECODED'
  if (expiresAt && expiresAt.getTime() < now) status = 'EXPIRED'
  else if (notBefore && notBefore.getTime() > now) status = 'NOT_YET_VALID'

  const expiresIn = expiresAt
    ? expiresAt.getTime() < now
      ? `Expired ${humanDuration(now - expiresAt.getTime())} ago`
      : `Expires in ${humanDuration(expiresAt.getTime() - now)}`
    : null

  return {
    status,
    header,
    payload,
    signature: parts[2],
    issuedAt,
    expiresAt,
    notBefore,
    expiresIn,
    error: null,
  }
}

// ─── URL Encoding ─────────────────────────────────────────────────────────────

export function encodeURLComponent(input: string): { result: string; error: string | null } {
  try {
    return { result: encodeURIComponent(input), error: null }
  } catch (e) {
    return { result: '', error: e instanceof Error ? e.message : 'Encode error' }
  }
}

export function decodeURLComponent(input: string): { result: string; error: string | null } {
  try {
    return { result: decodeURIComponent(input), error: null }
  } catch (e) {
    return { result: '', error: 'Invalid percent-encoding in input.' }
  }
}

export function encodeFullURL(input: string): { result: string; error: string | null } {
  try {
    const url = new URL(input)
    return { result: url.href, error: null }
  } catch {
    // Fall back to simple encoding
    try {
      return { result: encodeURI(input), error: null }
    } catch (e) {
      return { result: '', error: e instanceof Error ? e.message : 'Encode error' }
    }
  }
}

export function decodeFullURL(input: string): { result: string; error: string | null } {
  try {
    return { result: decodeURI(input), error: null }
  } catch {
    return { result: '', error: 'Invalid percent-encoding in URL.' }
  }
}
