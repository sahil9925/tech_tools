import { queryDNS, parseTXTData } from '@/lib/doh'
import type { SPFResult, SPFCheck } from '@/types'

export const spfService = {
  async check(domain: string): Promise<SPFResult> {
    const startTime = performance.now()
    const response = await queryDNS(domain, 'TXT')
    const queryTime = Math.round(performance.now() - startTime)

    if (response.Status === 3) {
      throw new Error(`Domain "${domain}" does not exist (NXDOMAIN).`)
    }

    if (response.Status !== 0) {
      throw new Error(`SPF check failed with status code ${response.Status}.`)
    }

    const answers = response.Answer || []
    const spfRecords = answers
      .map((r) => parseTXTData(r.data))
      .filter((txt) => txt.toLowerCase().startsWith('v=spf1'))

    if (spfRecords.length === 0) {
      return {
        domain,
        record: null,
        status: 'fail',
        checks: [
          { label: 'SPF Record Found', passed: false, detail: 'No TXT record starting with v=spf1 was found' },
        ],
        warnings: ['Without an SPF record, emails sent from your domain may be flagged as spam or rejected.'],
        summary: 'No SPF record found for this domain.',
        queryTime,
      }
    }

    const warnings: string[] = []
    if (spfRecords.length > 1) {
      warnings.push('Multiple SPF records found! Domains MUST NOT have more than one SPF record. This causes SPF evaluation to fail.')
    }

    const record = spfRecords[0]
    const checks: SPFCheck[] = [
      { label: 'SPF Record Found', passed: true, detail: record },
      { label: 'Single SPF Record', passed: spfRecords.length === 1, detail: `${spfRecords.length} record(s) found` },
      { label: 'Valid Prefix (v=spf1)', passed: record.toLowerCase().startsWith('v=spf1') },
      { label: 'Terminating Directive (~all / -all)', passed: record.includes('all'), detail: record.includes('-all') ? 'HardFail (-all) - Strong' : record.includes('~all') ? 'SoftFail (~all) - Recommended' : 'Missing or +all' },
    ]

    if (record.includes('+all')) {
      warnings.push('Record uses "+all" which allows ANY server to send email on behalf of your domain! This renders SPF useless.')
    }

    const includes = (record.match(/include:/g) || []).length
    if (includes > 10) {
      warnings.push(`Record has ${includes} include mechanisms. SPF allows a maximum of 10 DNS lookups.`)
    }

    const passedAll = checks.every((c) => c.passed) && !record.includes('+all') && spfRecords.length === 1
    const status: SPFResult['status'] = passedAll ? 'pass' : warnings.length > 0 ? 'warning' : 'fail'

    return {
      domain,
      record,
      status,
      checks,
      warnings,
      summary: passedAll
        ? 'SPF record is valid and properly configured.'
        : 'SPF record was found but has warnings or configuration issues.',
      queryTime,
    }
  },
}
