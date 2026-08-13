import { useState } from 'react'
import { Network, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { CopyButton } from '@/components/tools/CopyButton'
import { EmptyState } from '@/components/tools/EmptyState'
import { getToolById } from '@/config/tools'
import { calculateSubnet, validateCIDRv4 } from '@/utils/networking'
import { trackToolUsage, trackToolSuccess, trackToolError } from '@/services/analytics'

const tool = getToolById('subnet-calculator')!

const EXAMPLES = ['192.168.1.0/24', '10.0.0.0/8', '172.16.0.0/16', '192.168.1.100/26', '10.10.10.0/30', '10.0.0.0/31', '10.0.0.1/32']

const faqs = [
  { question: 'What is a subnet?', answer: 'A subnet (sub-network) is a logical subdivision of an IP network. Subnetting divides a large network into smaller, more manageable segments.' },
  { question: 'What is CIDR notation?', answer: 'CIDR (Classless Inter-Domain Routing) notation represents an IP address range. For example, 192.168.1.0/24 means the network is 192.168.1.0 and /24 indicates 24 bits are used for the network portion.' },
  { question: 'Why are /31 and /32 special?', answer: '/31 subnets (RFC 3021) are used for point-to-point links and have 2 usable addresses with no broadcast. /32 is a host route referring to a single specific IP address.' },
  { question: 'What is the wildcard mask?', answer: 'The wildcard mask is the inverse of the subnet mask. It is commonly used in ACLs and routing configurations to specify which bits to ignore.' },
]

interface RowProps { label: string; value: string; copyable?: boolean; mono?: boolean }
function Row({ label, value, copyable = false, mono = true }: RowProps) {
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

export function SubnetCalculatorPage() {
  const [cidr, setCidr] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ReturnType<typeof calculateSubnet> | null>(null)

  function calculate(input?: string) {
    const val = (input ?? cidr).trim()
    const err = validateCIDRv4(val)
    if (err) { setError(err); setResult(null); return }
    setError(null)
    try {
      setResult(calculateSubnet(val))
      trackToolUsage('subnet-calculator')
      trackToolSuccess('subnet-calculator')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Calculation failed.'
      setError(msg)
      trackToolError('subnet-calculator', msg)
    }
  }

  function reset() { setCidr(''); setError(null); setResult(null) }

  return (
    <ToolLayout tool={tool} faqs={faqs} howItWorks={
      <>
        <p>Enter any IPv4 CIDR block (e.g. <code className="text-xs bg-muted px-1 rounded">192.168.1.0/24</code>) and get full subnet details.</p>
        <p>All calculations happen locally — no network requests needed.</p>
      </>
    }>
      <Card>
        <CardHeader className="pb-4"><CardTitle className="text-base">Subnet Calculator</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="subnet-input" className="text-xs font-medium text-muted-foreground">CIDR Notation</label>
            <div className="flex gap-2">
              <Input
                id="subnet-input"
                placeholder="192.168.1.0/24"
                value={cidr}
                onChange={(e) => { setCidr(e.target.value); setError(null) }}
                onKeyDown={(e) => e.key === 'Enter' && calculate()}
                className={`font-mono ${error ? 'border-destructive' : ''}`}
              />
              <Button onClick={() => calculate()} className="gap-2 shrink-0"><Network className="h-4 w-4" />Calculate</Button>
              <Button variant="ghost" size="icon" onClick={reset} title="Reset"><RotateCcw className="h-4 w-4" /></Button>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground">Examples:</span>
            {EXAMPLES.map((ex) => (
              <button key={ex} onClick={() => { setCidr(ex); calculate(ex) }} className="text-xs font-mono text-primary hover:underline">{ex}</button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Results</CardTitle></CardHeader>
        <CardContent>
          {!result && !error && <EmptyState title="Enter a CIDR block" message="Type a CIDR notation like 192.168.1.0/24 and click Calculate." />}
          {result && (
            <div className="space-y-4">
              {result.specialNote && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300">
                  ⚠️ {result.specialNote}
                </div>
              )}
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between">
                <span className="font-mono text-sm font-semibold text-primary">{result.cidr}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">Class: <strong className="text-foreground">{result.ipClass}</strong></span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${result.isPrivate ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' : 'bg-muted text-muted-foreground'}`}>{result.isPrivate ? 'Private' : 'Public'}</span>
                </div>
              </div>
              <div className="divide-y divide-border">
                <Row label="IP Address" value={result.ipAddress} copyable />
                <Row label="Network Address" value={result.networkAddress} copyable />
                <Row label="Broadcast Address" value={result.broadcastAddress} copyable />
                <Row label="Subnet Mask" value={result.subnetMask} copyable />
                <Row label="Wildcard Mask" value={result.wildcardMask} copyable />
                <Row label="First Usable IP" value={result.firstUsableIP} copyable />
                <Row label="Last Usable IP" value={result.lastUsableIP} copyable />
                <Row label="IP Range" value={result.ipRange} copyable />
                <Row label="Total Addresses" value={result.totalAddresses.toLocaleString()} mono={false} />
                <Row label="Usable Hosts" value={result.usableHosts.toLocaleString()} mono={false} />
                <Row label="Prefix Length" value={`/${result.prefixLength}`} />
                <Row label="Binary (IP)" value={result.binaryAddress} />
                <Row label="Binary (Mask)" value={result.binaryMask} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </ToolLayout>
  )
}
