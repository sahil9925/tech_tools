import { useState } from 'react'
import { Globe2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { CopyButton } from '@/components/tools/CopyButton'
import { EmptyState } from '@/components/tools/EmptyState'
import { getToolById } from '@/config/tools'
import { expandIPv6, compressIPv6, getIPv6Type, validateIPv6 } from '@/utils/networking'
import { trackToolUsage, trackToolSuccess, trackToolError } from '@/services/analytics'

const tool = getToolById('ipv6-calculator')!

const EXAMPLES = ['2001:db8::/32', '2001:db8:abcd:0012::1/64', '::1', 'fe80::1%eth0', '::ffff:192.0.2.1']

const faqs = [
  { question: 'What is :: in IPv6?', answer: 'The double colon (::) is a shorthand that replaces one or more consecutive groups of 16-bit zeros. It can only appear once in an address.' },
  { question: 'What is a link-local address?', answer: 'Addresses starting with fe80::/10 are link-local. They are automatically assigned and only reachable within a single network segment.' },
  { question: 'What is a global unicast address?', answer: 'Addresses in the 2000::/3 range are globally routable on the internet, similar to public IPv4 addresses.' },
  { question: 'What does IPv4-mapped IPv6 mean?', answer: 'An IPv4-mapped IPv6 address like ::ffff:192.0.2.1 represents an IPv4 address in IPv6 format. Used by dual-stack systems.' },
]

interface RowProps { label: string; value: string; copyable?: boolean; mono?: boolean }
function Row({ label, value, copyable = false, mono = true }: RowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0 gap-4">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <div className="flex items-center gap-2 overflow-hidden">
        <span className={`text-sm font-medium truncate ${mono ? 'font-mono' : ''}`} title={value}>{value}</span>
        {copyable && <CopyButton value={value} size="icon" />}
      </div>
    </div>
  )
}

export function IPv6CalculatorPage() {
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    input: string; compressed: string; expanded: string;
    prefixLength: string | null; type: string; networkPrefix: string | null
  } | null>(null)

  function calculate(val?: string) {
    const raw = (val ?? input).trim()
    if (!raw) { setError('Please enter an IPv6 address.'); return }

    let addr = raw
    let prefixStr: string | null = null
    const slashIdx = raw.indexOf('/')
    if (slashIdx !== -1) {
      addr = raw.slice(0, slashIdx)
      prefixStr = raw.slice(slashIdx + 1)
    }
    // Strip zone ID for validation
    addr = addr.split('%')[0]

    const err = validateIPv6(addr)
    if (err) { setError(err); setResult(null); return }

    setError(null)
    try {
      const expanded = expandIPv6(addr)
      const compressed = compressIPv6(expanded)
      const type = getIPv6Type(expanded)

      let networkPrefix: string | null = null
      if (prefixStr !== null) {
        const prefix = parseInt(prefixStr, 10)
        if (!isNaN(prefix) && prefix >= 0 && prefix <= 128) {
          // Calculate network prefix (first prefixLen bits)
          networkPrefix = `${compressed}/${prefix}`
        }
      }

      setResult({ input: raw, compressed, expanded, prefixLength: prefixStr, type, networkPrefix })
      trackToolUsage('ipv6-calculator')
      trackToolSuccess('ipv6-calculator')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Calculation failed.'
      setError(msg)
      trackToolError('ipv6-calculator', msg)
    }
  }

  return (
    <ToolLayout tool={tool} faqs={faqs} howItWorks={
      <>
        <p>Enter any IPv6 address, optionally with a prefix (e.g. <code className="text-xs bg-muted px-1 rounded">2001:db8::/32</code>).</p>
        <p>Supports compressed (<code className="text-xs bg-muted px-1 rounded">::</code>) and full expanded notation.</p>
        <p className="text-xs text-muted-foreground">Note: IPv6 address spaces are astronomically large — usable host counts are not displayed as they are impractical to show.</p>
      </>
    }>
      <Card>
        <CardHeader className="pb-4"><CardTitle className="text-base">IPv6 Calculator</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="ipv6-input" className="text-xs font-medium text-muted-foreground">IPv6 Address</label>
            <div className="flex gap-2">
              <Input
                id="ipv6-input"
                placeholder="2001:db8::/32"
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(null) }}
                onKeyDown={(e) => e.key === 'Enter' && calculate()}
                className={`font-mono ${error ? 'border-destructive' : ''}`}
              />
              <Button onClick={() => calculate()} className="gap-2 shrink-0"><Globe2 className="h-4 w-4" />Analyse</Button>
              <Button variant="ghost" size="icon" onClick={() => { setInput(''); setError(null); setResult(null) }}><RotateCcw className="h-4 w-4" /></Button>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground">Examples:</span>
            {EXAMPLES.map((ex) => (
              <button key={ex} onClick={() => { setInput(ex); calculate(ex) }} className="text-xs font-mono text-primary hover:underline">{ex}</button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Results</CardTitle></CardHeader>
        <CardContent>
          {!result && !error && <EmptyState title="Enter an IPv6 address" message="Enter an IPv6 address like 2001:db8::/32 and click Analyse." />}
          {result && (
            <div className="space-y-4">
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <span className="font-mono text-sm font-semibold text-primary break-all">{result.compressed}</span>
                <span className={`ml-3 text-xs px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400`}>{result.type}</span>
              </div>
              <div className="divide-y divide-border">
                <Row label="Input Address" value={result.input} copyable />
                <Row label="Compressed" value={result.compressed} copyable />
                <Row label="Expanded (Full)" value={result.expanded} copyable />
                {result.prefixLength && <Row label="Prefix Length" value={`/${result.prefixLength}`} />}
                {result.networkPrefix && <Row label="Network Prefix" value={result.networkPrefix} copyable />}
                <Row label="Address Type" value={result.type} mono={false} />
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                ℹ️ IPv6 address space is 2¹²⁸ addresses (~3.4 × 10³⁸). Usable host counts are not shown as they are not meaningful in practice.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </ToolLayout>
  )
}
