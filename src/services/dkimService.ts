import { queryDNS, parseTXTData } from '@/lib/doh'
import type { DKIMResult } from '@/types'

export const dkimService = {
  async check(domain: string, selector: string = 'default'): Promise<DKIMResult> {
    const startTime = performance.now()
    const dkimDomain = `${selector}._domainkey.${domain}`
    const response = await queryDNS(dkimDomain, 'TXT')
    const queryTime = Math.round(performance.now() - startTime)

    if (response.Status === 3 || !response.Answer || response.Answer.length === 0) {
      return {
        domain,
        selector,
        record: null,
        publicKey: null,
        keyLength: null,
        status: 'fail',
        warnings: [`No DKIM record found at ${dkimDomain}. Please verify that the selector "${selector}" is correct.`],
        queryTime,
      }
    }

    const txtValue = parseTXTData(response.Answer[0].data)
    const warnings: string[] = []

    // Extract public key (p=...)
    const pMatch = txtValue.match(/p=([A-Za-z0-9+/=]+)/)
    const publicKey = pMatch ? pMatch[1] : null

    let keyLength: number | null = null
    if (publicKey) {
      // Estimate RSA key size from base64 length (~270 chars for 2048-bit, ~140 chars for 1024-bit)
      const rawLen = (publicKey.length * 3) / 4
      if (rawLen > 200) keyLength = 2048
      else if (rawLen > 100) keyLength = 1024
      else keyLength = 512

      if (keyLength < 2048) {
        warnings.push(`DKIM key length appears to be ${keyLength}-bit. 2048-bit or higher is recommended for security.`)
      }
    } else {
      warnings.push('DKIM record found but missing public key parameter (p=).')
    }

    return {
      domain,
      selector,
      record: txtValue,
      publicKey,
      keyLength,
      status: publicKey ? 'pass' : 'warning',
      warnings,
      queryTime,
    }
  },
}
