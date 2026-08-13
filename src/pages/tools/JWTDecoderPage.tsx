import { useState } from 'react'
import { KeyRound, Copy, Check, Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { CopyButton } from '@/components/tools/CopyButton'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { decodeJWT } from '@/utils/security'
import { getToolById } from '@/config/tools'
import { trackToolUsage, trackToolSuccess, trackToolError } from '@/services/analytics'

const tool = getToolById('jwt-decoder')!

const EXAMPLE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5OTk5OTk5OTl9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

const faqs = [
  { question: 'Is my JWT sent to a server?', answer: 'No. JWTs are decoded entirely in your browser. Your token is never sent anywhere. Avoid pasting production tokens into any online tool.' },
  { question: 'Does decoding verify the signature?', answer: 'No. Decoding only base64url-decodes the header and payload. Signature verification requires the secret key and must be done server-side.' },
  { question: 'What are standard JWT claims?', answer: 'iss (issuer), sub (subject), aud (audience), exp (expiry), iat (issued at), nbf (not before), jti (JWT ID).' },
]

const STATUS_STYLES: Record<string, string> = {
  DECODED: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
  EXPIRED: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
  NOT_YET_VALID: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  MALFORMED: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
}

export function JWTDecoderPage() {
  const [token, setToken] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ReturnType<typeof decodeJWT> | null>(null)
  const { copied: copiedHeader, copy: copyHeader } = useCopyToClipboard()
  const { copied: copiedPayload, copy: copyPayload } = useCopyToClipboard()

  function handleDecode(val?: string) {
    const t = (val ?? token).trim()
    if (!t) { setError('Please enter a JWT token.'); return }
    setError(null)
    try {
      const decoded = decodeJWT(t)
      setResult(decoded)
      if (decoded.status === 'MALFORMED') {
        setError(decoded.error)
        trackToolError('jwt-decoder', decoded.error ?? 'malformed')
      } else {
        trackToolUsage('jwt-decoder')
        trackToolSuccess('jwt-decoder')
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Decode failed.'
      setError(msg)
      trackToolError('jwt-decoder', msg)
    }
  }

  const headerStr = result?.header ? JSON.stringify(result.header, null, 2) : ''
  const payloadStr = result?.payload ? JSON.stringify(result.payload, null, 2) : ''

  return (
    <ToolLayout tool={tool} faqs={faqs} howItWorks={
      <>
        <p>Paste a JWT (header.payload.signature) and click <strong>Decode</strong>.</p>
        <p>The header and payload are base64url-decoded and displayed as JSON.</p>
        <div className="p-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded text-xs text-amber-800 dark:text-amber-300">
          ⚠️ Decoding does NOT verify the signature. Never share your JWT secret.
        </div>
      </>
    }>
      <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 dark:text-amber-300">
          <strong>Privacy:</strong> This tool operates entirely in your browser. Your JWT token is never sent to any server. However, avoid pasting production tokens with sensitive data into any online tool.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">JWT Decoder</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="jwt-input" className="text-xs font-medium text-muted-foreground">JWT Token</label>
            <textarea
              id="jwt-input"
              value={token}
              onChange={(e) => { setToken(e.target.value); setError(null); setResult(null) }}
              placeholder="Paste your JWT token here..."
              className="w-full h-24 resize-none rounded-md border border-border bg-background p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
              spellCheck={false}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => handleDecode()} className="gap-2"><KeyRound className="h-4 w-4" />Decode</Button>
            <Button variant="outline" onClick={() => { setToken(EXAMPLE_TOKEN); handleDecode(EXAMPLE_TOKEN) }}>Load Example</Button>
            <Button variant="ghost" onClick={() => { setToken(''); setError(null); setResult(null) }} className="gap-1.5 text-muted-foreground"><Trash2 className="h-3.5 w-3.5" />Clear</Button>
          </div>
        </CardContent>
      </Card>

      {result && result.status !== 'MALFORMED' && (
        <>
          {/* Status */}
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[result.status]}`}>{result.status}</span>
            {result.expiresIn && <span className="text-xs text-muted-foreground">{result.expiresIn}</span>}
          </div>

          {/* Claims summary */}
          {result.payload && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Standard Claims</CardTitle></CardHeader>
              <CardContent>
                <div className="divide-y divide-border text-sm">
                  {(['iss', 'sub', 'aud', 'jti'] as const).map((claim) =>
                    result.payload?.[claim] ? (
                      <div key={claim} className="flex items-center justify-between py-2">
                        <span className="text-muted-foreground font-mono text-xs">{claim}</span>
                        <span className="font-mono text-xs">{String(result.payload[claim])}</span>
                      </div>
                    ) : null
                  )}
                  {result.issuedAt && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-muted-foreground font-mono text-xs">iat</span>
                      <span className="text-xs">{result.issuedAt.toLocaleString()}</span>
                    </div>
                  )}
                  {result.expiresAt && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-muted-foreground font-mono text-xs">exp</span>
                      <span className="text-xs">{result.expiresAt.toLocaleString()}</span>
                    </div>
                  )}
                  {result.notBefore && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-muted-foreground font-mono text-xs">nbf</span>
                      <span className="text-xs">{result.notBefore.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Header */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Header</CardTitle>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => copyHeader(headerStr)}>
                {copiedHeader ? <><Check className="h-3 w-3 text-green-500" />Copied</> : <><Copy className="h-3 w-3" />Copy</>}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <pre className="overflow-auto p-4 font-mono text-xs text-foreground max-h-48">{headerStr}</pre>
            </CardContent>
          </Card>

          {/* Payload */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Payload</CardTitle>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => copyPayload(payloadStr)}>
                {copiedPayload ? <><Check className="h-3 w-3 text-green-500" />Copied</> : <><Copy className="h-3 w-3" />Copy</>}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <pre className="overflow-auto p-4 font-mono text-xs text-foreground max-h-64">{payloadStr}</pre>
            </CardContent>
          </Card>

          {/* Signature */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Signature</CardTitle>
              <CopyButton value={result.signature} size="sm" />
            </CardHeader>
            <CardContent>
              <p className="font-mono text-xs break-all text-muted-foreground">{result.signature}</p>
              <p className="text-xs text-muted-foreground mt-2">⚠️ The signature cannot be verified without the secret key.</p>
            </CardContent>
          </Card>
        </>
      )}
    </ToolLayout>
  )
}
