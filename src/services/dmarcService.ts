import { queryDNS, parseTXTData } from '@/lib/doh'
import type { DMARCResult } from '@/types'

export const dmarcService = {
  async check(domain: string): Promise<DMARCResult> {
    const startTime = performance.now()
    const dmarcDomain = `_dmarc.${domain}`
    const response = await queryDNS(dmarcDomain, 'TXT')
    const queryTime = Math.round(performance.now() - startTime)

    if (response.Status === 3 || !response.Answer || response.Answer.length === 0) {
      return {
        domain,
        record: null,
        policy: null,
        percentage: null,
        rua: null,
        ruf: null,
        status: 'fail',
        warnings: [`No DMARC record found at ${dmarcDomain}.`],
        queryTime,
      }
    }

    const dmarcRecords = response.Answer
      .map((r) => parseTXTData(r.data))
      .filter((txt) => txt.toLowerCase().startsWith('v=dmarc1'))

    if (dmarcRecords.length === 0) {
      return {
        domain,
        record: null,
        policy: null,
        percentage: null,
        rua: null,
        ruf: null,
        status: 'fail',
        warnings: [`TXT records exist at ${dmarcDomain}, but none start with v=DMARC1.`],
        queryTime,
      }
    }

    const record = dmarcRecords[0]
    const warnings: string[] = []

    if (dmarcRecords.length > 1) {
      warnings.push('Multiple DMARC records found! A domain must have only one DMARC record.')
    }

    // Extract policy (p=none|quarantine|reject)
    const pMatch = record.match(/p=(none|quarantine|reject)/i)
    const policy = (pMatch ? pMatch[1].toLowerCase() : 'none') as 'none' | 'quarantine' | 'reject'

    // Extract percentage (pct=100)
    const pctMatch = record.match(/pct=(\d+)/i)
    const pct = pctMatch ? parseInt(pctMatch[1], 10) : 100

    // Extract aggregate report email (rua=mailto:...)
    const ruaMatch = record.match(/rua=([^;]+)/i)
    const rua = ruaMatch ? ruaMatch[1] : null

    // Extract forensic report email (ruf=mailto:...)
    const rufMatch = record.match(/ruf=([^;]+)/i)
    const ruf = rufMatch ? rufMatch[1] : null

    // Extract alignments
    const aspfMatch = record.match(/aspf=(r|s)/i)
    const spfAlignment = aspfMatch ? (aspfMatch[1].toLowerCase() === 's' ? 'strict' : 'relaxed') : 'relaxed'

    const adkimMatch = record.match(/adkim=(r|s)/i)
    const dkimAlignment = adkimMatch ? (adkimMatch[1].toLowerCase() === 's' ? 'strict' : 'relaxed') : 'relaxed'

    if (policy === 'none') {
      warnings.push('DMARC policy is set to "none" (monitoring only). Change to "quarantine" or "reject" for active enforcement.')
    }

    if (!rua) {
      warnings.push('No aggregate reporting address (rua) specified. You will not receive DMARC reports.')
    }

    const status: DMARCResult['status'] = policy === 'reject' || policy === 'quarantine' ? 'pass' : 'warning'

    return {
      domain,
      record,
      policy,
      percentage: pct,
      rua: rua || undefined,
      ruf: ruf || undefined,
      spfAlignment,
      dkimAlignment,
      status,
      warnings,
      queryTime,
    }
  },
}
