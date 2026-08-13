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
import { dmarcService } from '@/services/dmarcService'
import { getToolById } from '@/config/tools'
import { trackToolUsage, trackToolSuccess, trackToolError } from '@/services/analytics'
import type { DMARCResult } from '@/types'

const domainSchema = z.string().min(1).regex(
  /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/,
  'Please enter a valid domain'
)

const tool = getToolById('dmarc-checker')!

const POLICY_DESCRIPTIONS: Record<string, string> = {
  none: 'Monitoring only — no enforcement. Unauthorized emails are delivered normally.',
  quarantine: 'Suspicious emails are sent to the spam/junk folder.',
  reject: 'Unauthorized emails are rejected outright by the receiving server.',
}

const faqs = [
  { question: 'What is DMARC?', answer: 'DMARC (Domain-based Message Authentication, Reporting & Conformance) builds on SPF and DKIM to give domain owners control over how email receivers handle messages that fail authentication checks.' },
  { question: 'What policy should I use?', answer: 'Start with p=none to monitor without enforcement, then move to p=quarantine, then p=reject once you\'ve confirmed legitimate emails are authenticated properly.' },
  { question: 'What are rua and ruf in DMARC?', answer: 'rua is the email address for aggregate DMARC reports. ruf is for forensic (individual failure) reports. Aggregate reports are most commonly used and recommended.' },
  { question: 'What is alignment?', answer: 'Alignment determines whether the domain in the From header matches the domain used in SPF or DKIM authentication. Strict alignment requires an exact match; relaxed allows organizational domain matching.' },
]

export function DMARCCheckerPage() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<DMARCResult | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  async function handleCheck() {
    const clean = domain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '')
    const parsed = domainSchema.safeParse(clean)
    if (!parsed.success) { setValidationError(parsed.error.errors[0].message); return }
    setValidationError(null)
    setLoading(true); setError(null); setResult(null)
    trackToolUsage('dmarc-checker')
    try {
      const res = await dmarcService.check(parsed.data)
      setResult(res)
      trackToolSuccess('dmarc-checker')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Check failed.'
      setError(msg); trackToolError('dmarc-checker', msg)
    } finally { setLoading(false) }
  }

  return (
    <ToolLayout tool={tool} faqs={faqs} howItWorks={
      <>
        <p>Looks up the DMARC record at <code className="text-xs bg-muted px-1 py-0.5 rounded">_dmarc.domain</code>.</p>
        <p>Analyzes the policy, alignment settings, and reporting configuration.</p>
      </>
    }>
      <Card>
        <CardHeader className="pb-4"><CardTitle className="text-base">DMARC Checker</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="dmarc-domain" className="text-xs font-medium text-muted-foreground">Domain</label>
            <Input
              id="dmarc-domain"
              placeholder="example.com"
              value={domain}
              onChange={(e) => { setDomain(e.target.value); setValidationError(null) }}
              onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
              className={validationError ? 'border-destructive' : ''}
            />
            {validationError && <p className="text-xs text-destructive">{validationError}</p>}
          </div>
          <Button onClick={handleCheck} disabled={loading} className="gap-2">
            <Search className="h-4 w-4" />Check DMARC
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Results</CardTitle>
          {result && <span className="text-xs text-muted-foreground">{result.queryTime}ms</span>}
        </CardHeader>
        <CardContent>
          {loading && <LoadingState message="Checking DMARC record..." />}
          {!loading && error && <ErrorState message={error} onRetry={handleCheck} />}
          {!loading && !error && !result && <EmptyState title="No results yet" message="Enter a domain to analyze its DMARC policy." />}
          {!loading && !error && result && (
            <div className="space-y-4 animate-fade-in">
              {/* Status banner */}
              <div className={`flex items-center justify-between p-4 rounded-lg border ${
                result.status === 'pass' ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800'
                : result.status === 'warning' ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800'
                : 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800'
              }`}>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">DMARC Status</p>
                  <StatusBadge status={result.status} size="lg" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{result.domain}</p>
                </div>
              </div>

              {/* Policy details grid */}
              {result.policy && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Policy</p>
                    <p className="text-sm font-semibold capitalize">{result.policy}</p>
                    <p className="text-xs text-muted-foreground mt-1">{POLICY_DESCRIPTIONS[result.policy]?.split(' — ')[0]}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Percentage</p>
                    <p className="text-sm font-semibold">{result.percentage ?? 100}%</p>
                    <p className="text-xs text-muted-foreground mt-1">of messages</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border col-span-2 sm:col-span-1">
                    <p className="text-xs text-muted-foreground mb-1">Alignment</p>
                    <p className="text-xs">SPF: <span className="font-medium capitalize">{result.spfAlignment ?? 'relaxed'}</span></p>
                    <p className="text-xs">DKIM: <span className="font-medium capitalize">{result.dkimAlignment ?? 'relaxed'}</span></p>
                  </div>
                </div>
              )}

              {/* Reporting */}
              {(result.rua || result.ruf) && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Reporting</p>
                  <div className="space-y-1">
                    {result.rua && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground w-20">Aggregate:</span>
                        <span className="font-mono">{result.rua}</span>
                      </div>
                    )}
                    {result.ruf && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground w-20">Forensic:</span>
                        <span className="font-mono">{result.ruf}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Raw record */}
              {result.record && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">DMARC Record</p>
                  <div className="flex items-start gap-2 p-2.5 bg-muted rounded-md">
                    <code className="text-xs font-mono flex-1 break-all">{result.record}</code>
                    <CopyButton value={result.record} size="icon" />
                  </div>
                </div>
              )}

              {/* Warnings */}
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
