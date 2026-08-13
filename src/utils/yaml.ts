/**
 * YAML parser/stringifier — lightweight, browser-safe, no dependencies.
 * Handles: key-value, nested objects, arrays, strings, numbers, booleans, null, multiline.
 * For production use consider js-yaml. This implementation covers common DevOps configs.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface YAMLParseResult {
  success: boolean
  value: unknown
  error: string | null
  errorLine: number | null
}

export interface YAMLStringifyResult {
  success: boolean
  yaml: string | null
  error: string | null
}

// ─── Tokenise / parse ────────────────────────────────────────────────────────

function parseScalar(raw: string): unknown {
  const s = raw.trim()
  if (s === 'true' || s === 'yes') return true
  if (s === 'false' || s === 'no') return false
  if (s === 'null' || s === '~' || s === '') return null
  if (/^-?\d+$/.test(s)) return parseInt(s, 10)
  if (/^-?\d+\.\d+$/.test(s)) return parseFloat(s)
  // Strip surrounding quotes
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1)
  }
  return s
}

function getIndent(line: string): number {
  return line.match(/^(\s*)/)?.[1].length ?? 0
}

function parseLines(lines: string[], startIdx: number, baseIndent: number): { value: unknown; nextIdx: number } {
  // Skip empty / comment lines
  while (startIdx < lines.length && (lines[startIdx].trim() === '' || lines[startIdx].trim().startsWith('#'))) {
    startIdx++
  }
  if (startIdx >= lines.length) return { value: null, nextIdx: startIdx }

  const firstLine = lines[startIdx]
  const indent = getIndent(firstLine)
  if (indent < baseIndent) return { value: null, nextIdx: startIdx }

  const trimmed = firstLine.trim()

  // Array item
  if (trimmed.startsWith('- ') || trimmed === '-') {
    const result: unknown[] = []
    let i = startIdx
    while (i < lines.length) {
      const line = lines[i]
      if (line.trim() === '' || line.trim().startsWith('#')) { i++; continue }
      const lineIndent = getIndent(line)
      if (lineIndent < indent) break
      if (lineIndent === indent && line.trim().startsWith('-')) {
        const rest = line.trim().slice(1).trim()
        if (rest === '') {
          // Value on next lines
          const { value, nextIdx } = parseLines(lines, i + 1, lineIndent + 2)
          result.push(value)
          i = nextIdx
        } else {
          result.push(parseScalar(rest))
          i++
        }
      } else {
        break
      }
    }
    return { value: result, nextIdx: i }
  }

  // Key-value object
  if (trimmed.includes(':')) {
    const obj: Record<string, unknown> = {}
    let i = startIdx
    while (i < lines.length) {
      const line = lines[i]
      if (line.trim() === '' || line.trim().startsWith('#')) { i++; continue }
      const lineIndent = getIndent(line)
      if (lineIndent < indent) break
      if (lineIndent === indent) {
        const colonIdx = line.indexOf(':')
        if (colonIdx === -1) break
        const key = line.slice(lineIndent, colonIdx).trim()
        const afterColon = line.slice(colonIdx + 1).trim()
        if (afterColon === '' || afterColon.startsWith('#')) {
          // Value is on next lines
          const { value, nextIdx } = parseLines(lines, i + 1, lineIndent + 2)
          obj[key] = value
          i = nextIdx
        } else if (afterColon === '|' || afterColon === '>') {
          // Block scalar — collect following lines
          const blockLines: string[] = []
          let j = i + 1
          while (j < lines.length && getIndent(lines[j]) > lineIndent) {
            blockLines.push(lines[j].trim())
            j++
          }
          obj[key] = blockLines.join(afterColon === '|' ? '\n' : ' ')
          i = j
        } else {
          obj[key] = parseScalar(afterColon.split('#')[0].trim())
          i++
        }
      } else {
        break
      }
    }
    return { value: obj, nextIdx: i }
  }

  return { value: parseScalar(trimmed), nextIdx: startIdx + 1 }
}

export function parseYAML(input: string): YAMLParseResult {
  if (!input.trim()) return { success: false, value: null, error: 'Empty input.', errorLine: null }
  try {
    const lines = input.split('\n')
    const { value } = parseLines(lines, 0, 0)
    return { success: true, value, error: null, errorLine: null }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Parse error'
    return { success: false, value: null, error: msg, errorLine: null }
  }
}

// ─── Stringify ────────────────────────────────────────────────────────────────

function stringifyValue(value: unknown, indent: number): string {
  const pad = '  '.repeat(indent)
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') {
    // Quote strings that need it
    if (value.includes('\n') || value.includes(':') || value.includes('#') ||
      value.includes('"') || value === '' || /^(true|false|null|yes|no|~)$/i.test(value)) {
      return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`
    }
    return value
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    return value.map((item) => {
      if (typeof item === 'object' && item !== null) {
        return `${pad}- \n${stringifyObject(item as Record<string, unknown>, indent + 1)}`
      }
      return `${pad}- ${stringifyValue(item, indent)}`
    }).join('\n')
  }
  if (typeof value === 'object') {
    return stringifyObject(value as Record<string, unknown>, indent)
  }
  return String(value)
}

function stringifyObject(obj: Record<string, unknown>, indent: number): string {
  const pad = '  '.repeat(indent)
  return Object.entries(obj).map(([k, v]) => {
    if (v === null || v === undefined) return `${pad}${k}: null`
    if (typeof v === 'object') {
      if (Array.isArray(v)) {
        if ((v as unknown[]).length === 0) return `${pad}${k}: []`
        return `${pad}${k}:\n${stringifyValue(v, indent + 1)}`
      }
      return `${pad}${k}:\n${stringifyValue(v, indent + 1)}`
    }
    return `${pad}${k}: ${stringifyValue(v, indent)}`
  }).join('\n')
}

export function stringifyYAML(value: unknown): YAMLStringifyResult {
  try {
    const yaml = stringifyValue(value, 0)
    return { success: true, yaml, error: null }
  } catch (e) {
    return { success: false, yaml: null, error: e instanceof Error ? e.message : 'Stringify error' }
  }
}

// ─── JSON → YAML ─────────────────────────────────────────────────────────────

export function jsonToYAML(jsonInput: string): { yaml: string | null; error: string | null } {
  try {
    const parsed = JSON.parse(jsonInput)
    const result = stringifyYAML(parsed)
    return { yaml: result.yaml, error: result.error }
  } catch (e) {
    return { yaml: null, error: e instanceof Error ? e.message : 'Invalid JSON' }
  }
}

// ─── YAML → JSON ─────────────────────────────────────────────────────────────

export function yamlToJSON(yamlInput: string): { json: string | null; error: string | null } {
  const result = parseYAML(yamlInput)
  if (!result.success) return { json: null, error: result.error }
  return { json: JSON.stringify(result.value, null, 2), error: null }
}
