import { useState } from 'react'
import { Table, Copy, Check, Download, Trash2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { jsonToCSV, csvToJSON } from '@/utils/csv'
import { getToolById } from '@/config/tools'
import { trackToolUsage, trackToolSuccess, trackToolError } from '@/services/analytics'

const tool = getToolById('json-csv')!

const EXAMPLE_JSON = `[
  { "name": "Alice", "age": 30, "city": "London" },
  { "name": "Bob", "age": 25, "city": "New York" },
  { "name": "Carol, Dr.", "age": 35, "city": "Paris" }
]`

const EXAMPLE_CSV = `name,age,city
Alice,30,London
Bob,25,New York
"Carol, Dr.",35,Paris`

const faqs = [
  { question: 'How are commas inside fields handled?', answer: 'Fields containing commas are wrapped in double-quotes per RFC 4180. The CSV parser correctly handles quoted fields with embedded commas.' },
  { question: 'What JSON format is supported?', answer: 'JSON must be an array of objects. Each object becomes one CSV row. All keys from all objects become columns.' },
  { question: 'Is my data sent to a server?', answer: 'No. All conversion happens locally in your browser.' },
]

function downloadText(content: string, filename: string, type = 'text/plain') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export function JSONCSVPage() {
  const [mode, setMode] = useState<'json-to-csv' | 'csv-to-json'>('json-to-csv')
  const [input, setInput] = useState(EXAMPLE_JSON)
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { copied, copy } = useCopyToClipboard()

  function handleConvert() {
    trackToolUsage('json-csv')
    if (mode === 'json-to-csv') {
      const result = jsonToCSV(input)
      if (result.success && result.csv !== null) { setOutput(result.csv); setError(null); trackToolSuccess('json-csv') }
      else { setOutput(''); setError(result.error); trackToolError('json-csv') }
    } else {
      const result = csvToJSON(input)
      if (result.success && result.json) { setOutput(result.json); setError(null); trackToolSuccess('json-csv') }
      else { setOutput(''); setError(result.error); trackToolError('json-csv') }
    }
  }

  const outputFilename = mode === 'json-to-csv' ? 'data.csv' : 'data.json'
  const outputMime = mode === 'json-to-csv' ? 'text/csv' : 'application/json'

  return (
    <ToolLayout tool={tool} faqs={faqs} howItWorks={
      <>
        <p>Choose a direction, paste your data, and click <strong>Convert</strong>.</p>
        <p>JSON input must be an array of objects. CSV output uses proper quoting for fields containing commas or quotes.</p>
        <p className="text-xs text-muted-foreground">All conversion is client-side.</p>
      </>
    }>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">JSON ↔ CSV Converter</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button onClick={() => { setMode('json-to-csv'); setInput(EXAMPLE_JSON); setOutput(''); setError(null) }}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${mode === 'json-to-csv' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}>
                JSON → CSV
              </button>
              <button onClick={() => { setMode('csv-to-json'); setInput(EXAMPLE_CSV); setOutput(''); setError(null) }}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${mode === 'csv-to-json' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}>
                CSV → JSON
              </button>
            </div>
            <Button size="sm" onClick={handleConvert} className="gap-1.5"><Table className="h-3.5 w-3.5" />Convert</Button>
            <Button size="sm" variant="ghost" onClick={() => { setInput(''); setOutput(''); setError(null) }} className="gap-1.5 text-muted-foreground"><Trash2 className="h-3.5 w-3.5" />Clear</Button>
          </div>
          {error && (
            <div className="flex items-start gap-2 mt-2 p-2 bg-destructive/10 border border-destructive/30 rounded-lg">
              <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive font-mono">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{mode === 'json-to-csv' ? 'Input JSON' : 'Input CSV'}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(null) }}
              className="w-full h-72 resize-none bg-transparent p-4 font-mono text-xs focus:outline-none text-foreground placeholder:text-muted-foreground"
              placeholder={mode === 'json-to-csv' ? 'Paste JSON array here...' : 'Paste CSV here...'}
              spellCheck={false}
            />
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">{mode === 'json-to-csv' ? 'Output CSV' : 'Output JSON'}</CardTitle>
            {output && (
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => copy(output)}>
                  {copied ? <><Check className="h-3 w-3 text-green-500" />Copied</> : <><Copy className="h-3 w-3" />Copy</>}
                </Button>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => downloadText(output, outputFilename, outputMime)}>
                  <Download className="h-3 w-3" />Download
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <pre className="w-full h-72 overflow-auto p-4 font-mono text-xs text-foreground">
              {output || <span className="text-muted-foreground">Converted output will appear here...</span>}
            </pre>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  )
}
