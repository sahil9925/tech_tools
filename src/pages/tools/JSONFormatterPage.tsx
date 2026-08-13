import { useState } from 'react'
import { Copy, Check, Minimize2, Maximize2, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { format, validate, minify } from '@/utils/json'
import { getToolById } from '@/config/tools'
import { trackToolUsage, trackToolSuccess, trackToolError } from '@/services/analytics'

const tool = getToolById('json-formatter')!

const EXAMPLE_JSON = `{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 32,
  "roles": ["admin", "user"],
  "address": {
    "city": "New York",
    "country": "US"
  }
}`

const faqs = [
  { question: 'What is JSON?', answer: 'JSON (JavaScript Object Notation) is a lightweight data interchange format that is easy for humans to read and write, and easy for machines to parse and generate.' },
  { question: 'Is my data sent to any server?', answer: 'No. JSON formatting, validation, and minification all happen entirely in your browser. Your data never leaves your device.' },
  { question: 'What is JSON minification?', answer: 'Minification removes all unnecessary whitespace and newlines from JSON, reducing file size. This is useful for APIs and production environments where every byte counts.' },
  { question: 'What does the error position mean?', answer: 'When JSON is invalid, the error message includes the character position where the parser failed. This helps you quickly find and fix syntax errors.' },
]

export function JSONFormatterPage() {
  const [input, setInput] = useState(EXAMPLE_JSON)
  const [output, setOutput] = useState('')
  const [status, setStatus] = useState<'idle' | 'valid' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [stats, setStats] = useState<{ originalSize: number; outputSize: number; savings: number } | null>(null)
  const { copied: copiedInput, copy: copyInput } = useCopyToClipboard()
  const { copied: copiedOutput, copy: copyOutput } = useCopyToClipboard()

  function handleFormat() {
    trackToolUsage('json-formatter')
    const result = format(input)
    if (result.success && result.formatted) {
      setOutput(result.formatted)
      setStatus('valid')
      setErrorMsg(null)
      trackToolSuccess('json-formatter')
    } else {
      setOutput('')
      setStatus('error')
      const loc = result.errorLine ? ` (line ${result.errorLine}${result.errorColumn ? `, col ${result.errorColumn}` : ''})` : ''
      setErrorMsg((result.error ?? 'Invalid JSON') + loc)
      trackToolError('json-formatter')
    }
    setStats(null)
  }

  function handleValidate() {
    const result = validate(input)
    if (result.valid) {
      setStatus('valid')
      setErrorMsg(null)
      setOutput('✓ Valid JSON')
    } else {
      setStatus('error')
      const loc = result.errorLine ? ` (line ${result.errorLine}${result.errorColumn ? `, col ${result.errorColumn}` : ''})` : ''
      setErrorMsg((result.error ?? 'Invalid JSON') + loc)
      setOutput('')
    }
    setStats(null)
  }

  function handleMinify() {
    trackToolUsage('json-formatter')
    const result = minify(input)
    if (result.success && result.minified) {
      setOutput(result.minified)
      setStatus('valid')
      setErrorMsg(null)
      setStats({ originalSize: result.originalSize, outputSize: result.minifiedSize, savings: result.savings })
      trackToolSuccess('json-formatter')
    } else {
      setOutput('')
      setStatus('error')
      setErrorMsg(result.error ?? 'Invalid JSON')
      trackToolError('json-formatter')
    }
  }

  function handleClear() {
    setInput('')
    setOutput('')
    setStatus('idle')
    setErrorMsg(null)
    setStats(null)
  }

  return (
    <ToolLayout tool={tool} faqs={faqs} howItWorks={
      <>
        <p>All formatting, validation, and minification happens instantly in your browser.</p>
        <ul className="list-disc list-inside text-xs space-y-1 text-muted-foreground">
          <li><strong>Format</strong> — Pretty-prints with 2-space indentation</li>
          <li><strong>Validate</strong> — Checks JSON syntax with error location</li>
          <li><strong>Minify</strong> — Removes all whitespace</li>
        </ul>
        <p className="text-xs">Your data never leaves your device.</p>
      </>
    }>
      {/* Action bar */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">JSON Formatter & Validator</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={handleFormat} className="gap-1.5">
              <Maximize2 className="h-3.5 w-3.5" />Format
            </Button>
            <Button size="sm" variant="outline" onClick={handleValidate} className="gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />Validate
            </Button>
            <Button size="sm" variant="outline" onClick={handleMinify} className="gap-1.5">
              <Minimize2 className="h-3.5 w-3.5" />Minify
            </Button>
            <Button size="sm" variant="ghost" onClick={handleClear} className="gap-1.5 text-muted-foreground">
              <Trash2 className="h-3.5 w-3.5" />Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Editor panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Input JSON</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1"
              onClick={() => copyInput(input)}
            >
              {copiedInput ? <><Check className="h-3 w-3 text-green-500" />Copied</> : <><Copy className="h-3 w-3" />Copy</>}
            </Button>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setStatus('idle'); setErrorMsg(null) }}
              placeholder='Paste your JSON here...'
              className="w-full h-72 resize-none bg-transparent p-4 font-mono text-xs focus:outline-none text-foreground placeholder:text-muted-foreground"
              spellCheck={false}
            />
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Output</CardTitle>
            {output && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1"
                onClick={() => copyOutput(output)}
              >
                {copiedOutput ? <><Check className="h-3 w-3 text-green-500" />Copied</> : <><Copy className="h-3 w-3" />Copy</>}
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-1 p-0">
            {status === 'error' ? (
              <div className="p-4 h-72 flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-destructive">Invalid JSON</p>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">{errorMsg}</p>
                  </div>
                </div>
              </div>
            ) : status === 'valid' && !output ? (
              <div className="p-4 h-72 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">Valid JSON</p>
              </div>
            ) : (
              <pre className="w-full h-72 overflow-auto p-4 font-mono text-xs text-foreground">
                {output || <span className="text-muted-foreground">Output will appear here...</span>}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      {stats && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
          <span>Original: <strong>{stats.originalSize} bytes</strong></span>
          <span>Minified: <strong>{stats.outputSize} bytes</strong></span>
          <span className="text-green-600 dark:text-green-400">Saved: <strong>{stats.savings}%</strong></span>
        </div>
      )}
    </ToolLayout>
  )
}
