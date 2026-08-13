import { useState } from 'react'
import { Cpu, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { CopyButton } from '@/components/tools/CopyButton'
import { EmptyState } from '@/components/tools/EmptyState'
import { getToolById } from '@/config/tools'
import { calculateSubnet, validateCIDRv4, validateIPv4, getIpClass, isPrivateIP, ipToBinary } from '@/utils/networking'
import { trackToolUsage, trackToolSuccess, trackToolError } from '@/services/analytics'

const tool = getToolById('ipv4-calculator')!

const EXAMPLES = ['192.168.1.10/24', '10.0.0.1/8', '172.16.5.5/16', '8.8.8.8/32']

const faqs = [
  { question: 'What is an IPv4 address class?', answer: 'IPv4 addresses are traditionally classified into classes A (1–126), B (128–191), C (192–223), D (224–239, multicast) and E (240–255, reserved).' },
  { question: 'What makes an IP private?', answer: 'Private IP ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, and 127.0.0.0/8 (loopback). These are not routed on the public internet.' },
  { question: 'Can I enter just an IP without CIDR?', answer: 'Yes. Enter just the IP (e.g. 192.168.1.1) and the calculator will display address properties. Adding a CIDR prefix provides subnet calculations.' },
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

export function IPv4CalculatorPage() {
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ReturnType<typeof calculateSubnet> | null>(null)
  const [ipOnly, setIpOnly] = useState<{ ip: string; binary: string; ipClass: string; isPrivate: boolean } | null>(null)

  function calculate(val?: string) {
    const v = (val ?? input).trim()
    if (!v) { setError('Please enter an IPv4 address.'); return }
    setError(null)
    setResult(null)
    setIpOnly(null)

    if (v.includes('/')) {
      const err = validateCIDRv4(v)
      if (err) { setError(err); return }
      try {
        setResult(calculateSubnet(v))
        trackToolUsage('ipv4-calculator')
        trackToolSuccess('ipv4-calculator')
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Calculation failed.'
        setError(msg)
        trackToolError('ipv4-calculator', msg)
      }
    } else {
      const err = validateIPv4(v)
      if (err) { setError(err); return }
      setIpOnly({ ip: v, binary: ipToBinary(v), ipClass: getIpClass(v), isPrivate: isPrivateIP(v) })
      trackToolUsage('ipv4-calculator')
      trackToolSuccess('ipv4-calculator')
    }
  }

  return (
    <ToolLayout tool={tool} faqs={faqs} howItWorks={
      <>
        <p>Enter an IPv4 address (e.g. <code className="text-xs bg-muted px-1 rounded">192.168.1.10</code>) or an address with CIDR prefix (e.g. <code className="text-xs bg-muted px-1 rounded">192.168.1.10/24</code>).</p>
        <p>All calculations run locally in the browser.</p>
      </>
    }>
      <Card>
        <CardHeader className="pb-4"><CardTitle className="text-base">IPv4 Calculator</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="ipv4-input" className="text-xs font-medium text-muted-foreground">IPv4 Address or CIDR</label>
            <div className="flex gap-2">
              <Input
                id="ipv4-input"
                placeholder="192.168.1.10/24"
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(null) }}
                onKeyDown={(e) => e.key === 'Enter' && calculate()}
                className={`font-mono ${error ? 'border-destructive' : ''}`}
              />
              <Button onClick={() => calculate()} className="gap-2 shrink-0"><Cpu className="h-4 w-4" />Calculate</Button>
              <Button variant="ghost" size="icon" onClick={() => { setInput(''); setError(null); setResult(null); setIpOnly(null) }}><RotateCcw className="h-4 w-4" /></Button>
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
          {!result && !ipOnly && !error && <EmptyState title="Enter an IPv4 address" message="Enter an IP address like 192.168.1.10 or with CIDR like 192.168.1.10/24." />}
          {ipOnly && (
            <div className="divide-y divide-border">
              <Row label="IP Address" value={ipOnly.ip} copyable />
              <Row label="IP Class" value={ipOnly.ipClass} mono={false} />
              <Row label="Type" value={ipOnly.isPrivate ? 'Private' : 'Public'} mono={false} />
              <Row label="Binary" value={ipOnly.binary} />
            </div>
          )}
          {result && (
            <div className="space-y-4">
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between">
                <span className="font-mono text-sm font-semibold text-primary">{result.cidr}</span>
                <div className="flex gap-3 items-center">
                  <span className="text-xs text-muted-foreground">Class: <strong className="text-foreground">{result.ipClass}</strong></span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${result.isPrivate ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' : 'bg-muted text-muted-foreground'}`}>{result.isPrivate ? 'Private' : 'Public'}</span>
                </div>
              </div>
              {result.specialNote && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300">⚠️ {result.specialNote}</div>
              )}
              <div className="divide-y divide-border">
                <Row label="IPv4 Address" value={result.ipAddress} copyable />
                <Row label="Prefix Length" value={`/${result.prefixLength}`} />
                <Row label="Network Address" value={result.networkAddress} copyable />
                <Row label="Broadcast Address" value={result.broadcastAddress} copyable />
                <Row label="Subnet Mask" value={result.subnetMask} copyable />
                <Row label="Wildcard Mask" value={result.wildcardMask} copyable />
                <Row label="First Usable" value={result.firstUsableIP} copyable />
                <Row label="Last Usable" value={result.lastUsableIP} copyable />
                <Row label="Total Addresses" value={result.totalAddresses.toLocaleString()} mono={false} />
                <Row label="Usable Hosts" value={result.usableHosts.toLocaleString()} mono={false} />
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
