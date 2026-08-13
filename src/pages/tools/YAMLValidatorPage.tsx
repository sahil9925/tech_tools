import { useState } from 'react'
import { FileCode, Copy, Check, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { parseYAML, yamlToJSON } from '@/utils/yaml'
import { getToolById } from '@/config/tools'
import { trackToolUsage, trackToolSuccess, trackToolError } from '@/services/analytics'

const tool = getToolById('yaml-validator')!

const EXAMPLE_VALID = `# Kubernetes deployment example
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  namespace: default
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: my-app
          image: nginx:latest
          ports:
            - containerPort: 80`

const EXAMPLE_INVALID = `name: my-app
version: [broken
  missing: bracket`

const faqs = [
  { question: 'Is my YAML sent to a server?', answer: 'No. All validation happens locally in your browser.' },
  { question: 'What YAML features are supported?', answer: 'Key-value pairs, nested objects, arrays, strings, numbers, booleans, null, comments, and block scalars are supported.' },
  { question: 'Why validate YAML?', answer: 'YAML is whitespace-sensitive and easy to write incorrectly. Missing colons, wrong indentation or syntax errors can cause silent failures in tools like Kubernetes and Docker.' },
]

export function YAMLValidatorPage() {
  const [input, setInput] = useState(EXAMPLE_VALID)
  const [status, setStatus] = useState<'idle' | 'valid' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [jsonPreview, setJsonPreview] = useState<string | null>(null)
  const { copied, copy } = useCopyToClipboard()

  function handleValidate() {
    trackToolUsage('yaml-validator')
    const result = parseYAML(input)
    if (result.success) {
      setStatus('valid')
      setErrorMsg(null)
      setJsonPreview(JSON.stringify(result.value, null, 2))
      trackToolSuccess('yaml-validator')
    } else {
      setStatus('error')
      setErrorMsg(result.error)
      setJsonPreview(null)
      trackToolError('yaml-validator')
    }
  }

  function handleClear() { setInput(''); setStatus('idle'); setErrorMsg(null); setJsonPreview(null) }

  return (
    <ToolLayout tool={tool} faqs={faqs} howItWorks={
      <>
        <p>Paste YAML and click <strong>Validate</strong> to check for syntax errors.</p>
        <p>If valid, a JSON preview of the parsed structure is shown.</p>
        <p className="text-xs text-muted-foreground">All validation is client-side — your data never leaves the browser.</p>
      </>
    }>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">YAML Validator</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={handleValidate} className="gap-1.5"><FileCode className="h-3.5 w-3.5" />Validate</Button>
            <Button size="sm" variant="ghost" onClick={() => { setInput(EXAMPLE_VALID); setStatus('idle'); setErrorMsg(null); setJsonPreview(null) }}>Valid Example</Button>
            <Button size="sm" variant="ghost" onClick={() => { setInput(EXAMPLE_INVALID); setStatus('idle'); setErrorMsg(null); setJsonPreview(null) }}>Invalid Example</Button>
            <Button size="sm" variant="ghost" onClick={handleClear} className="gap-1.5 text-muted-foreground"><Trash2 className="h-3.5 w-3.5" />Clear</Button>
          </div>
          {status === 'valid' && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">Valid YAML</span>
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-start gap-2 mt-2 p-2 bg-destructive/10 border border-destructive/30 rounded-lg">
              <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Invalid YAML</p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="flex flex-col">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Input YAML</CardTitle></CardHeader>
          <CardContent className="flex-1 p-0">
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setStatus('idle'); setErrorMsg(null) }}
              placeholder="Paste your YAML here..."
              className="w-full h-80 resize-none bg-transparent p-4 font-mono text-xs focus:outline-none text-foreground placeholder:text-muted-foreground"
              spellCheck={false}
            />
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">JSON Preview</CardTitle>
            {jsonPreview && (
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => copy(jsonPreview)}>
                {copied ? <><Check className="h-3 w-3 text-green-500" />Copied</> : <><Copy className="h-3 w-3" />Copy</>}
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <pre className="w-full h-80 overflow-auto p-4 font-mono text-xs text-foreground">
              {jsonPreview || <span className="text-muted-foreground">JSON representation of valid YAML will appear here...</span>}
            </pre>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  )
}
