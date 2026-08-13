import { useState } from 'react'
import { ArrowLeftRight, Copy, Check, Download, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { jsonToYAML, yamlToJSON } from '@/utils/yaml'
import { getToolById } from '@/config/tools'
import { trackToolUsage, trackToolSuccess, trackToolError } from '@/services/analytics'

const tool = getToolById('json-yaml')!

const EXAMPLE_JSON = `{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0"
  },
  "scripts": ["build", "test", "lint"]
}`

const EXAMPLE_YAML = `name: my-app
version: 1.0.0
dependencies:
  react: "^18.0.0"
scripts:
  - build
  - test
  - lint`

const faqs = [
  { question: 'Is my data sent to a server?', answer: 'No. All conversion happens in your browser. Your data never leaves your device.' },
  { question: 'What YAML features are supported?', answer: 'Key-value pairs, nested objects, arrays, strings, numbers, booleans, null, and multiline strings are all supported.' },
  { question: 'Are YAML anchors/aliases supported?', answer: 'Basic YAML is supported. Advanced features like anchors, aliases and complex merge keys may not be fully handled by the built-in parser.' },
]

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export function JSONYAMLPage() {
  const [mode, setMode] = useState<'json-to-yaml' | 'yaml-to-json'>('json-to-yaml')
  const [input, setInput] = useState(EXAMPLE_JSON)
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { copied, copy } = useCopyToClipboard()

  function handleConvert() {
    trackToolUsage('json-yaml')
    if (mode === 'json-to-yaml') {
      const result = jsonToYAML(input)
      if (result.yaml) { setOutput(result.yaml); setError(null); trackToolSuccess('json-yaml') }
      else { setOutput(''); setError(result.error); trackToolError('json-yaml') }
    } else {
      const result = yamlToJSON(input)
      if (result.json) { setOutput(result.json); setError(null); trackToolSuccess('json-yaml') }
      else { setOutput(''); setError(result.error); trackToolError('json-yaml') }
    }
  }

  function switchMode() {
    setMode((m) => m === 'json-to-yaml' ? 'yaml-to-json' : 'json-to-yaml')
    setInput(mode === 'json-to-yaml' ? EXAMPLE_YAML : EXAMPLE_JSON)
    setOutput(''); setError(null)
  }

  const outputFilename = mode === 'json-to-yaml' ? 'output.yaml' : 'output.json'

  return (
    <ToolLayout tool={tool} faqs={faqs} howItWorks={
      <>
        <p>Choose a direction, paste your data, and click <strong>Convert</strong>.</p>
        <p className="text-xs text-muted-foreground">All conversion is client-side — nothing is sent to any server.</p>
      </>
    }>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">JSON ↔ YAML Converter</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button onClick={() => { setMode('json-to-yaml'); setInput(EXAMPLE_JSON); setOutput(''); setError(null) }}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${mode === 'json-to-yaml' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}>
                JSON → YAML
              </button>
              <button onClick={() => { setMode('yaml-to-json'); setInput(EXAMPLE_YAML); setOutput(''); setError(null) }}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${mode === 'yaml-to-json' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}>
                YAML → JSON
              </button>
            </div>
            <Button size="sm" onClick={handleConvert} className="gap-1.5"><ArrowLeftRight className="h-3.5 w-3.5" />Convert</Button>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">{mode === 'json-to-yaml' ? 'Input JSON' : 'Input YAML'}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(null) }}
              className="w-full h-72 resize-none bg-transparent p-4 font-mono text-xs focus:outline-none text-foreground placeholder:text-muted-foreground"
              placeholder={mode === 'json-to-yaml' ? 'Paste JSON here...' : 'Paste YAML here...'}
              spellCheck={false}
            />
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">{mode === 'json-to-yaml' ? 'Output YAML' : 'Output JSON'}</CardTitle>
            {output && (
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => copy(output)}>
                  {copied ? <><Check className="h-3 w-3 text-green-500" />Copied</> : <><Copy className="h-3 w-3" />Copy</>}
                </Button>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => downloadText(output, outputFilename)}>
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
