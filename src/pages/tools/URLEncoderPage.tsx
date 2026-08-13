import { useState } from 'react'
import { Link2, ArrowUpDown, Trash2, Copy, Check, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { encodeURLComponent, decodeURLComponent, encodeFullURL, decodeFullURL } from '@/utils/security'
import { getToolById } from '@/config/tools'
import { trackToolUsage, trackToolSuccess, trackToolError } from '@/services/analytics'

const tool = getToolById('url-encoder')!

type Mode = 'encode-component' | 'decode-component' | 'encode-full' | 'decode-full'

const MODE_LABELS: Record<Mode, { label: string; placeholder: string }> = {
  'encode-component': { label: 'Encode URL Component', placeholder: 'hello world & foo=bar' },
  'decode-component': { label: 'Decode URL Component', placeholder: 'hello%20world%20%26%20foo%3Dbar' },
  'encode-full': { label: 'Encode Full URL', placeholder: 'https://example.com/path?q=hello world&lang=en' },
  'decode-full': { label: 'Decode Full URL', placeholder: 'https://example.com/path?q=hello%20world&lang=en' },
}

const EXAMPLES: Record<Mode, string[]> = {
  'encode-component': ['hello world', 'foo&bar=baz', 'email@example.com', '100% done'],
  'decode-component': ['hello%20world', 'foo%26bar%3Dbaz', 'email%40example.com'],
  'encode-full': ['https://example.com/search?q=hello world&lang=en'],
  'decode-full': ['https://example.com/search?q=hello%20world&lang=en'],
}

const faqs = [
  { question: 'What is the difference between encodeURI and encodeURIComponent?', answer: 'encodeURIComponent encodes ALL special characters including & = ? #. encodeURI preserves URL structure characters so they work as a full URL.' },
  { question: 'When should I encode URL components?', answer: 'Always encode values that you include in query strings or URL path segments. This prevents characters like & and = from being misinterpreted.' },
  { question: 'Is my data sent to a server?', answer: 'No. All encoding and decoding happens locally using the browser\'s built-in encodeURIComponent and decodeURIComponent APIs.' },
]

export function URLEncoderPage() {
  const [mode, setMode] = useState<Mode>('encode-component')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { copied, copy } = useCopyToClipboard()

  function handleConvert(inp?: string) {
    const val = inp ?? input
    setError(null)
    trackToolUsage('url-encoder')

    let result: { result: string; error: string | null }
    if (mode === 'encode-component') result = encodeURLComponent(val)
    else if (mode === 'decode-component') result = decodeURLComponent(val)
    else if (mode === 'encode-full') result = encodeFullURL(val)
    else result = decodeFullURL(val)

    if (result.error) { setOutput(''); setError(result.error); trackToolError('url-encoder') }
    else { setOutput(result.result); trackToolSuccess('url-encoder') }
  }

  function handleSwap() {
    setInput(output); setOutput(''); setError(null)
  }

  function loadExample(ex: string) { setInput(ex); setOutput(''); setError(null); handleConvert(ex) }

  return (
    <ToolLayout tool={tool} faqs={faqs} howItWorks={
      <>
        <p>Choose an encoding mode, enter your text or URL, and click <strong>Convert</strong>.</p>
        <p>Uses browser-native <code className="text-xs bg-muted px-1 rounded">encodeURIComponent</code>, <code className="text-xs bg-muted px-1 rounded">decodeURIComponent</code> and URL APIs.</p>
        <p className="text-xs text-muted-foreground">All processing is client-side.</p>
      </>
    }>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">URL Encoder / Decoder</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-1">
            {(Object.keys(MODE_LABELS) as Mode[]).map((m) => (
              <button key={m} onClick={() => { setMode(m); setInput(''); setOutput(''); setError(null) }}
                className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${mode === m ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:bg-muted'}`}>
                {MODE_LABELS[m].label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Button size="sm" onClick={() => handleConvert()} className="gap-1.5"><Link2 className="h-3.5 w-3.5" />Convert</Button>
            <Button size="sm" variant="outline" onClick={handleSwap} disabled={!output} className="gap-1.5"><ArrowUpDown className="h-3.5 w-3.5" />Swap</Button>
            <Button size="sm" variant="ghost" onClick={() => { setInput(''); setOutput(''); setError(null) }} className="gap-1.5 text-muted-foreground"><Trash2 className="h-3.5 w-3.5" />Clear</Button>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground">Examples:</span>
            {EXAMPLES[mode].map((ex) => (
              <button key={ex} onClick={() => loadExample(ex)} className="text-xs font-mono text-primary hover:underline max-w-[200px] truncate" title={ex}>{ex}</button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2 bg-destructive/10 border border-destructive/30 rounded-lg">
              <XCircle className="h-4 w-4 text-destructive shrink-0" />
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="flex flex-col">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Input</CardTitle></CardHeader>
          <CardContent className="flex-1 p-0">
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(null) }}
              placeholder={MODE_LABELS[mode].placeholder}
              className="w-full h-48 resize-none bg-transparent p-4 font-mono text-xs focus:outline-none text-foreground placeholder:text-muted-foreground"
              spellCheck={false}
            />
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Output</CardTitle>
            {output && (
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => copy(output)}>
                {copied ? <><Check className="h-3 w-3 text-green-500" />Copied</> : <><Copy className="h-3 w-3" />Copy</>}
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <pre className="w-full h-48 overflow-auto p-4 font-mono text-xs text-foreground break-all whitespace-pre-wrap">
              {output || <span className="text-muted-foreground">Output will appear here...</span>}
            </pre>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  )
}
