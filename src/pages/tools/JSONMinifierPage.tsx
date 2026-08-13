import { useState } from 'react'
import { Minimize2, Maximize2, Trash2, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { minify, format } from '@/utils/json'
import { getToolById } from '@/config/tools'
import { trackToolUsage, trackToolSuccess, trackToolError } from '@/services/analytics'

const tool = getToolById('json-minifier')!

const EXAMPLE = `{
  "name": "Alice",
  "age": 30,
  "roles": ["admin", "user"],
  "address": {
    "city": "London",
    "country": "UK"
  }
}`

const faqs = [
  { question: 'Is minification safe?', answer: 'Yes. Minification only removes whitespace (spaces, tabs, newlines) between tokens. The actual data values and structure are unchanged.' },
  { question: 'Is my data sent to a server?', answer: 'No. All minification and formatting happen entirely in your browser.' },
  { question: 'Why minify JSON?', answer: 'Minified JSON is smaller, which reduces bandwidth usage in APIs and web applications. The saving can be 20–60% for typical JSON.' },
]

export function JSONMinifierPage() {
  const [input, setInput] = useState(EXAMPLE)
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{ original: number; minified: number; savings: number } | null>(null)
  const { copied: copiedOut, copy: copyOut } = useCopyToClipboard()
  const { copied: copiedIn, copy: copyIn } = useCopyToClipboard()

  function handleMinify() {
    trackToolUsage('json-minifier')
    const result = minify(input)
    if (result.success && result.minified) {
      setOutput(result.minified)
      setError(null)
      setStats({ original: result.originalSize, minified: result.minifiedSize, savings: result.savings })
      trackToolSuccess('json-minifier')
    } else {
      setOutput('')
      setError(result.error ?? 'Invalid JSON')
      setStats(null)
      trackToolError('json-minifier')
    }
  }

  function handleFormat() {
    const result = format(input)
    if (result.success && result.formatted) {
      setInput(result.formatted)
      setError(null)
    } else {
      setError(result.error ?? 'Invalid JSON')
    }
  }

  function handleClear() { setInput(''); setOutput(''); setError(null); setStats(null) }

  return (
    <ToolLayout tool={tool} faqs={faqs} howItWorks={
      <>
        <p>Paste formatted JSON and click <strong>Minify</strong> to remove all unnecessary whitespace.</p>
        <p>Click <strong>Format</strong> to pretty-print the input first.</p>
        <p className="text-xs text-muted-foreground">Your data stays in the browser.</p>
      </>
    }>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">JSON Minifier</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={handleMinify} className="gap-1.5"><Minimize2 className="h-3.5 w-3.5" />Minify</Button>
            <Button size="sm" variant="outline" onClick={handleFormat} className="gap-1.5"><Maximize2 className="h-3.5 w-3.5" />Format Input</Button>
            <Button size="sm" variant="ghost" onClick={handleClear} className="gap-1.5 text-muted-foreground"><Trash2 className="h-3.5 w-3.5" />Clear</Button>
          </div>
          {error && <p className="text-xs text-destructive mt-2 font-mono">{error}</p>}
          {stats && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded-lg">
              <span>Original: <strong>{stats.original.toLocaleString()} B</strong></span>
              <span>Minified: <strong>{stats.minified.toLocaleString()} B</strong></span>
              <span className="text-green-600 dark:text-green-400">Saved: <strong>{stats.savings}%</strong></span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="flex flex-col">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Input JSON</CardTitle>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => copyIn(input)}>
              {copiedIn ? <><Check className="h-3 w-3 text-green-500" />Copied</> : <><Copy className="h-3 w-3" />Copy</>}
            </Button>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(null) }}
              placeholder="Paste formatted JSON here..."
              className="w-full h-72 resize-none bg-transparent p-4 font-mono text-xs focus:outline-none text-foreground placeholder:text-muted-foreground"
              spellCheck={false}
            />
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Minified Output</CardTitle>
            {output && (
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => copyOut(output)}>
                {copiedOut ? <><Check className="h-3 w-3 text-green-500" />Copied</> : <><Copy className="h-3 w-3" />Copy</>}
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <pre className="w-full h-72 overflow-auto p-4 font-mono text-xs text-foreground">
              {output || <span className="text-muted-foreground">Minified output will appear here...</span>}
            </pre>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  )
}
