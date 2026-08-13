import { useState } from 'react'
import { Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { CopyButton } from '@/components/tools/CopyButton'
import { permissionsToNumeric, permissionsToSymbolic, numericToPermissions, type ChmodPermissions } from '@/utils/developer'
import { getToolById } from '@/config/tools'
import { trackToolUsage } from '@/services/analytics'

const tool = getToolById('chmod-calculator')!

const DEFAULT_PERMS: ChmodPermissions = {
  ownerRead: true, ownerWrite: true, ownerExecute: true,
  groupRead: true, groupWrite: false, groupExecute: true,
  othersRead: true, othersWrite: false, othersExecute: true,
  suid: false, sgid: false, sticky: false,
}

const PRESETS = [
  { label: '755', perms: { ownerRead: true, ownerWrite: true, ownerExecute: true, groupRead: true, groupWrite: false, groupExecute: true, othersRead: true, othersWrite: false, othersExecute: true, suid: false, sgid: false, sticky: false } },
  { label: '644', perms: { ownerRead: true, ownerWrite: true, ownerExecute: false, groupRead: true, groupWrite: false, groupExecute: false, othersRead: true, othersWrite: false, othersExecute: false, suid: false, sgid: false, sticky: false } },
  { label: '600', perms: { ownerRead: true, ownerWrite: true, ownerExecute: false, groupRead: false, groupWrite: false, groupExecute: false, othersRead: false, othersWrite: false, othersExecute: false, suid: false, sgid: false, sticky: false } },
  { label: '700', perms: { ownerRead: true, ownerWrite: true, ownerExecute: true, groupRead: false, groupWrite: false, groupExecute: false, othersRead: false, othersWrite: false, othersExecute: false, suid: false, sgid: false, sticky: false } },
  { label: '777', perms: { ownerRead: true, ownerWrite: true, ownerExecute: true, groupRead: true, groupWrite: true, groupExecute: true, othersRead: true, othersWrite: true, othersExecute: true, suid: false, sgid: false, sticky: false } },
]

const faqs = [
  { question: 'What do the three groups mean?', answer: 'Owner = the file\'s owner user. Group = members of the file\'s group. Others = everyone else.' },
  { question: 'What is SUID?', answer: 'SUID (Set User ID) makes the file execute with the owner\'s privileges instead of the caller\'s. Used for programs like sudo.' },
  { question: 'What is the sticky bit?', answer: 'The sticky bit on a directory prevents users from deleting files they don\'t own. Commonly used on /tmp.' },
]

interface PermGroupProps {
  label: string
  read: boolean; write: boolean; execute: boolean
  onRead: (v: boolean) => void; onWrite: (v: boolean) => void; onExecute: (v: boolean) => void
}
function PermGroup({ label, read, write, execute, onRead, onWrite, onExecute }: PermGroupProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">{label}</p>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Read', value: read, onChange: onRead },
          { label: 'Write', value: write, onChange: onWrite },
          { label: 'Execute', value: execute, onChange: onExecute },
        ].map(({ label: pl, value, onChange }) => (
          <label key={pl} className="flex flex-col items-center gap-1 cursor-pointer group">
            <button
              role="checkbox"
              aria-checked={value}
              onClick={() => { onChange(!value) }}
              className={`w-10 h-10 rounded-lg border-2 transition-all font-mono text-xs font-bold ${value ? 'bg-primary border-primary text-primary-foreground' : 'bg-muted border-border text-muted-foreground hover:border-primary/50'}`}
            >
              {pl[0]}
            </button>
            <span className="text-xs text-muted-foreground">{pl}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

export function ChmodCalculatorPage() {
  const [perms, setPerms] = useState<ChmodPermissions>(DEFAULT_PERMS)
  const [octalInput, setOctalInput] = useState('')
  const [octalError, setOctalError] = useState<string | null>(null)

  const numeric = permissionsToNumeric(perms)
  const symbolic = permissionsToSymbolic(perms)
  const command = `chmod ${numeric} filename`

  function update(key: keyof ChmodPermissions, value: boolean) {
    setPerms((p) => ({ ...p, [key]: value }))
    trackToolUsage('chmod-calculator')
  }

  function loadFromOctal(val: string) {
    setOctalInput(val)
    const p = numericToPermissions(val)
    if (p) { setPerms(p); setOctalError(null) }
    else if (val.length >= 3) setOctalError('Invalid octal value.')
  }

  return (
    <ToolLayout tool={tool} faqs={faqs} howItWorks={
      <>
        <p>Toggle permissions for Owner, Group, and Others to calculate the chmod value.</p>
        <p>Or enter an octal value (e.g. <code className="text-xs bg-muted px-1 rounded">755</code>) to load permissions.</p>
      </>
    }>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Linux chmod Calculator</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          {/* Preset buttons */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground">Presets:</span>
            {PRESETS.map((p) => (
              <button key={p.label} onClick={() => { setPerms(p.perms as ChmodPermissions); setOctalInput('') }}
                className="text-xs font-mono px-2.5 py-1 rounded border border-border hover:bg-muted transition-colors">
                {p.label}
              </button>
            ))}
          </div>

          {/* Octal input */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground shrink-0">Or enter octal:</span>
            <input
              value={octalInput}
              onChange={(e) => loadFromOctal(e.target.value)}
              placeholder="755"
              maxLength={4}
              className="w-20 px-2 py-1.5 font-mono text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {octalError && <span className="text-xs text-destructive">{octalError}</span>}
          </div>

          {/* Permission checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <PermGroup label="Owner" read={perms.ownerRead} write={perms.ownerWrite} execute={perms.ownerExecute}
              onRead={(v) => update('ownerRead', v)} onWrite={(v) => update('ownerWrite', v)} onExecute={(v) => update('ownerExecute', v)} />
            <PermGroup label="Group" read={perms.groupRead} write={perms.groupWrite} execute={perms.groupExecute}
              onRead={(v) => update('groupRead', v)} onWrite={(v) => update('groupWrite', v)} onExecute={(v) => update('groupExecute', v)} />
            <PermGroup label="Others" read={perms.othersRead} write={perms.othersWrite} execute={perms.othersExecute}
              onRead={(v) => update('othersRead', v)} onWrite={(v) => update('othersWrite', v)} onExecute={(v) => update('othersExecute', v)} />
          </div>

          {/* Special bits */}
          <div className="flex flex-wrap gap-4">
            {[
              { label: 'SUID', key: 'suid' as const, desc: 'Run as owner' },
              { label: 'SGID', key: 'sgid' as const, desc: 'Run as group' },
              { label: 'Sticky', key: 'sticky' as const, desc: 'Restrict delete' },
            ].map(({ label, key, desc }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={perms[key]} onChange={(e) => update(key, e.target.checked)} className="rounded" />
                <span className="text-sm">{label}</span>
                <span className="text-xs text-muted-foreground">({desc})</span>
              </label>
            ))}
          </div>

          {/* Result */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Numeric</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-2xl font-bold text-primary">{numeric}</span>
                <CopyButton value={numeric} size="sm" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Symbolic</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-semibold">{symbolic}</span>
                <CopyButton value={symbolic} size="sm" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Command</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{command}</span>
                <CopyButton value={command} size="sm" />
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">{numeric} means:</p>
            <p>Owner: {[perms.ownerRead && 'read', perms.ownerWrite && 'write', perms.ownerExecute && 'execute'].filter(Boolean).join(', ') || 'no permissions'}</p>
            <p>Group: {[perms.groupRead && 'read', perms.groupWrite && 'write', perms.groupExecute && 'execute'].filter(Boolean).join(', ') || 'no permissions'}</p>
            <p>Others: {[perms.othersRead && 'read', perms.othersWrite && 'write', perms.othersExecute && 'execute'].filter(Boolean).join(', ') || 'no permissions'}</p>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  )
}
