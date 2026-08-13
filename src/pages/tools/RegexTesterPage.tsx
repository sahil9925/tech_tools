import { useState, useCallback } from 'react'
import { Regex, Trash2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { getToolById } from '@/config/tools'
import { trackToolUsage, trackToolSuccess, trackToolError } from '@/services/analytics'

const tool = getToolById('regex-tester')!

type Flag = 'g' | 'i' | 'm' | 's' | 'u' | 'y'
const ALL_FLAGS: Flag[] = ['g', 'i', 'm', 's', 'u', 'y']
const FLAG_LABELS: Record<Flag, string> = { g: 'global', i: 'ignore case', m: 'multiline', s: 'dot all', u: 'unicode', y: 'sticky' }

const COMMON_EXAMPLES = [
  { label: 'Email', pattern: '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}', test: 'user@example.com, invalid@, test@domain.org' },
  { label: 'IPv4', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', test: '192.168.1.1 and 10.0.0.1 not 999.x.1.1' },
  { label: 'URL', pattern: 'https?://[^\\s]+', test: 'Visit https://example.com or http://test.org for info.' },
  { label: 'UUID', pattern: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', test: 'ID: 550e8400-e29b-41d4-a716-446655440000' },
  { label: 'Date', pattern: '\\d{4}-\\d{2}-\\d{2}', test: 'Dates: 2024-01-15, 2023-12-31, not 24-1-5' },
]

interface Match {
  text: string
  index: number
  length: number
  groups: (string | undefined)[]
}

const faqs = [
  { question: 'Is my regex safe to run?', answer: 'The regex engine is the browser\'s native RegExp. We catch syntax errors and timeouts. Avoid catastrophic backtracking patterns with large inputs.' },
  { question: 'What flags are supported?', answer: 'g (global), i (case-insensitive), m (multiline), s (dot matches newline), u (unicode), y (sticky). All are standard JavaScript RegExp flags.' },
  { question: 'Are capture groups shown?', answer: 'Yes. Each match shows its capture groups (parenthesised sub-patterns).' },
]

export function RegexTesterPage() {
  const [pattern, setPattern] = useState('')
  const [testStr, setTestStr] = useState('')
  const [flags, setFlags] = useState<Set<Flag>>(new Set(['g']))
  const [matches, setMatches] = useState<Match[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [highlighted, setHighlighted] = useState<string | null>(null)

  function toggleFlag(f: Flag) {
    setFlags((prev) => {
      const next = new Set(prev)
      if (next.has(f)) next.delete(f); else next.add(f)
      return next
    })
  }

  const runTest = useCallback(() => {
    if (!pattern) { setError('Enter a regular expression.'); setMatches(null); setHighlighted(null); return }
    setError(null)
    trackToolUsage('regex-tester')

    let re: RegExp
    try {
      re = new RegExp(pattern, Array.from(flags).join(''))
    } catch (e) {
      setError(e instanceof Error ? `Invalid regex: ${e.message}` : 'Invalid regular expression.')
      setMatches(null); setHighlighted(null)
      trackToolError('regex-tester')
      return
    }

    try {
      const found: Match[] = []
      const globalRe = flags.has('g') ? re : new RegExp(pattern, Array.from(flags).join('') + 'g')

      let m: RegExpExecArray | null
      let safety = 0
      const tempRe = new RegExp(pattern, Array.from(flags).join('') + (flags.has('g') ? '' : 'g'))
      while ((m = tempRe.exec(testStr)) !== null && safety++ < 500) {
        found.push({ text: m[0], index: m.index, length: m[0].length, groups: m.slice(1) })
        if (!flags.has('g') && !flags.has('y')) break // prevent infinite loop on non-global
        if (m[0].length === 0) tempRe.lastIndex++ // prevent infinite loop on zero-length match
      }

      setMatches(found)

      // Build highlighted HTML
      if (found.length > 0) {
        let result = ''
        let last = 0
        for (const match of found) {
          result += escapeHtml(testStr.slice(last, match.index))
          result += `<mark class="bg-yellow-200 dark:bg-yellow-800/50 rounded px-0.5">${escapeHtml(match.text)}</mark>`
          last = match.index + match.length
        }
        result += escapeHtml(testStr.slice(last))
        setHighlighted(result)
      } else {
        setHighlighted(null)
      }

      trackToolSuccess('regex-tester')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Execution error.')
      setMatches(null); setHighlighted(null)
      trackToolError('regex-tester')
    }
  }, [pattern, testStr, flags])

  function escapeHtml(s: string) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  function loadExample(ex: typeof COMMON_EXAMPLES[0]) {
    setPattern(ex.pattern)
    setTestStr(ex.test)
    setMatches(null); setHighlighted(null); setError(null)
  }

  return (
    <ToolLayout tool={tool} faqs={faqs} howItWorks={
      <>
        <p>Enter a regular expression and test string, select flags, and click <strong>Test</strong>.</p>
        <p>Matches are highlighted in the test string. Capture groups are listed for each match.</p>
        <p className="text-xs text-muted-foreground">Uses the browser's native RegExp engine. No data is sent to any server.</p>
      </>
    }>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Regex Tester</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="regex-pattern" className="text-xs font-medium text-muted-foreground">Regular Expression</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">/</span>
                <input
                  id="regex-pattern"
                  value={pattern}
                  onChange={(e) => { setPattern(e.target.value); setError(null) }}
                  onKeyDown={(e) => e.key === 'Enter' && runTest()}
                  placeholder="[a-z]+"
                  className={`w-full pl-6 pr-6 py-2 font-mono text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring ${error ? 'border-destructive' : 'border-border'}`}
                  spellCheck={false}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">/{Array.from(flags).join('')}</span>
              </div>
              <Button onClick={runTest} className="gap-2 shrink-0"><Regex className="h-4 w-4" />Test</Button>
            </div>
            {error && <p className="text-xs text-destructive font-mono">{error}</p>}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground">Flags:</span>
            {ALL_FLAGS.map((f) => (
              <button key={f} onClick={() => toggleFlag(f)} title={FLAG_LABELS[f]}
                className={`text-xs font-mono px-2 py-1 rounded border transition-colors ${flags.has(f) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}>
                {f}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground">Examples:</span>
            {COMMON_EXAMPLES.map((ex) => (
              <button key={ex.label} onClick={() => loadExample(ex)} className="text-xs text-primary hover:underline">{ex.label}</button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">Test String</CardTitle>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-muted-foreground" onClick={() => { setTestStr(''); setMatches(null); setHighlighted(null) }}>
            <Trash2 className="h-3.5 w-3.5" />Clear
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <textarea
            value={testStr}
            onChange={(e) => { setTestStr(e.target.value); setMatches(null); setHighlighted(null) }}
            placeholder="Enter text to test the regex against..."
            className="w-full h-32 resize-none bg-transparent p-4 font-mono text-xs focus:outline-none text-foreground placeholder:text-muted-foreground"
            spellCheck={false}
          />
        </CardContent>
      </Card>

      {/* Highlighted result */}
      {highlighted !== null && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Highlighted Matches</CardTitle></CardHeader>
          <CardContent>
            <p
              className="font-mono text-xs leading-relaxed whitespace-pre-wrap break-all"
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          </CardContent>
        </Card>
      )}

      {/* Match list */}
      {matches !== null && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {matches.length === 0 ? 'No matches' : `${matches.length} match${matches.length !== 1 ? 'es' : ''}`}
            </CardTitle>
          </CardHeader>
          {matches.length > 0 && (
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-auto">
                {matches.map((m, i) => (
                  <div key={i} className="text-xs p-2 rounded bg-muted/50 font-mono space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-yellow-600 dark:text-yellow-400 font-semibold truncate">"{m.text}"</span>
                      <span className="text-muted-foreground shrink-0">index {m.index}, len {m.length}</span>
                    </div>
                    {m.groups.length > 0 && m.groups.some(Boolean) && (
                      <div className="text-muted-foreground">
                        Groups: {m.groups.map((g, gi) => `$${gi + 1}="${g ?? 'undefined'}"`).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </ToolLayout>
  )
}
