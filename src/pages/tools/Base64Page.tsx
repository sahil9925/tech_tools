import { useState } from 'react'
import { Binary, ArrowUpDown, Trash2, Copy, Check, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { encodeBase64, decodeBase64 } from '@/utils/security'
import { getToolById } from '@/config/tools'
import { trackToolUsage, trackToolSuccess, trackToolError } from '@/services/analytics'

const tool = getToolById('base64')!

const EXAMPLES_ENCODE = ['Hello, World!', 'DevOps Tools 🚀', 'नमस्ते', '你好世界', 'سلام']
const EXAMPLES_DECODE = ['SGVsbG8sIFdvcmxkIQ==', 'RGV2T3BzIFRvb2xzIPCfmoA=', '4KSo4KSu4KS44KSk4KSo']

const faqs = [
  { question: 'Is Base64 encryption?', answer: 'No. Base64 is an encoding scheme, not encryption. It only changes the representation of data. Anyone can decode Base64.' },
  { question: 'Why does Unicode need special handling?', answer: 'The browser\'s btoa() function only handles Latin-1 characters. We use TextEncoder to convert Unicode to UTF-8 bytes first before encoding.' },
  { question: 'Is my data sent to a server?', answer: 'No. All encoding and decoding happens entirely in your browser.' },
]

export function Base64Page() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { copied, copy } = useCopyToClipboard()

  function handleConvert(inp?: string) {
    const val = inp ?? input
    setError(null)
    trackToolUsage('base64')
    if (mode === 'encode') {
      const result = encodeBase64(val)
      if (result.error) { setOutput(''); setError(result.error); trackToolError('base64') }
      else { setOutput(result.result); trackToolSuccess('base64') }
    } else {
      const result = decodeBase64(val)
      if (result.error) { setOutput(''); setError(result.error); trackToolError('base64') }
      else { setOutput(result.result); trackToolSuccess('base64') }
    }
  }

  function handleSwap() {
    const newMode = mode === 'encode' ? 'decode' : 'encode'
    setMode(newMode)
    setInput(output)
    setOutput('')
    setError(null)
  }

  function loadExample(ex: string) {
    setInput(ex); setOutput(''); setError(null)
    handleConvert(ex)
  }

  return (
    <ToolLayout tool={tool} faqs={faqs} howItWorks={
      <>
        <p>Uses <code className="text-xs bg-muted px-1 rounded">TextEncoder</code> + <code className="text-xs bg-muted px-1 rounded">btoa()</code> for encoding and <code className="text-xs bg-muted px-1 rounded">atob()</code> + <code className="text-xs bg-muted px-1 rounded">TextDecoder</code> for decoding.</p>
        <p>Fully supports Unicode, emoji, and multilingual characters.</p>
        <p className="text-xs text-muted-foreground">All processing is client-side.</p>
      </>
    }>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Base64 Encoder / Decoder</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button onClick={() => { setMode('encode'); setInput(''); setOutput(''); setError(null) }}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${mode === 'encode' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}>
                Encode
              </button>
              <button onClick={() => { setMode('decode'); setInput(''); setOutput(''); setError(null) }}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${mode === 'decode' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}>
                Decode
              </button>
            </div>
            <Button size="sm" onClick={() => handleConvert()} className="gap-1.5">
              <Binary className="h-3.5 w-3.5" />{mode === 'encode' ? 'Encode' : 'Decode'}
            </Button>
            <Button size="sm" variant="outline" onClick={handleSwap} className="gap-1.5" disabled={!output}>
              <ArrowUpDown className="h-3.5 w-3.5" />Swap
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setInput(''); setOutput(''); setError(null) }} className="gap-1.5 text-muted-foreground">
              <Trash2 className="h-3.5 w-3.5" />Clear
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground">Examples:</span>
            {(mode === 'encode' ? EXAMPLES_ENCODE : EXAMPLES_DECODE).map((ex) => (
              <button key={ex} onClick={() => loadExample(ex)} className="text-xs font-mono text-primary hover:underline truncate max-w-[120px]" title={ex}>{ex}</button>
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
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{mode === 'encode' ? 'Plain Text Input' : 'Base64 Input'}</CardTitle></CardHeader>
          <CardContent className="flex-1 p-0">
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(null) }}
              onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleConvert() }}
              placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
              className="w-full h-48 resize-none bg-transparent p-4 font-mono text-xs focus:outline-none text-foreground placeholder:text-muted-foreground"
              spellCheck={false}
            />
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">{mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}</CardTitle>
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
