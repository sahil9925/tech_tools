import { useState } from 'react'
import { Search, AlertTriangle, Calendar, Clock } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { LoadingState } from '@/components/tools/LoadingState'
import { ErrorState } from '@/components/tools/ErrorState'
import { EmptyState } from '@/components/tools/EmptyState'
import { StatusBadge } from '@/components/tools/StatusBadge'
import { sslService } from '@/services/sslService'
import { getToolById } from '@/config/tools'
import { trackToolUsage, trackToolSuccess, trackToolError } from '@/services/analytics'
import { formatDate } from '@/lib/utils'
import type { SSLResult } from '@/types'

const domainSchema = z.string().min(1).regex(
  /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/,
  'Please enter a valid domain'
)

const tool = getToolById('ssl-checker')!

const faqs = [
  { question: 'What does SSL/TLS do?', answer: 'SSL/TLS encrypts data transmitted between a browser and a web server, protecting it from interception. The padlock icon in your browser indicates a valid SSL certificate.' },
  { question: 'What is certificate expiry?', answer: 'SSL certificates have an expiry date. Once expired, browsers will show security warnings and block access. Most certificates are valid for 90 days to 2 years.' },
  { question: 'What is TLS 1.3?', answer: 'TLS 1.3 is the latest version of the TLS protocol, offering improved security and performance over TLS 1.2. Modern servers should use TLS 1.3.' },
  { question: 'What is a Subject Alternative Name (SAN)?', answer: 'SANs allow a single certificate to cover multiple domain names. For example, a certificate for example.com might also cover www.example.com.' },
]

function ExpiryIndicator({ daysRemaining }: { daysRemaining: number }) {
  const pct = Math.min(100, Math.max(0, (daysRemaining / 90) * 100))
  const color = daysRemaining > 30 ? 'bg-green-500' : daysRemaining > 7 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Certificate Expiry</span>
        <span className={`font-medium ${daysRemaining > 30 ? 'text-green-600 dark:text-green-400' : daysRemaining > 7 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
          {daysRemaining} days remaining
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function SSLCheckerPage() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SSLResult | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  async function handleCheck() {
    const clean = domain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '')
    const parsed = domainSchema.safeParse(clean)
    if (!parsed.success) { setValidationError(parsed.error.errors[0].message); return }
    setValidationError(null)
    setLoading(true); setError(null); setResult(null)
    trackToolUsage('ssl-checker')
    try {
      const res = await sslService.check(parsed.data)
      setResult(res)
      trackToolSuccess('ssl-checker')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Check failed.'
      setError(msg); trackToolError('ssl-checker', msg)
    } finally { setLoading(false) }
  }

  return (
    <ToolLayout tool={tool} faqs={faqs} howItWorks={
      <>
        <p>Retrieves SSL certificate information for a domain via our backend service.</p>
        <p className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded p-2">
          Note: This uses demo data. Real SSL inspection requires a backend service due to browser security restrictions.
        </p>
        <p>Enter a domain (without https://) and click <strong>Check SSL</strong>.</p>
      </>
    }>
      <Card>
        <CardHeader className="pb-4"><CardTitle className="text-base">SSL Certificate Checker</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="ssl-domain" className="text-xs font-medium text-muted-foreground">Domain</label>
            <Input
              id="ssl-domain"
              placeholder="example.com"
              value={domain}
              onChange={(e) => { setDomain(e.target.value); setValidationError(null) }}
              onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
              className={validationError ? 'border-destructive' : ''}
            />
            {validationError && <p className="text-xs text-destructive">{validationError}</p>}
          </div>
          <Button onClick={handleCheck} disabled={loading} className="gap-2">
            <Search className="h-4 w-4" />Check SSL
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Results</CardTitle>
          {result && <span className="text-xs text-muted-foreground">{result.queryTime}ms</span>}
        </CardHeader>
        <CardContent>
          {loading && <LoadingState message="Checking SSL certificate..." />}
          {!loading && error && <ErrorState message={error} onRetry={handleCheck} />}
          {!loading && !error && !result && <EmptyState title="No results yet" message="Enter a domain to inspect its SSL certificate." />}
          {!loading && !error && result && (
            <div className="space-y-4 animate-fade-in">
              {/* Status */}
              <div className={`flex items-center justify-between p-4 rounded-lg border ${
                result.status === 'valid' ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800'
                : 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800'
              }`}>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">SSL Status</p>
                  <StatusBadge status={result.status} size="lg" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{result.domain}</p>
                  {result.tlsVersion && <p className="text-xs font-mono font-medium text-foreground">{result.tlsVersion}</p>}
                </div>
              </div>

              {/* Expiry indicator */}
              {result.daysRemaining !== null && (
                <ExpiryIndicator daysRemaining={result.daysRemaining} />
              )}

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3">
                {result.issuer && (
                  <div className="p-3 bg-muted/50 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Issuer</p>
                    <p className="text-xs font-medium">{result.issuer}</p>
                  </div>
                )}
                {result.tlsVersion && (
                  <div className="p-3 bg-muted/50 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">TLS Version</p>
                    <p className="text-xs font-medium">{result.tlsVersion}</p>
                  </div>
                )}
                {result.issuedDate && (
                  <div className="p-3 bg-muted/50 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Calendar className="h-3 w-3" />Issued</p>
                    <p className="text-xs font-medium">{formatDate(result.issuedDate)}</p>
                  </div>
                )}
                {result.expiryDate && (
                  <div className="p-3 bg-muted/50 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Clock className="h-3 w-3" />Expires</p>
                    <p className="text-xs font-medium">{formatDate(result.expiryDate)}</p>
                  </div>
                )}
              </div>

              {/* SANs */}
              {result.subjectAltNames.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Subject Alternative Names</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.subjectAltNames.map((san, i) => (
                      <span key={i} className="font-mono text-xs bg-muted border border-border px-2 py-0.5 rounded">{san}</span>
                    ))}
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
