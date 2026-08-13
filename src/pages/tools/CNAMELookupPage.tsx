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
import { CopyButton } from '@/components/tools/CopyButton'
import { cnameService } from '@/services/cnameService'
import { getToolById } from '@/config/tools'
import { trackToolUsage, trackToolSuccess, trackToolError } from '@/services/analytics'
import type { CNAMEResult } from '@/types'

const hostnameSchema = z.string().min(1, 'Hostname is required')

const tool = getToolById('cname-lookup')!

const faqs = [
  { question: 'What is a CNAME record?', answer: 'A CNAME (Canonical Name) record aliases one domain name to another. It is commonly used for subdomains like www, mail, or ftp that point to the main domain or a third-party service.' },
  { question: 'Can I use a CNAME on the root domain?', answer: 'Generally no. CNAME records cannot be set at the zone apex (root domain like example.com) due to DNS standards. Some DNS providers offer CNAME flattening or ALIAS records as alternatives.' },
  { question: 'When should I use CNAME vs A record?', answer: 'Use A records to point to a specific IP address. Use CNAME to point to another hostname, which is useful when the target IP may change (e.g., CDN providers, cloud services).' },
]

export function CNAMELookupPage() {
  const [hostname, setHostname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CNAMEResult | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  async function handleLookup() {
    const clean = hostname.trim().replace(/^https?:\/\//, '').replace(/\/$/, '')
    const parsed = hostnameSchema.safeParse(clean)
    if (!parsed.success) { setValidationError(parsed.error.errors[0].message); return }
    setValidationError(null)
    setLoading(true); setError(null); setResult(null)
    trackToolUsage('cname-lookup')
    try {
      const res = await cnameService.lookup(parsed.data)
      setResult(res)
      trackToolSuccess('cname-lookup')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Lookup failed.'
      setError(msg); trackToolError('cname-lookup', msg)
    } finally { setLoading(false) }
  }

  return (
    <ToolLayout tool={tool} faqs={faqs} howItWorks={
      <>
        <p>Queries DNS for CNAME records to find where a hostname is aliased to.</p>
        <p>Enter a hostname (including subdomains like www.example.com) and click <strong>Lookup CNAME</strong>.</p>
      </>
    }>
      <Card>
        <CardHeader className="pb-4"><CardTitle className="text-base">CNAME Lookup</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="cname-hostname" className="text-xs font-medium text-muted-foreground">Hostname</label>
            <Input
              id="cname-hostname"
              placeholder="www.example.com"
              value={hostname}
              onChange={(e) => { setHostname(e.target.value); setValidationError(null) }}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              className={validationError ? 'border-destructive' : ''}
            />
            {validationError && <p className="text-xs text-destructive">{validationError}</p>}
          </div>
          <Button onClick={handleLookup} disabled={loading} className="gap-2">
            <Search className="h-4 w-4" />Lookup CNAME
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Results</CardTitle></CardHeader>
        <CardContent>
          {loading && <LoadingState message="Querying CNAME records..." />}
          {!loading && error && <ErrorState message={error} onRetry={handleLookup} />}
          {!loading && !error && !result && <EmptyState title="No results yet" message="Enter a hostname to look up its CNAME record." />}
          {!loading && !error && result && (
            <div className="animate-fade-in">
              {!result.record ? (
                <div className="text-center py-8 space-y-2">
                  <p className="text-sm font-medium">No CNAME record found</p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-mono">{result.hostname}</span> does not have a CNAME record. It may use an A or AAAA record directly.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="result-table">
                    <thead>
                      <tr>
                        <th className="pr-6">Hostname</th>
                        <th className="pr-6">CNAME Target</th>
                        <th className="pr-4">TTL</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="pr-6 font-mono text-xs">{result.record.hostname}</td>
                        <td className="pr-6 font-mono text-xs">
                          <div className="flex items-center gap-2">
                            {result.record.target}
                            <CopyButton value={result.record.target} size="icon" />
                          </div>
                        </td>
                        <td className="pr-4 text-xs text-muted-foreground">{result.record.ttl}s</td>
                        <td><StatusBadge status={result.record.status} size="sm" /></td>
                      </tr>
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
