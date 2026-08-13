/**
 * CSV Parser/Stringifier — client-side, handles quoted fields with commas/newlines.
 */

export interface CSVParseResult {
  success: boolean
  rows: string[][]
  headers: string[]
  error: string | null
}

export interface JSONToCSVResult {
  success: boolean
  csv: string | null
  error: string | null
}

export interface CSVToJSONResult {
  success: boolean
  json: string | null
  error: string | null
}

// ─── CSV Parser ───────────────────────────────────────────────────────────────

/**
 * Properly parses RFC 4180 CSV including quoted fields with commas, quotes, newlines.
 */
export function parseCSV(input: string): CSVParseResult {
  if (!input.trim()) return { success: false, rows: [], headers: [], error: 'Empty input.' }

  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  let i = 0
  const len = input.length

  while (i < len) {
    const ch = input[i]

    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          // Escaped quote
          field += '"'
          i += 2
        } else {
          inQuotes = false
          i++
        }
      } else {
        field += ch
        i++
      }
    } else {
      if (ch === '"') {
        inQuotes = true
        i++
      } else if (ch === ',') {
        row.push(field)
        field = ''
        i++
      } else if (ch === '\r' && input[i + 1] === '\n') {
        row.push(field)
        field = ''
        rows.push(row)
        row = []
        i += 2
      } else if (ch === '\n') {
        row.push(field)
        field = ''
        rows.push(row)
        row = []
        i++
      } else {
        field += ch
        i++
      }
    }
  }

  // Last field
  row.push(field)
  if (row.some((f) => f !== '') || rows.length === 0) rows.push(row)

  if (rows.length === 0) return { success: false, rows: [], headers: [], error: 'No data found.' }

  const headers = rows[0]
  return { success: true, rows: rows.slice(1), headers, error: null }
}

// ─── CSV Stringifier ──────────────────────────────────────────────────────────

function escapeCSVField(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

// ─── JSON → CSV ───────────────────────────────────────────────────────────────

export function jsonToCSV(jsonInput: string): JSONToCSVResult {
  try {
    const parsed: unknown = JSON.parse(jsonInput)
    if (!Array.isArray(parsed)) return { success: false, csv: null, error: 'Input must be a JSON array of objects.' }
    if (parsed.length === 0) return { success: true, csv: '', error: null }

    // Collect all unique keys
    const headerSet = new Set<string>()
    for (const item of parsed) {
      if (typeof item === 'object' && item !== null) {
        Object.keys(item as Record<string, unknown>).forEach((k) => headerSet.add(k))
      }
    }
    const headers = Array.from(headerSet)

    const lines: string[] = [headers.map(escapeCSVField).join(',')]
    for (const item of parsed) {
      const obj = (typeof item === 'object' && item !== null ? item : {}) as Record<string, unknown>
      const row = headers.map((h) => {
        const v = obj[h]
        if (v === null || v === undefined) return ''
        return escapeCSVField(String(v))
      })
      lines.push(row.join(','))
    }

    return { success: true, csv: lines.join('\n'), error: null }
  } catch (e) {
    return { success: false, csv: null, error: e instanceof Error ? e.message : 'Invalid JSON' }
  }
}

// ─── CSV → JSON ───────────────────────────────────────────────────────────────

export function csvToJSON(csvInput: string): CSVToJSONResult {
  const parsed = parseCSV(csvInput)
  if (!parsed.success) return { success: false, json: null, error: parsed.error }

  const result = parsed.rows.map((row) => {
    const obj: Record<string, string> = {}
    parsed.headers.forEach((h, i) => {
      obj[h] = row[i] ?? ''
    })
    return obj
  })

  return { success: true, json: JSON.stringify(result, null, 2), error: null }
}
