import { queryDNS, parseTXTData, cleanName } from '@/lib/doh'
import type { DNSResult, DNSRecord } from '@/types'

const RECORD_TYPE_MAP: Record<number, string> = {
  1: 'A',
  2: 'NS',
  5: 'CNAME',
  6: 'SOA',
  15: 'MX',
  16: 'TXT',
  28: 'AAAA',
}

export const dnsService = {
  async lookup(domain: string, recordType: string = 'A'): Promise<DNSResult> {
    const startTime = performance.now()
    const response = await queryDNS(domain, recordType)
    const queryTime = Math.round(performance.now() - startTime)

    if (response.Status === 3) {
      throw new Error(`Domain "${domain}" does not exist (NXDOMAIN).`)
    }

    if (response.Status !== 0) {
      throw new Error(`DNS lookup failed with status code ${response.Status}.`)
    }

    const answers = response.Answer || []
    const records: DNSRecord[] = answers.map((rec) => {
      let val = rec.data
      if (rec.type === 16) {
        val = parseTXTData(val)
      }
      return {
        type: RECORD_TYPE_MAP[rec.type] || recordType,
        host: cleanName(rec.name),
        value: val,
        ttl: rec.TTL,
      }
    })

    return {
      domain,
      recordType,
      records,
      queryTime,
      status: records.length > 0 ? 'pass' : 'not-found',
    }
  },
}
