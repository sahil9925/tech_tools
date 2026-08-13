import { useState } from 'react'
import { Search } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { LoadingState } from '@/components/tools/LoadingState'
import { ErrorState } from '@/components/tools/ErrorState'
import { EmptyState } from '@/components/tools/EmptyState'
import { CopyButton } from '@/components/tools/CopyButton'
import { dnsService } from '@/services/dnsService'
import { getToolById } from '@/config/tools'
import { trackToolUsage, trackToolSuccess, trackToolError } from '@/services/analytics'
import type { DNSResult } from '@/types'

const domainSchema = z.string().min(1, 'Domain is required').regex(
  /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/,
  'Please enter a valid domain name'
)

type RecordType = 'A' | 'AAAA' | 'MX' | 'TXT' | 'CNAME' | 'NS' | 'SOA'

const RECORD_TYPES: RecordType[] = ['A', 'AAAA', 'MX', 'TXT', 'CNAME', 'NS', 'SOA']

const tool = getToolById('dns-lookup')!

const faqs = [
  { question: 'What is a DNS lookup?', answer: 'A DNS lookup queries the Domain Name System to translate domain names into IP addresses and other records. DNS is the phonebook of the internet.' },
  { question: 'What is an A record?', answer: 'An A record maps a domain name to an IPv4 address. For example, example.com → 93.184.216.34.' },
  { question: 'What is an AAAA record?', answer: 'An AAAA record maps a domain name to an IPv6 address. Similar to A records but for the newer IPv6 protocol.' },
  { question: 'What does TTL mean?', answer: 'TTL (Time to Live) is the number of seconds a DNS record is cached before being refreshed. Lower TTL means faster propagation of changes.' },
  { question: 'Why does my DNS not show updated records?', answer: 'DNS changes take time to propagate due to TTL-based caching. Changes can take anywhere from a few minutes to 48 hours to fully propagate.' },
]

export function DNSLookupPage() {
  const [domain, setDomain] = useState('')
  const [recordType, setRecordType] = useState<RecordType>('A')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<DNSResult | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  async function handleLookup() {
    const parsed = domainSchema.safeParse(domain.trim().replace(/^https?:\/\//, '').replace(/\/$/, ''))
    if (!parsed.success) {
      setValidationError(parsed.error.errors[0].message)
      return
    }
    setValidationError(null)
    setLoading(true)
    setError(null)
    setResult(null)
    trackToolUsage('dns-lookup')

    try {
      const res = await dnsService.lookup(parsed.data, recordType)
      setResult(res)
      trackToolSuccess('dns-lookup')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Lookup failed. Please try again.'
      setError(msg)
      trackToolError('dns-lookup', msg)
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleLookup()
  }

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howItWorks={
        <>
          <p>This tool queries DNS servers to retrieve records for your domain.</p>
          <p>Enter a domain name, select the record type, and click <strong>Lookup DNS</strong> to see the results.</p>
          <p className="text-xs">Supported types: A, AAAA, MX, TXT, CNAME, NS, SOA</p>
        </>
      }
    >
      {/* Input card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">DNS Lookup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 space-y-1">
              <label htmlFor="dns-domain" className="text-xs font-medium text-muted-foreground">Domain</label>
              <Input
                id="dns-domain"
                placeholder="example.com"
                value={domain}
                onChange={(e) => { setDomain(e.target.value); setValidationError(null) }}
                onKeyDown={handleKeyDown}
                className={validationError ? 'border-destructive' : ''}
              />
              {validationError && <p className="text-xs text-destructive">{validationError}</p>}
            </div>
            <div className="space-y-1">
              <label htmlFor="dns-record-type" className="text-xs font-medium text-muted-foreground">Record Type</label>
              <Select value={recordType} onValueChange={(v) => setRecordType(v as RecordType)}>
                <SelectTrigger id="dns-record-type" className="w-full sm:w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECORD_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleLookup} disabled={loading} className="gap-2">
            <Search className="h-4 w-4" />
            Lookup DNS
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Results</CardTitle>
          {result && (
            <span className="text-xs text-muted-foreground">
              {result.queryTime}ms · {result.records.length} record{result.records.length !== 1 ? 's' : ''}
            </span>
          )}
        </CardHeader>
        <CardContent>
          {loading && <LoadingState message="Querying DNS servers..." />}
          {!loading && error && <ErrorState message={error} onRetry={handleLookup} />}
          {!loading && !error && !result && (
            <EmptyState
              title="No results yet"
              message="Enter a domain name and select a record type, then click Lookup DNS."
            />
          )}
          {!loading && !error && result && (
            <div className="space-y-4 animate-fade-in">
              {/* Summary */}
              <div className="flex items-center gap-4 text-sm p-3 bg-muted/50 rounded-lg">
                <div>
                  <span className="text-muted-foreground">Domain: </span>
                  <span className="font-medium font-mono">{result.domain}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Type: </span>
                  <span className="font-medium">{result.recordType}</span>
                </div>
              </div>

              {/* Records table */}
              {result.records.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No {result.recordType} records found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="result-table">
                    <thead>
                      <tr>
                        <th className="pr-6">Type</th>
                        <th className="pr-6">Host</th>
                        <th className="pr-6">Value</th>
                        <th className="pr-4 text-right">TTL</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.records.map((record, i) => (
                        <tr key={i}>
                          <td className="pr-6">
                            <span className="font-mono text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded">
                              {record.type}
                            </span>
                          </td>
                          <td className="pr-6 font-mono text-xs text-muted-foreground">{record.host}</td>
                          <td className="pr-6 font-mono text-xs max-w-[200px] truncate" title={record.value}>{record.value}</td>
                          <td className="pr-4 text-right text-xs text-muted-foreground">{record.ttl}s</td>
                          <td><CopyButton value={record.value} size="icon" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </ToolLayout>
  )
}
