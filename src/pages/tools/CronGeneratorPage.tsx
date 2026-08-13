import { useState } from 'react'
import { Clock, RotateCcw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { CopyButton } from '@/components/tools/CopyButton'
import { explainCron } from '@/utils/developer'
import { getToolById } from '@/config/tools'
import { trackToolUsage, trackToolSuccess } from '@/services/analytics'

const tool = getToolById('cron-generator')!

const PRESETS = [
  { label: 'Every minute', expr: '* * * * *' },
  { label: 'Every 5 minutes', expr: '*/5 * * * *' },
  { label: 'Every hour', expr: '0 * * * *' },
  { label: 'Every day midnight', expr: '0 0 * * *' },
  { label: 'Every day 9 AM', expr: '0 9 * * *' },
  { label: 'Weekdays 9 AM', expr: '0 9 * * 1-5' },
  { label: 'Every Monday', expr: '0 0 * * 1' },
  { label: 'First of month', expr: '0 0 1 * *' },
  { label: 'Every Sunday', expr: '0 0 * * 0' },
]

const FIELD_OPTS: { key: 'min' | 'hour' | 'dom' | 'month' | 'dow'; label: string; min: number; max: number; placeholder: string }[] = [
  { key: 'min', label: 'Minute', min: 0, max: 59, placeholder: '0-59, *, */5' },
  { key: 'hour', label: 'Hour', min: 0, max: 23, placeholder: '0-23, *, */2' },
  { key: 'dom', label: 'Day of Month', min: 1, max: 31, placeholder: '1-31, *, */1' },
  { key: 'month', label: 'Month', min: 1, max: 12, placeholder: '1-12, *, */3' },
  { key: 'dow', label: 'Day of Week', min: 0, max: 6, placeholder: '0=Sun, 6=Sat, 1-5' },
]

const faqs = [
  { question: 'What is a cron expression?', answer: 'A cron expression is a string with 5 fields: minute, hour, day of month, month, and day of week. * means "every" and */ means "every Nth".' },
  { question: 'What is the difference between cron and Quartz?', answer: 'Standard Linux cron uses 5 fields. Quartz (Java) uses 6-7 fields with a seconds field. This tool generates standard 5-field Linux/Unix cron.' },
  { question: 'How do I run a job every 15 minutes?', answer: 'Use */15 * * * * — the */ syntax means "every Nth occurrence".' },
]

export function CronGeneratorPage() {
  const [fields, setFields] = useState({ min: '*', hour: '*', dom: '*', month: '*', dow: '*' })

  const expr = `${fields.min} ${fields.hour} ${fields.dom} ${fields.month} ${fields.dow}`
  const explanation = explainCron(expr)

  function loadPreset(e: string) {
    const [min, hour, dom, month, dow] = e.split(' ')
    setFields({ min, hour, dom, month, dow })
    trackToolUsage('cron-generator')
    trackToolSuccess('cron-generator')
  }

  function reset() { setFields({ min: '*', hour: '*', dom: '*', month: '*', dow: '*' }) }

  return (
    <ToolLayout tool={tool} faqs={faqs} howItWorks={
      <>
        <p>Edit each field or click a preset to build your cron expression.</p>
        <p>A human-readable explanation is generated automatically.</p>
        <p className="text-xs font-mono">minute hour day-of-month month day-of-week</p>
      </>
    }>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Cron Expression Builder</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          {/* Presets */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Quick Presets</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button key={p.expr} onClick={() => loadPreset(p.expr)}
                  className="text-xs px-2.5 py-1 rounded border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {FIELD_OPTS.map((f) => (
              <div key={f.key} className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
                <input
                  value={fields[f.key]}
                  onChange={(e) => setFields((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full px-2 py-1.5 text-sm font-mono rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="text-xs text-muted-foreground">{f.min}–{f.max}</p>
              </div>
            ))}
          </div>

          {/* Result */}
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-mono text-lg font-semibold text-primary">{expr}</span>
              </div>
              <div className="flex gap-2">
                <CopyButton value={expr} size="sm" />
                <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5 h-7 px-2 text-xs text-muted-foreground">
                  <RotateCcw className="h-3.5 w-3.5" />Reset
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{explanation}</p>
          </div>

          {/* Reference */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Field Reference</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono">
              {FIELD_OPTS.map((f) => (
                <div key={f.key} className="space-y-0.5">
                  <p className="font-semibold text-foreground">{f.label}</p>
                  <p>* = any</p>
                  <p>*/N = every N</p>
                  <p>a-b = range</p>
                  <p>a,b = list</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  )
}
