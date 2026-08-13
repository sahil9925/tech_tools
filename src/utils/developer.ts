/**
 * Diff utility — Myers diff algorithm, client-side.
 */

export type DiffLineType = 'added' | 'removed' | 'unchanged'

export interface DiffLine {
  type: DiffLineType
  content: string
  leftLineNo: number | null
  rightLineNo: number | null
}

export interface DiffStats {
  added: number
  removed: number
  unchanged: number
  changed: number
}

export interface DiffResult {
  lines: DiffLine[]
  stats: DiffStats
}

// ─── Myers LCS diff ──────────────────────────────────────────────────────────

function lcs(a: string[], b: string[]): boolean[][] {
  const m = a.length
  const n = b.length
  // dp[i][j] = true if a[i-1] == b[j-1] and part of LCS path
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }

  // Backtrack
  const keep: boolean[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false))
  let i = m, j = n
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      keep[i][j] = true
      i--; j--
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--
    } else {
      j--
    }
  }
  return keep
}

export function computeDiff(
  original: string,
  modified: string,
  options: { ignoreWhitespace?: boolean; ignoreCase?: boolean } = {}
): DiffResult {
  let aLines = original.split('\n')
  let bLines = modified.split('\n')

  const normalize = (s: string) => {
    if (options.ignoreWhitespace) s = s.trim().replace(/\s+/g, ' ')
    if (options.ignoreCase) s = s.toLowerCase()
    return s
  }

  const aNorm = aLines.map(normalize)
  const bNorm = bLines.map(normalize)

  const keep = lcs(aNorm, bNorm)

  const result: DiffLine[] = []
  let ai = 1, bi = 1
  let leftNo = 1, rightNo = 1
  const m = aLines.length, n = bLines.length

  while (ai <= m || bi <= n) {
    if (ai <= m && bi <= n && keep[ai][bi]) {
      result.push({ type: 'unchanged', content: aLines[ai - 1], leftLineNo: leftNo++, rightLineNo: rightNo++ })
      ai++; bi++
    } else if (bi <= n && (ai > m || !keep[ai][bi])) {
      // Check if it's a modification rather than pure add
      result.push({ type: 'added', content: bLines[bi - 1], leftLineNo: null, rightLineNo: rightNo++ })
      bi++
    } else {
      result.push({ type: 'removed', content: aLines[ai - 1], leftLineNo: leftNo++, rightLineNo: null })
      ai++
    }
  }

  const stats: DiffStats = {
    added: result.filter((l) => l.type === 'added').length,
    removed: result.filter((l) => l.type === 'removed').length,
    unchanged: result.filter((l) => l.type === 'unchanged').length,
    changed: 0,
  }
  stats.changed = Math.min(stats.added, stats.removed)

  return { lines: result, stats }
}

// ─── Cron ─────────────────────────────────────────────────────────────────────

export interface CronField {
  value: string
  label: string
}

export function explainCron(expr: string): string {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return 'Invalid cron expression (need 5 fields).'

  const [min, hour, dom, month, dow] = parts

  const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const describePart = (val: string, unit: string, names?: string[]): string => {
    if (val === '*') return `every ${unit}`
    if (val.startsWith('*/')) return `every ${val.slice(2)} ${unit}s`
    if (val.includes('-')) {
      const [a, b] = val.split('-')
      const from = names ? names[parseInt(a)] ?? a : a
      const to = names ? names[parseInt(b)] ?? b : b
      return `from ${from} to ${to}`
    }
    if (val.includes(',')) {
      const items = val.split(',').map((v) => names ? names[parseInt(v)] ?? v : v)
      return items.join(', ')
    }
    const n = parseInt(val, 10)
    return names ? names[n] ?? val : val
  }

  const minuteStr = describePart(min, 'minute')
  const hourStr = describePart(hour, 'hour')
  const domStr = describePart(dom, 'day of month')
  const monthStr = describePart(month, 'month', monthNames)
  const dowStr = describePart(dow, 'day of week', dayNames)

  if (expr === '* * * * *') return 'Every minute'
  if (expr === '*/5 * * * *') return 'Every 5 minutes'
  if (expr === '0 * * * *') return 'At the start of every hour'
  if (expr === '0 0 * * *') return 'Every day at midnight'
  if (expr === '0 9 * * *') return 'Every day at 9:00 AM'
  if (expr === '0 9 * * 1-5') return 'Every weekday (Monday–Friday) at 9:00 AM'
  if (expr === '0 0 1 * *') return 'At midnight on the first day of every month'
  if (expr === '0 0 * * 0') return 'Every Sunday at midnight'

  const parts2: string[] = []
  if (min !== '*') parts2.push(`at minute ${min}`)
  if (hour !== '*') parts2.push(`hour ${hour}`)
  if (dom !== '*') parts2.push(`on day ${dom} of month`)
  if (month !== '*') parts2.push(`in ${monthStr}`)
  if (dow !== '*') parts2.push(`on ${dowStr}`)

  return parts2.length > 0
    ? `Runs ${parts2.join(', ')}`
    : `${minuteStr}, ${hourStr}, ${domStr}, ${monthStr}, ${dowStr}`
}

// ─── chmod ────────────────────────────────────────────────────────────────────

export interface ChmodPermissions {
  ownerRead: boolean
  ownerWrite: boolean
  ownerExecute: boolean
  groupRead: boolean
  groupWrite: boolean
  groupExecute: boolean
  othersRead: boolean
  othersWrite: boolean
  othersExecute: boolean
  suid: boolean
  sgid: boolean
  sticky: boolean
}

export function permissionsToNumeric(p: ChmodPermissions): string {
  const special = (p.suid ? 4 : 0) + (p.sgid ? 2 : 0) + (p.sticky ? 1 : 0)
  const owner = (p.ownerRead ? 4 : 0) + (p.ownerWrite ? 2 : 0) + (p.ownerExecute ? 1 : 0)
  const group = (p.groupRead ? 4 : 0) + (p.groupWrite ? 2 : 0) + (p.groupExecute ? 1 : 0)
  const others = (p.othersRead ? 4 : 0) + (p.othersWrite ? 2 : 0) + (p.othersExecute ? 1 : 0)
  return special > 0
    ? `${special}${owner}${group}${others}`
    : `${owner}${group}${others}`
}

export function permissionsToSymbolic(p: ChmodPermissions): string {
  const r = (v: boolean) => (v ? 'r' : '-')
  const w = (v: boolean) => (v ? 'w' : '-')
  const x = (v: boolean, special: boolean, upper: string) => {
    if (v && special) return upper
    if (!v && special) return upper.toLowerCase() === 's' ? 'S' : 'T'
    return v ? 'x' : '-'
  }
  return (
    r(p.ownerRead) + w(p.ownerWrite) + x(p.ownerExecute, p.suid, 's') +
    r(p.groupRead) + w(p.groupWrite) + x(p.groupExecute, p.sgid, 's') +
    r(p.othersRead) + w(p.othersWrite) + x(p.othersExecute, p.sticky, 't')
  )
}

export function numericToPermissions(octal: string): ChmodPermissions | null {
  const digits = octal.replace(/^0+/, '') || '0'
  let special = 0, owner = 0, group = 0, others = 0

  if (digits.length === 4) {
    special = parseInt(digits[0], 10)
    owner = parseInt(digits[1], 10)
    group = parseInt(digits[2], 10)
    others = parseInt(digits[3], 10)
  } else if (digits.length === 3) {
    owner = parseInt(digits[0], 10)
    group = parseInt(digits[1], 10)
    others = parseInt(digits[2], 10)
  } else {
    return null
  }

  if ([special, owner, group, others].some((d) => d > 7)) return null

  return {
    ownerRead: !!(owner & 4),
    ownerWrite: !!(owner & 2),
    ownerExecute: !!(owner & 1),
    groupRead: !!(group & 4),
    groupWrite: !!(group & 2),
    groupExecute: !!(group & 1),
    othersRead: !!(others & 4),
    othersWrite: !!(others & 2),
    othersExecute: !!(others & 1),
    suid: !!(special & 4),
    sgid: !!(special & 2),
    sticky: !!(special & 1),
  }
}
