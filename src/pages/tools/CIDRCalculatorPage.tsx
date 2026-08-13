import { useState } from 'react'
import { Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { EmptyState } from '@/components/tools/EmptyState'
import { CopyButton } from '@/components/tools/CopyButton'
import { calculate, validateCIDR } from '@/utils/cidr'
import { getToolById } from '@/config/tools'
import { trackToolUsage, trackToolSuccess, trackToolError } from '@/services/analytics'
import type { CIDRResult } from '@/types'

const tool = getToolById('cidr-calculator')!

const EXAMPLES = ['192.168.1.0/24', '10.0.0.0/8', '172.16.0.0/16', '10.10.10.0/28']

const faqs = [
  { question: 'What is CIDR notation?', answer: 'CIDR (Classless Inter-Domain Routing) notation represents an IP address range. For example, 192.168.1.0/24 means the network address is 192.168.1.0 and the /24 indicates 24 bits are used for the network portion.' },
  { question: 'How many usable hosts does /24 give?', answer: 'A /24 subnet has 256 total addresses. Subtracting the network address and broadcast address leaves 254 usable host addresses.' },
  { question: 'What is a broadcast address?', answer: 'The broadcast address is the last IP in a subnet. Packets sent to the broadcast address are received by all hosts in the subnet.' },
  { question: 'What is the wildcard mask?', answer: 'The wildcard mask is the inverse of the subnet mask. It is commonly used in access control lists (ACLs) and routing configurations.' },
]

interface ResultRowProps {
  label: string
  value: string
  mono?: boolean
  copyable?: boolean
}

function ResultRow({ label, value, mono = true, copyable = false }: ResultRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${mono ? 'font-mono' : ''}`}>{value}</span>
        {copyable && <CopyButton value={value} size="icon" />}
      </div>
    </div>
  )
}

export function CIDRCalculatorPage() {
  const [cidr, setCidr] = useState('')
  const [result, setResult] = useState<CIDRResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleCalculate(input?: string) {
    const value = input ?? cidr
    const validationError = validateCIDR(value)
    if (validationError) {
      setError(validationError)
      setResult(null)
      return
    }
    setError(null)
    try {
      const res = calculate(value)
      setResult(res)
      trackToolUsage('cidr-calculator')
      trackToolSuccess('cidr-calculator')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Calculation failed.'
      setError(msg)
      trackToolError('cidr-calculator', msg)
    }
  }

  function loadExample(ex: string) {
    setCidr(ex)
    setError(null)
    const validationError = validateCIDR(ex)
    if (!validationError) {
      const res = calculate(ex)
      setResult(res)
    }
  }

  return (
    <ToolLayout tool={tool} faqs={faqs} howItWorks={
      <>
        <p>Calculates all subnet details from a CIDR notation. Works entirely in your browser — no network requests needed.</p>
        <p>Enter a CIDR block like <code className="text-xs bg-muted px-1 py-0.5 rounded">192.168.1.0/24</code> and click <strong>Calculate</strong>.</p>
      </>
    }>
      <Card>
        <CardHeader className="pb-4"><CardTitle className="text-base">CIDR Calculator</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="cidr-input" className="text-xs font-medium text-muted-foreground">CIDR Notation</label>
            <div className="flex gap-2">
              <Input
                id="cidr-input"
                placeholder="192.168.1.0/24"
                value={cidr}
                onChange={(e) => { setCidr(e.target.value); setError(null) }}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                className={`font-mono ${error ? 'border-destructive' : ''}`}
              />
              <Button onClick={() => handleCalculate()} className="gap-2 shrink-0">
                <Calculator className="h-4 w-4" />Calculate
              </Button>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          {/* Examples */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Examples:</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => loadExample(ex)}
                className="text-xs font-mono text-primary hover:underline"
              >
                {ex}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Results</CardTitle></CardHeader>
        <CardContent>
          {!result && !error && (
            <EmptyState
              title="Enter a CIDR block"
              message="Type a CIDR notation like 192.168.1.0/24 and click Calculate."
            />
          )}
          {result && (
            <div className="animate-fade-in">
              {/* Summary row */}
              <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between">
                <span className="font-mono text-sm font-semibold text-primary">{result.cidr}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">IP Class: <span className="font-medium text-foreground">{result.ipClass}</span></span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${result.isPrivate ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' : 'bg-muted text-muted-foreground'}`}>
                    {result.isPrivate ? 'Private' : 'Public'}
                  </span>
                </div>
              </div>

              <div className="divide-y divide-border">
                <ResultRow label="IP Address" value={result.ipAddress} copyable />
                <ResultRow label="Network Address" value={result.networkAddress} copyable />
                <ResultRow label="Broadcast Address" value={result.broadcastAddress} copyable />
                <ResultRow label="Subnet Mask" value={result.subnetMask} copyable />
                <ResultRow label="Wildcard Mask" value={result.wildcardMask} copyable />
                <ResultRow label="First Usable IP" value={result.firstUsableIP} copyable />
                <ResultRow label="Last Usable IP" value={result.lastUsableIP} copyable />
                <ResultRow label="Total Addresses" value={result.totalAddresses.toLocaleString()} mono={false} />
                <ResultRow label="Usable Hosts" value={result.usableHosts.toLocaleString()} mono={false} />
                <ResultRow label="Prefix Length" value={`/${result.prefixLength}`} />
                <ResultRow label="Binary Mask" value={result.binaryMask} />
                <ResultRow label="Hex Mask" value={result.hexMask} copyable />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </ToolLayout>
  )
}
