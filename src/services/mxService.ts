import { queryDNS, cleanName } from '@/lib/doh'
import type { MXResult, MXRecord } from '@/types'

export const mxService = {
  async lookup(domain: string): Promise<MXResult> {
    const startTime = performance.now()
    const response = await queryDNS(domain, 'MX')
    const queryTime = Math.round(performance.now() - startTime)

    if (response.Status === 3) {
      throw new Error(`Domain "${domain}" does not exist (NXDOMAIN).`)
    }

    if (response.Status !== 0) {
      throw new Error(`MX lookup failed with DNS status ${response.Status}.`)
    }

    const answers = response.Answer || []
    const records: MXRecord[] = answers.map((rec) => {
      // DoH MX data format is typically "priority server_name" e.g. "10 mail.example.com."
      const parts = rec.data.split(' ')
      let priority = 10
      let mailServer = rec.data

      if (parts.length >= 2) {
        priority = parseInt(parts[0], 10) || 10
        mailServer = cleanName(parts.slice(1).join(' '))
      } else {
        mailServer = cleanName(mailServer)
      }

      return {
        priority,
        mailServer,
        ttl: rec.TTL,
        status: 'healthy',
      }
    })

    return {
      domain,
      records,
      queryTime,
      status: records.length > 0 ? 'pass' : 'not-found',
    }
  },
}
