import { useState } from 'react'
import { CheckSquare, Trash2, Copy, Check, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { validate, format } from '@/utils/json'
import { getToolById } from '@/config/tools'
import { trackToolUsage, trackToolSuccess, trackToolError } from '@/services/analytics'

const tool = getToolById('json-validator')!

const EXAMPLE_VALID = `{
  "name": "Alice",
  "age": 30,
  "roles": ["admin", "user"],
  "address": {
    "city": "London",
    "country": "UK"
  }
}`

const EXAMPLE_INVALID = `{
  "name": "Bob",
  "age": 25,
  "roles": ["user",],
}`

const faqs = [
  { question: 'Is my JSON sent to a server?', answer: 'No. All validation happens in your browser using the native JSON.parse API. Your data never leaves your device.' },
  { question: 'How accurate is the error location?', answer: 'The error position is extracted from the browser\'s SyntaxError message. V8 (Chrome/Node) provides byte positions which we convert to line and column numbers.' },
  { question: 'What counts as valid JSON?', answer: 'Valid JSON follows RFC 8259. Trailing commas, comments, single-quoted strings and undefined values are all invalid JSON.' },
]

export function JSONValidatorPage() {
  const [input, setInput] = useState(EXAMPLE_VALID)
  const [status, setStatus] = useState<'idle' | 'valid' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [formatted, setFormatted] = useState<string | null>(null)
  const { copied, copy } = useCopyToClipboard()

  function handleValidate() {
    trackToolUsage('json-validator')
    const result = validate(input)
    if (result.valid) {
      setStatus('valid')
      setErrorMsg(null)
      trackToolSuccess('json-validator')
    } else {
      setStatus('error')
      const loc = result.errorLine ? ` (line ${result.errorLine}${result.errorColumn ? `, col ${result.errorColumn}` : ''})` : ''
      setErrorMsg((result.error ?? 'Invalid JSON') + loc)
      trackToolError('json-validator')
    }
    setFormatted(null)
  }

  function handleFormat() {
    trackToolUsage('json-validator')
    const result = format(input)
    if (result.success && result.formatted) {
      setInput(result.formatted)
      setFormatted(result.formatted)
      setStatus('valid')
      setErrorMsg(null)
      trackToolSuccess('json-validator')
    } else {
      setStatus('error')
      const loc = result.errorLine ? ` (line ${result.errorLine}${result.errorColumn ? `, col ${result.errorColumn}` : ''})` : ''
      setErrorMsg((result.error ?? 'Invalid JSON') + loc)
      setFormatted(null)
      trackToolError('json-validator')
    }
  }

  function handleClear() { setInput(''); setStatus('idle'); setErrorMsg(null); setFormatted(null) }

  return (
    <ToolLayout tool={tool} faqs={faqs} howItWorks={
      <>
        <p>Paste JSON and click <strong>Validate</strong> to check for syntax errors.</p>
        <p>Click <strong>Format</strong> to also pretty-print the result.</p>
        <p className="text-xs text-muted-foreground">All processing is done locally — your data never leaves the browser.</p>
      </>
    }>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">JSON Validator</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={handleValidate} className="gap-1.5"><CheckSquare className="h-3.5 w-3.5" />Validate</Button>
            <Button size="sm" variant="outline" onClick={handleFormat} className="gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" />Format</Button>
            <Button size="sm" variant="ghost" onClick={() => { setInput(EXAMPLE_VALID); setStatus('idle'); setErrorMsg(null) }}>Valid Example</Button>
            <Button size="sm" variant="ghost" onClick={() => { setInput(EXAMPLE_INVALID); setStatus('idle'); setErrorMsg(null) }}>Invalid Example</Button>
            <Button size="sm" variant="ghost" onClick={handleClear} className="gap-1.5 text-muted-foreground"><Trash2 className="h-3.5 w-3.5" />Clear</Button>
          </div>

          {status === 'valid' && (
            <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">Valid JSON</span>
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-start gap-2 p-2 bg-destructive/10 border border-destructive/30 rounded-lg">
              <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Invalid JSON</p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">Input JSON</CardTitle>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => copy(input)}>
            {copied ? <><Check className="h-3 w-3 text-green-500" />Copied</> : <><Copy className="h-3 w-3" />Copy</>}
          </Button>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setStatus('idle'); setErrorMsg(null) }}
            placeholder='Paste your JSON here...'
            className="w-full h-80 resize-none bg-transparent p-4 font-mono text-xs focus:outline-none text-foreground placeholder:text-muted-foreground"
            spellCheck={false}
          />
        </CardContent>
      </Card>
    </ToolLayout>
  )
}
