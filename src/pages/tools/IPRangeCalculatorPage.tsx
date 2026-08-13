import { useState } from 'react'
import { ArrowLeftRight, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { CopyButton } from '@/components/tools/CopyButton'
import { EmptyState } from '@/components/tools/EmptyState'
import { getToolById } from '@/config/tools'
import { validateIPv4, validateCIDRv4, calculateIPRange, calculateSubnet, ipToInt, intToIp } from '@/utils/networking'
import { trackToolUsage, trackToolSuccess, trackToolError } from '@/services/analytics'

const tool = getToolById('ip-range-calculator')!

const faqs = [
  { question: 'How is total IP count calculated?', answer: 'Total = int(End IP) − int(Start IP) + 1, where int() converts a dotted-decimal IP to a 32-bit integer.' },
  { question: 'What is CIDR approximation?', answer: 'The tool calculates the smallest power-of-2 block that contains the given range and shows the corresponding CIDR prefix. The actual range may be smaller.' },
  { question: 'Can I enter a CIDR instead of start/end?', answer: 'Yes! Enter a CIDR block in the Start IP field (e.g. 192.168.1.0/24) and leave End IP empty.' },
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

export function IPRangeCalculatorPage() {
  const [startIP, setStartIP] = useState('')
  const [endIP, setEndIP] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ReturnType<typeof calculateIPRange> | null>(null)

  function calculate() {
    setError(null)
    setResult(null)

    // If startIP looks like CIDR, derive from that
    if (startIP.includes('/')) {
      const err = validateCIDRv4(startIP)
      if (err) { setError(err); return }
      try {
        const sub = calculateSubnet(startIP)
        setResult(calculateIPRange(sub.networkAddress, sub.broadcastAddress))
        trackToolUsage('ip-range-calculator')
        trackToolSuccess('ip-range-calculator')
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Calculation failed.'
        setError(msg)
        trackToolError('ip-range-calculator', msg)
      }
      return
    }

    const startErr = validateIPv4(startIP)
    if (startErr) { setError(`Start IP: ${startErr}`); return }
    const endErr = validateIPv4(endIP)
    if (endErr) { setError(`End IP: ${endErr}`); return }

    const startInt = ipToInt(startIP)
    const endInt = ipToInt(endIP)
    if (startInt > endInt) {
      setError('Start IP must be less than or equal to End IP.')
      return
    }

    if (endInt - startInt > 100_000_000) {
      setError('Range is too large to calculate safely (> 100 million IPs). Please use a smaller range.')
      return
    }

    try {
      setResult(calculateIPRange(startIP, endIP))
      trackToolUsage('ip-range-calculator')
      trackToolSuccess('ip-range-calculator')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Calculation failed.'
      setError(msg)
      trackToolError('ip-range-calculator', msg)
    }
  }

  return (
    <ToolLayout tool={tool} faqs={faqs} howItWorks={
      <>
        <p>Enter a start and end IPv4 address to calculate the total number of IPs in that range.</p>
        <p>Or enter a CIDR block in the Start IP field to auto-derive the range.</p>
        <p className="text-xs text-muted-foreground">No IP addresses are enumerated — only mathematical range calculation is performed.</p>
      </>
    }>
      <Card>
        <CardHeader className="pb-4"><CardTitle className="text-base">IP Range Calculator</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="start-ip" className="text-xs font-medium text-muted-foreground">Start IP (or CIDR)</label>
              <Input
                id="start-ip"
                placeholder="192.168.1.10 or 192.168.1.0/24"
                value={startIP}
                onChange={(e) => { setStartIP(e.target.value); setError(null) }}
                onKeyDown={(e) => e.key === 'Enter' && calculate()}
                className={`font-mono ${error ? 'border-destructive' : ''}`}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="end-ip" className="text-xs font-medium text-muted-foreground">End IP (optional with CIDR)</label>
              <Input
                id="end-ip"
                placeholder="192.168.1.100"
                value={endIP}
                onChange={(e) => { setEndIP(e.target.value); setError(null) }}
                onKeyDown={(e) => e.key === 'Enter' && calculate()}
                className="font-mono"
              />
            </div>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button onClick={calculate} className="gap-2"><ArrowLeftRight className="h-4 w-4" />Calculate</Button>
            <Button variant="ghost" onClick={() => { setStartIP(''); setEndIP(''); setError(null); setResult(null) }}><RotateCcw className="h-4 w-4 mr-1" />Reset</Button>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>Examples:</span>
            <button className="font-mono text-primary hover:underline" onClick={() => { setStartIP('192.168.1.10'); setEndIP('192.168.1.100') }}>192.168.1.10 – 192.168.1.100</button>
            <button className="font-mono text-primary hover:underline" onClick={() => { setStartIP('10.0.0.0/24'); setEndIP('') }}>10.0.0.0/24</button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Results</CardTitle></CardHeader>
        <CardContent>
          {!result && !error && <EmptyState title="Enter IP addresses" message="Provide a start and end IP, or a CIDR block, and click Calculate." />}
          {result && (
            <div className="divide-y divide-border">
              <Row label="Start IP" value={result.startIP} copyable />
              <Row label="End IP" value={result.endIP} copyable />
              <Row label="First Address" value={intToIp(result.startInt)} copyable />
              <Row label="Last Address" value={intToIp(result.endInt)} copyable />
              <Row label="Total Addresses" value={result.totalAddresses.toLocaleString()} mono={false} />
              <Row label="Range Size" value={result.totalAddresses > 1 ? `${result.totalAddresses.toLocaleString()} IPs` : '1 IP'} mono={false} />
              <Row label="CIDR Approximation" value={result.cidrApproximation} mono={false} />
            </div>
          )}
        </CardContent>
      </Card>
    </ToolLayout>
  )
}
