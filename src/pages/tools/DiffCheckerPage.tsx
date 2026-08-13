import { useState } from 'react'
import { GitCompare, Trash2, ArrowUpDown, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { computeDiff } from '@/utils/developer'
import { getToolById } from '@/config/tools'
import { trackToolUsage, trackToolSuccess } from '@/services/analytics'

const tool = getToolById('diff-checker')!

const EXAMPLE_ORIGINAL = `The quick brown fox
jumps over the lazy dog.
This line is unchanged.
This line will be removed.
Another unchanged line.`

const EXAMPLE_MODIFIED = `The quick brown fox
jumps over the lazy cat.
This line is unchanged.
This line was added instead.
Another unchanged line.`

const faqs = [
  { question: 'Is my text sent to a server?', answer: 'No. The diff algorithm runs entirely in your browser. Your text never leaves your device.' },
  { question: 'What diff algorithm is used?', answer: 'The tool uses a Myers LCS-based diff algorithm which is the same approach used by tools like git diff.' },
  { question: 'What does "ignore whitespace" do?', answer: 'When enabled, leading/trailing whitespace is trimmed and multiple spaces are collapsed before comparison. This is useful for comparing code with different indentation.' },
]

type ViewMode = 'side-by-side' | 'unified'

function downloadText(content: string) {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'diff.txt'; a.click()
  URL.revokeObjectURL(url)
}

export function DiffCheckerPage() {
  const [original, setOriginal] = useState(EXAMPLE_ORIGINAL)
  const [modified, setModified] = useState(EXAMPLE_MODIFIED)
  const [result, setResult] = useState<ReturnType<typeof computeDiff> | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('side-by-side')
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false)
  const [ignoreCase, setIgnoreCase] = useState(false)
  const { copied, copy } = useCopyToClipboard()

  function handleCompare() {
    trackToolUsage('diff-checker')
    setResult(computeDiff(original, modified, { ignoreWhitespace, ignoreCase }))
    trackToolSuccess('diff-checker')
  }

  function buildUnifiedDiff(): string {
    if (!result) return ''
    return result.lines.map((l) => {
      if (l.type === 'added') return `+ ${l.content}`
      if (l.type === 'removed') return `- ${l.content}`
      return `  ${l.content}`
    }).join('\n')
  }

  return (
    <ToolLayout tool={tool} faqs={faqs} howItWorks={
      <>
        <p>Paste original text on the left and modified text on the right, then click <strong>Compare</strong>.</p>
        <p>Added lines are shown in green, removed lines in red, unchanged lines in grey.</p>
        <p className="text-xs text-muted-foreground">Diff calculation is done entirely in the browser.</p>
      </>
    }>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Diff Checker</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 items-center">
            <Button onClick={handleCompare} className="gap-2"><GitCompare className="h-4 w-4" />Compare</Button>
            <Button variant="outline" size="sm" onClick={() => { setOriginal(modified); setModified(original); setResult(null) }} className="gap-1.5">
              <ArrowUpDown className="h-3.5 w-3.5" />Swap
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setOriginal(''); setModified(''); setResult(null) }} className="gap-1.5 text-muted-foreground">
              <Trash2 className="h-3.5 w-3.5" />Clear
            </Button>
            <div className="flex items-center gap-3 ml-2">
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input type="checkbox" checked={ignoreWhitespace} onChange={(e) => setIgnoreWhitespace(e.target.checked)} className="rounded" />
                Ignore whitespace
              </label>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input type="checkbox" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} className="rounded" />
                Ignore case
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="flex flex-col">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Original Text</CardTitle></CardHeader>
          <CardContent className="p-0">
            <textarea value={original} onChange={(e) => { setOriginal(e.target.value); setResult(null) }}
              placeholder="Paste original text here..."
              className="w-full h-48 resize-none bg-transparent p-4 font-mono text-xs focus:outline-none text-foreground placeholder:text-muted-foreground"
              spellCheck={false} />
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Modified Text</CardTitle></CardHeader>
          <CardContent className="p-0">
            <textarea value={modified} onChange={(e) => { setModified(e.target.value); setResult(null) }}
              placeholder="Paste modified text here..."
              className="w-full h-48 resize-none bg-transparent p-4 font-mono text-xs focus:outline-none text-foreground placeholder:text-muted-foreground"
              spellCheck={false} />
          </CardContent>
        </Card>
      </div>

      {result && (
        <>
          {/* Stats */}
          <div className="flex flex-wrap gap-4 text-xs p-3 bg-muted/50 rounded-lg">
            <span className="text-green-600 dark:text-green-400">+{result.stats.added} added</span>
            <span className="text-red-600 dark:text-red-400">−{result.stats.removed} removed</span>
            <span className="text-muted-foreground">{result.stats.unchanged} unchanged</span>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border overflow-hidden">
              {(['side-by-side', 'unified'] as ViewMode[]).map((m) => (
                <button key={m} onClick={() => setViewMode(m)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors capitalize ${viewMode === m ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}>
                  {m.replace('-', ' ')}
                </button>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => copy(buildUnifiedDiff())}>
              {copied ? <><Check className="h-3 w-3 text-green-500" />Copied</> : <><Copy className="h-3 w-3" />Copy diff</>}
            </Button>
          </div>

          {viewMode === 'unified' && (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-auto max-h-96 font-mono text-xs">
                  {result.lines.map((line, i) => (
                    <div key={i} className={`flex px-4 py-0.5 ${line.type === 'added' ? 'bg-green-50 dark:bg-green-950/20' : line.type === 'removed' ? 'bg-red-50 dark:bg-red-950/20' : ''}`}>
                      <span className="w-8 shrink-0 text-muted-foreground select-none">
                        {line.type === 'added' ? '+' : line.type === 'removed' ? '−' : ' '}
                      </span>
                      <span className={line.type === 'added' ? 'text-green-700 dark:text-green-400' : line.type === 'removed' ? 'text-red-700 dark:text-red-400' : 'text-foreground'}>
                        {line.content}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {viewMode === 'side-by-side' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Original</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-auto max-h-96 font-mono text-xs">
                    {result.lines.filter((l) => l.type !== 'added').map((line, i) => (
                      <div key={i} className={`flex px-4 py-0.5 ${line.type === 'removed' ? 'bg-red-50 dark:bg-red-950/20' : ''}`}>
                        <span className="w-8 shrink-0 text-muted-foreground select-none text-right mr-2">{line.leftLineNo}</span>
                        <span className={line.type === 'removed' ? 'text-red-700 dark:text-red-400' : 'text-foreground'}>{line.content}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Modified</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-auto max-h-96 font-mono text-xs">
                    {result.lines.filter((l) => l.type !== 'removed').map((line, i) => (
                      <div key={i} className={`flex px-4 py-0.5 ${line.type === 'added' ? 'bg-green-50 dark:bg-green-950/20' : ''}`}>
                        <span className="w-8 shrink-0 text-muted-foreground select-none text-right mr-2">{line.rightLineNo}</span>
                        <span className={line.type === 'added' ? 'text-green-700 dark:text-green-400' : 'text-foreground'}>{line.content}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </ToolLayout>
  )
}
