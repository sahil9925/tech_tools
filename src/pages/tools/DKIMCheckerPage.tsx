import { useState } from 'react'
import { Search, AlertTriangle } from 'lucide-react'
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
import { dkimService } from '@/services/dkimService'
import { getToolById } from '@/config/tools'
import { trackToolUsage, trackToolSuccess, trackToolError } from '@/services/analytics'
import type { DKIMResult } from '@/types'

const domainSchema = z.string().min(1).regex(
  /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/,
  'Please enter a valid domain'
)

const tool = getToolById('dkim-checker')!

const faqs = [
  { question: 'What is DKIM?', answer: 'DKIM (DomainKeys Identified Mail) is an email authentication method that uses cryptographic signatures to verify that emails are legitimately sent from a domain and have not been altered in transit.' },
  { question: 'What is a DKIM selector?', answer: 'A selector is a string that identifies a specific DKIM key for a domain. It allows multiple DKIM keys to exist simultaneously. Common selectors include "default", "google", "mail", "k1".' },
  { question: 'How do I find my DKIM selector?', answer: 'Your DKIM selector is configured by your email provider. For Google Workspace it is often "google". For others, check your email provider\'s documentation or look at the email headers of a sent email.' },
  { question: 'What key length should I use?', answer: '2048-bit RSA keys are recommended. 1024-bit keys were previously common but are now considered weak and should be upgraded.' },
]

export function DKIMCheckerPage() {
  const [domain, setDomain] = useState('')
  const [selector, setSelector] = useState('default')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<DKIMResult | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  async function handleCheck() {
    const clean = domain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '')
    const parsed = domainSchema.safeParse(clean)
    if (!parsed.success) { setValidationError(parsed.error.errors[0].message); return }
    if (!selector.trim()) { setValidationError('Selector is required'); return }
    setValidationError(null)
    setLoading(true); setError(null); setResult(null)
    trackToolUsage('dkim-checker')
    try {
      const res = await dkimService.check(parsed.data, selector.trim())
      setResult(res)
      trackToolSuccess('dkim-checker')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Check failed.'
      setError(msg); trackToolError('dkim-checker', msg)
    } finally { setLoading(false) }
  }

  return (
    <ToolLayout tool={tool} faqs={faqs} howItWorks={
      <>
        <p>Looks up the DKIM TXT record at <code className="text-xs bg-muted px-1 py-0.5 rounded">selector._domainkey.domain</code>.</p>
        <p>Enter your domain and the DKIM selector to verify your configuration.</p>
        <p className="text-xs text-muted-foreground">Common selectors: <strong>google</strong>, <strong>default</strong>, <strong>mail</strong>, <strong>k1</strong></p>
      </>
    }>
      <Card>
        <CardHeader className="pb-4"><CardTitle className="text-base">DKIM Checker</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="dkim-domain" className="text-xs font-medium text-muted-foreground">Domain</label>
              <Input
                id="dkim-domain"
                placeholder="example.com"
                value={domain}
                onChange={(e) => { setDomain(e.target.value); setValidationError(null) }}
                onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                className={validationError ? 'border-destructive' : ''}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="dkim-selector" className="text-xs font-medium text-muted-foreground">Selector</label>
              <Input
                id="dkim-selector"
                placeholder="default"
                value={selector}
                onChange={(e) => setSelector(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
              />
            </div>
          </div>
          {validationError && <p className="text-xs text-destructive">{validationError}</p>}
          <Button onClick={handleCheck} disabled={loading} className="gap-2">
            <Search className="h-4 w-4" />Check DKIM
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Results</CardTitle>
          {result && <span className="text-xs text-muted-foreground">{result.queryTime}ms</span>}
        </CardHeader>
        <CardContent>
          {loading && <LoadingState message="Checking DKIM record..." />}
          {!loading && error && <ErrorState message={error} onRetry={handleCheck} />}
          {!loading && !error && !result && <EmptyState title="No results yet" message="Enter a domain and selector to check DKIM configuration." />}
          {!loading && !error && result && (
            <div className="space-y-4 animate-fade-in">
              {/* Status banner */}
              <div className={`flex items-center justify-between p-4 rounded-lg border ${
                result.status === 'pass' ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800'
                : 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800'
              }`}>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">DKIM Status</p>
                  <StatusBadge status={result.status} size="lg" />
                </div>
                <div className="text-right space-y-0.5">
                  <p className="text-xs text-muted-foreground">{result.domain}</p>
                  <p className="text-xs font-mono text-muted-foreground">selector: {result.selector}</p>
                </div>
              </div>

              {/* Details */}
              {result.record && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Selector</p>
                    <p className="font-mono text-xs">{result.selector}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Key Length</p>
                    <p className="font-medium">{result.keyLength ? `${result.keyLength}-bit RSA` : 'Unknown'}</p>
                  </div>
                </div>
              )}

              {result.record && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">DKIM Record</p>
                  <div className="flex items-start gap-2 p-2.5 bg-muted rounded-md">
                    <code className="text-xs font-mono flex-1 break-all">{result.record}</code>
                    <CopyButton value={result.record} size="icon" />
                  </div>
                </div>
              )}

              {result.publicKey && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Public Key</p>
                  <div className="flex items-start gap-2 p-2.5 bg-muted rounded-md">
                    <code className="text-xs font-mono flex-1 break-all text-muted-foreground">{result.publicKey}</code>
                    <CopyButton value={result.publicKey} size="icon" />
                  </div>
                </div>
              )}

              {result.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">{w}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </ToolLayout>
  )
}
