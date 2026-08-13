import { useState } from 'react'
import { Search, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
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
import { spfService } from '@/services/spfService'
import { getToolById } from '@/config/tools'
import { trackToolUsage, trackToolSuccess, trackToolError } from '@/services/analytics'
import type { SPFResult } from '@/types'

const domainSchema = z.string().min(1).regex(
  /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/,
  'Please enter a valid domain'
)

const tool = getToolById('spf-checker')!

const faqs = [
  { question: 'What is SPF?', answer: 'SPF (Sender Policy Framework) is an email authentication method that specifies which mail servers are authorized to send email for your domain. It helps prevent email spoofing.' },
  { question: 'What does ~all vs -all mean?', answer: '~all (SoftFail) means unauthorized emails are accepted but marked as suspicious. -all (HardFail) means unauthorized emails are rejected outright. -all is the stricter, more secure option.' },
  { question: 'Can I have multiple SPF records?', answer: 'No. Having multiple SPF records causes SPF to fail. Combine all your SPF rules into a single record.' },
  { question: 'What is the SPF lookup limit?', answer: 'SPF has a maximum of 10 DNS lookups for "include", "a", "mx", "ptr", and "exists" mechanisms. Exceeding this limit causes SPF to fail with a PermError.' },
]

export function SPFCheckerPage() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SPFResult | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  async function handleCheck() {
    const clean = domain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '')
    const parsed = domainSchema.safeParse(clean)
    if (!parsed.success) { setValidationError(parsed.error.errors[0].message); return }
    setValidationError(null)
    setLoading(true); setError(null); setResult(null)
    trackToolUsage('spf-checker')
    try {
      const res = await spfService.check(parsed.data)
      setResult(res)
      trackToolSuccess('spf-checker')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Check failed.'
      setError(msg); trackToolError('spf-checker', msg)
    } finally { setLoading(false) }
  }

  return (
    <ToolLayout tool={tool} faqs={faqs} howItWorks={
      <>
        <p>Queries your domain's TXT records to find and validate the SPF record.</p>
        <p>We check syntax, mechanisms, and policy strength.</p>
        <p className="text-xs text-muted-foreground">Enter your domain (not email address) to check its SPF record.</p>
      </>
    }>
      <Card>
        <CardHeader className="pb-4"><CardTitle className="text-base">SPF Record Checker</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="spf-domain" className="text-xs font-medium text-muted-foreground">Domain</label>
            <Input
              id="spf-domain"
              placeholder="example.com"
              value={domain}
              onChange={(e) => { setDomain(e.target.value); setValidationError(null) }}
              onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
              className={validationError ? 'border-destructive' : ''}
            />
            {validationError && <p className="text-xs text-destructive">{validationError}</p>}
          </div>
          <Button onClick={handleCheck} disabled={loading} className="gap-2">
            <Search className="h-4 w-4" />Check SPF
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Results</CardTitle>
          {result && <span className="text-xs text-muted-foreground">{result.queryTime}ms</span>}
        </CardHeader>
        <CardContent>
          {loading && <LoadingState message="Checking SPF record..." />}
          {!loading && error && <ErrorState message={error} onRetry={handleCheck} />}
          {!loading && !error && !result && <EmptyState title="No results yet" message="Enter a domain to check its SPF configuration." />}
          {!loading && !error && result && (
            <div className="space-y-4 animate-fade-in">
              {/* Status banner */}
              <div className={`flex items-center justify-between p-4 rounded-lg border ${
                result.status === 'pass' ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800'
                : result.status === 'fail' ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800'
                : 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800'
              }`}>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">SPF Status</p>
                  <StatusBadge status={result.status} size="lg" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{result.domain}</p>
                </div>
              </div>

              {/* SPF Record */}
              {result.record && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">SPF Record</p>
                  <div className="flex items-start gap-2 p-2.5 bg-muted rounded-md">
                    <code className="text-xs font-mono flex-1 break-all">{result.record}</code>
                    <CopyButton value={result.record} size="icon" />
                  </div>
                </div>
              )}

              {/* Checks */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Checks</p>
                <div className="space-y-1">
                  {result.checks.map((check, i) => (
                    <div key={i} className="flex items-center gap-2 py-1.5 border-b border-border last:border-0">
                      {check.passed
                        ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        : <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                      }
                      <span className="text-sm">{check.label}</span>
                      {check.detail && <span className="text-xs text-muted-foreground ml-auto">{check.detail}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Warnings */}
              {result.warnings.length > 0 && (
                <div className="space-y-2">
                  {result.warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700 dark:text-amber-400">{w}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Summary */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm">{result.summary}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </ToolLayout>
  )
}
