import { useState } from 'react'
import { Code, Copy, Check, Download, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { formatXML, minifyXML, validateXML } from '@/utils/xml'
import { getToolById } from '@/config/tools'
import { trackToolUsage, trackToolSuccess, trackToolError } from '@/services/analytics'

const tool = getToolById('xml-formatter')!

const EXAMPLE = `<?xml version="1.0" encoding="UTF-8"?><users><user id="1"><name>Alice</name><email>alice@example.com</email><roles><role>admin</role><role>user</role></roles></user><user id="2"><name>Bob</name><email>bob@example.com</email></user></users>`

const faqs = [
  { question: 'Is my XML sent to a server?', answer: 'No. All formatting uses the browser\'s native DOMParser API. Your XML never leaves your device.' },
  { question: 'Is XML execution safe?', answer: 'Yes. XML is treated as data only. External entity resolution is not enabled. No code is executed.' },
  { question: 'What indentation options are available?', answer: '2 spaces (default), 4 spaces, or a tab character.' },
]

const INDENT_OPTIONS = [
  { label: '2 Spaces', value: '  ' },
  { label: '4 Spaces', value: '    ' },
  { label: 'Tab', value: '\t' },
]

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: 'application/xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export function XMLFormatterPage() {
  const [input, setInput] = useState(EXAMPLE)
  const [output, setOutput] = useState('')
  const [indent, setIndent] = useState('  ')
  const [error, setError] = useState<string | null>(null)
  const [validMsg, setValidMsg] = useState<string | null>(null)
  const { copied, copy } = useCopyToClipboard()

  function handleFormat() {
    trackToolUsage('xml-formatter')
    const result = formatXML(input, indent)
    if (result.success && result.output) {
      setOutput(result.output); setError(null); setValidMsg(null)
      trackToolSuccess('xml-formatter')
    } else {
      setOutput(''); setError(result.error); setValidMsg(null)
      trackToolError('xml-formatter')
    }
  }

  function handleMinify() {
    trackToolUsage('xml-formatter')
    const result = minifyXML(input)
    if (result.success && result.output) {
      setOutput(result.output); setError(null); setValidMsg(null)
      trackToolSuccess('xml-formatter')
    } else {
      setOutput(''); setError(result.error); setValidMsg(null)
      trackToolError('xml-formatter')
    }
  }

  function handleValidate() {
    const result = validateXML(input)
    if (result.valid) { setValidMsg('Valid XML'); setError(null) }
    else { setError(result.error); setValidMsg(null) }
  }

  return (
    <ToolLayout tool={tool} faqs={faqs} howItWorks={
      <>
        <p>Paste XML and choose <strong>Format</strong> to pretty-print or <strong>Minify</strong> to compress.</p>
        <p>XML is parsed using the browser's native DOMParser — no server communication needed.</p>
      </>
    }>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">XML Formatter</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 items-center">
            <Button size="sm" onClick={handleFormat} className="gap-1.5"><Code className="h-3.5 w-3.5" />Format</Button>
            <Button size="sm" variant="outline" onClick={handleMinify}>Minify</Button>
            <Button size="sm" variant="outline" onClick={handleValidate}><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Validate</Button>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Indent:</span>
              {INDENT_OPTIONS.map((o) => (
                <button key={o.label} onClick={() => setIndent(o.value)}
                  className={`text-xs px-2 py-1 rounded border transition-colors ${indent === o.value ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}>
                  {o.label}
                </button>
              ))}
            </div>
            <Button size="sm" variant="ghost" onClick={() => { setInput(''); setOutput(''); setError(null); setValidMsg(null) }} className="gap-1.5 text-muted-foreground"><Trash2 className="h-3.5 w-3.5" />Clear</Button>
          </div>
          {validMsg && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">{validMsg}</span>
            </div>
          )}
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
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Input XML</CardTitle></CardHeader>
          <CardContent className="flex-1 p-0">
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(null); setValidMsg(null) }}
              placeholder="Paste your XML here..."
              className="w-full h-72 resize-none bg-transparent p-4 font-mono text-xs focus:outline-none text-foreground placeholder:text-muted-foreground"
              spellCheck={false}
            />
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Output</CardTitle>
            {output && (
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => copy(output)}>
                  {copied ? <><Check className="h-3 w-3 text-green-500" />Copied</> : <><Copy className="h-3 w-3" />Copy</>}
                </Button>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => downloadText(output, 'output.xml')}>
                  <Download className="h-3 w-3" />Download
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <pre className="w-full h-72 overflow-auto p-4 font-mono text-xs text-foreground">
              {output || <span className="text-muted-foreground">Formatted output will appear here...</span>}
            </pre>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  )
}
