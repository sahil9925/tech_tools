import { useState } from 'react'
import { Search } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { LoadingState } from '@/components/tools/LoadingState'
import { ErrorState } from '@/components/tools/ErrorState'
import { EmptyState } from '@/components/tools/EmptyState'
import { StatusBadge } from '@/components/tools/StatusBadge'
import { mxService } from '@/services/mxService'
import { getToolById } from '@/config/tools'
import { trackToolUsage, trackToolSuccess, trackToolError } from '@/services/analytics'
import type { MXResult } from '@/types'

const domainSchema = z.string().min(1).regex(
  /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/,
  'Please enter a valid domain'
)

const tool = getToolById('mx-lookup')!

const faqs = [
  { question: 'What is an MX record?', answer: 'MX (Mail Exchange) records specify the mail servers responsible for accepting email messages for a domain.' },
  { question: 'What does priority mean in MX records?', answer: 'Lower priority numbers mean higher preference. Mail is first attempted to the lowest-numbered server. If that fails, the next server in priority order is tried.' },
  { question: 'Can a domain have multiple MX records?', answer: 'Yes. Having multiple MX records provides redundancy. If the primary mail server is unavailable, email is delivered to the next priority server.' },
  { question: 'What does it mean if no MX records are found?', answer: 'If no MX records are configured, email delivery to that domain will fail or fall back to the A record. Most domains hosting email will have at least one MX record.' },
]

export function MXLookupPage() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<MXResult | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  async function handleLookup() {
    const clean = domain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '')
    const parsed = domainSchema.safeParse(clean)
    if (!parsed.success) { setValidationError(parsed.error.errors[0].message); return }
    setValidationError(null)
    setLoading(true); setError(null); setResult(null)
    trackToolUsage('mx-lookup')
    try {
      const res = await mxService.lookup(parsed.data)
      setResult(res)
      trackToolSuccess('mx-lookup')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Lookup failed.'
      setError(msg); trackToolError('mx-lookup', msg)
    } finally { setLoading(false) }
  }

  return (
    <ToolLayout tool={tool} faqs={faqs} howItWorks={
      <>
        <p>Queries DNS for MX records to find mail servers for your domain.</p>
        <p>Enter a domain and click <strong>Check MX Records</strong>.</p>
        <p className="text-xs text-muted-foreground">Results show priority, mail server hostname, TTL, and health status.</p>
      </>
    }>
      <Card>
        <CardHeader className="pb-4"><CardTitle className="text-base">MX Lookup</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="mx-domain" className="text-xs font-medium text-muted-foreground">Domain</label>
            <Input
              id="mx-domain"
              placeholder="example.com"
              value={domain}
              onChange={(e) => { setDomain(e.target.value); setValidationError(null) }}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              className={validationError ? 'border-destructive' : ''}
            />
            {validationError && <p className="text-xs text-destructive">{validationError}</p>}
          </div>
          <Button onClick={handleLookup} disabled={loading} className="gap-2">
            <Search className="h-4 w-4" />Check MX Records
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Results</CardTitle>
          {result && <span className="text-xs text-muted-foreground">{result.queryTime}ms · {result.records.length} record{result.records.length !== 1 ? 's' : ''}</span>}
        </CardHeader>
        <CardContent>
          {loading && <LoadingState message="Querying MX records..." />}
          {!loading && error && <ErrorState message={error} onRetry={handleLookup} />}
          {!loading && !error && !result && <EmptyState title="No results yet" message="Enter a domain to check its mail exchange servers." />}
          {!loading && !error && result && (
            <div className="animate-fade-in">
              {result.records.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No MX records found for {result.domain}.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="result-table">
                    <thead>
                      <tr>
                        <th className="pr-4">Priority</th>
                        <th className="pr-6">Mail Server</th>
                        <th className="pr-4">TTL</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.records.sort((a, b) => a.priority - b.priority).map((record, i) => (
                        <tr key={i}>
                          <td className="pr-4">
                            <span className="font-mono text-sm font-semibold">{record.priority}</span>
                          </td>
                          <td className="pr-6 font-mono text-xs">{record.mailServer}</td>
                          <td className="pr-4 text-xs text-muted-foreground">{record.ttl}s</td>
                          <td>
                            <StatusBadge status={record.status} size="sm" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </ToolLayout>
  )
}
