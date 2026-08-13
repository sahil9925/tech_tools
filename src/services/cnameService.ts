import { queryDNS, cleanName } from '@/lib/doh'
import type { CNAMEResult, CNAMERecord } from '@/types'

export const cnameService = {
  async lookup(hostname: string): Promise<CNAMEResult> {
    const startTime = performance.now()
    const response = await queryDNS(hostname, 'CNAME')
    const queryTime = Math.round(performance.now() - startTime)

    if (response.Status === 3) {
      throw new Error(`Hostname "${hostname}" does not exist (NXDOMAIN).`)
    }

    if (response.Status !== 0) {
      throw new Error(`CNAME lookup failed with status code ${response.Status}.`)
    }

    const answer = response.Answer?.find((rec) => rec.type === 5)
    let record: CNAMERecord | null = null

    if (answer) {
      record = {
        hostname: cleanName(answer.name),
        target: cleanName(answer.data),
        ttl: answer.TTL,
        status: 'valid',
      }
    }

    return {
      hostname,
      record,
      queryTime,
      status: record ? 'pass' : 'not-found',
    }
  },
}
