/**
 * JSON Formatter & Validator Utility
 * Works entirely client-side.
 */

export interface JSONFormatResult {
  success: boolean
  formatted: string | null
  error: string | null
  errorLine: number | null
  errorColumn: number | null
}

export interface JSONValidateResult {
  valid: boolean
  error: string | null
  errorLine: number | null
  errorColumn: number | null
}

export interface JSONMinifyResult {
  success: boolean
  minified: string | null
  originalSize: number
  minifiedSize: number
  savings: number
  error: string | null
}

/**
 * Parse JSON and extract error location if parsing fails.
 */
function parseWithLocation(input: string): { value: unknown } | { error: string; line: number | null; column: number | null } {
  try {
    const value = JSON.parse(input)
    return { value }
  } catch (e) {
    if (e instanceof SyntaxError) {
      const msg = e.message
      // Try to extract line/col from V8 error messages
      const posMatch = msg.match(/position (\d+)/)
      if (posMatch) {
        const pos = parseInt(posMatch[1], 10)
        const before = input.substring(0, pos)
        const lines = before.split('\n')
        const line = lines.length
        const column = (lines[lines.length - 1]?.length ?? 0) + 1
        return { error: msg, line, column }
      }
      return { error: msg, line: null, column: null }
    }
    return { error: 'Unknown parsing error', line: null, column: null }
  }
}

export function format(input: string, indent = 2): JSONFormatResult {
  const result = parseWithLocation(input)

  if ('error' in result) {
    return {
      success: false,
      formatted: null,
      error: result.error,
      errorLine: result.line,
      errorColumn: result.column,
    }
  }

  return {
    success: true,
    formatted: JSON.stringify(result.value, null, indent),
    error: null,
    errorLine: null,
    errorColumn: null,
  }
}

export function validate(input: string): JSONValidateResult {
  const result = parseWithLocation(input)

  if ('error' in result) {
    return {
      valid: false,
      error: result.error,
      errorLine: result.line,
      errorColumn: result.column,
    }
  }

  return { valid: true, error: null, errorLine: null, errorColumn: null }
}

export function minify(input: string): JSONMinifyResult {
  const originalSize = new Blob([input]).size
  const result = parseWithLocation(input)

  if ('error' in result) {
    return {
      success: false,
      minified: null,
      originalSize,
      minifiedSize: 0,
      savings: 0,
      error: result.error,
    }
  }

  const minified = JSON.stringify(result.value)
  const minifiedSize = new Blob([minified]).size

  return {
    success: true,
    minified,
    originalSize,
    minifiedSize,
    savings: Math.round(((originalSize - minifiedSize) / originalSize) * 100),
    error: null,
  }
}
