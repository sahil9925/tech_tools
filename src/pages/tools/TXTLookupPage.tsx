import { useState } from 'react'
import { Search } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { LoadingState } from '@/components/tools/LoadingState'
import { ErrorState } from '@/components/tools/ErrorState'
import { EmptyState } from '@/components/tools/EmptyState'
import { CopyButton } from '@/components/tools/CopyButton'
import { txtService } from '@/services/txtService'
import { getToolById } from '@/config/tools'
import { trackToolUsage, trackToolSuccess, trackToolError } from '@/services/analytics'
import type { TXTResult, TXTRecord } from '@/types'

const domainSchema = z.string().min(1).regex(
  /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/,
  'Please enter a valid domain'
)

const tool = getToolById('txt-lookup')!

const RECORD_TYPE_LABELS: Record<TXTRecord['type'], { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' }> = {
  spf: { label: 'SPF', variant: 'success' },
  dkim: { label: 'DKIM', variant: 'default' },
  dmarc: { label: 'DMARC', variant: 'default' },
  google: { label: 'Google', variant: 'secondary' },
  microsoft: { label: 'Microsoft', variant: 'secondary' },
  generic: { label: 'TXT', variant: 'secondary' },
}

const faqs = [
  { question: 'What are TXT records used for?', answer: 'TXT records are versatile DNS records used for domain verification, email authentication (SPF, DKIM, DMARC), and various third-party service configurations.' },
  { question: 'What does an SPF TXT record look like?', answer: 'SPF records start with "v=spf1" followed by include mechanisms and an "all" directive. For example: v=spf1 include:_spf.google.com ~all' },
  { question: 'Can a domain have multiple TXT records?', answer: 'Yes, domains can have multiple TXT records. However, they should only have one SPF record (having multiple SPF records causes failures).' },
]

export function TXTLookupPage() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<TXTResult | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  async function handleLookup() {
    const clean = domain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '')
    const parsed = domainSchema.safeParse(clean)
    if (!parsed.success) { setValidationError(parsed.error.errors[0].message); return }
    setValidationError(null)
    setLoading(true); setError(null); setResult(null)
    trackToolUsage('txt-lookup')
    try {
      const res = await txtService.lookup(parsed.data)
      setResult(res)
      trackToolSuccess('txt-lookup')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Lookup failed.'
      setError(msg); trackToolError('txt-lookup', msg)
    } finally { setLoading(false) }
  }

  return (
    <ToolLayout tool={tool} faqs={faqs} howItWorks={
      <>
        <p>Queries DNS for TXT records. Automatically identifies common record types like SPF, DKIM, DMARC, and domain verification codes.</p>
        <p>Enter a domain and click <strong>Lookup TXT Records</strong>.</p>
      </>
    }>
      <Card>
        <CardHeader className="pb-4"><CardTitle className="text-base">TXT Record Lookup</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="txt-domain" className="text-xs font-medium text-muted-foreground">Domain</label>
            <Input
              id="txt-domain"
              placeholder="example.com"
              value={domain}
              onChange={(e) => { setDomain(e.target.value); setValidationError(null) }}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              className={validationError ? 'border-destructive' : ''}
            />
            {validationError && <p className="text-xs text-destructive">{validationError}</p>}
          </div>
          <Button onClick={handleLookup} disabled={loading} className="gap-2">
            <Search className="h-4 w-4" />Lookup TXT Records
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Results</CardTitle>
          {result && <span className="text-xs text-muted-foreground">{result.queryTime}ms</span>}
        </CardHeader>
        <CardContent>
          {loading && <LoadingState message="Querying TXT records..." />}
          {!loading && error && <ErrorState message={error} onRetry={handleLookup} />}
          {!loading && !error && !result && <EmptyState title="No results yet" message="Enter a domain to look up its TXT records." />}
          {!loading && !error && result && (
            <div className="space-y-3 animate-fade-in">
              {result.records.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No TXT records found for {result.domain}.</p>
              ) : (
                result.records.map((record, i) => {
                  const typeInfo = RECORD_TYPE_LABELS[record.type]
                  return (
                    <div key={i} className="p-3 rounded-lg border border-border bg-muted/30 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
                          <span className="text-xs text-muted-foreground font-mono">{record.host}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">TTL: {record.ttl}s</span>
                          <CopyButton value={record.value} size="icon" />
                        </div>
                      </div>
                      <p className="font-mono text-xs break-all text-foreground bg-background px-2 py-1.5 rounded border border-border">{record.value}</p>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </ToolLayout>
  )
}
