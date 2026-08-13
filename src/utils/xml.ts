/**
 * XML Formatter — browser-native DOMParser, no eval, no external entity execution.
 */

export interface XMLFormatResult {
  success: boolean
  output: string | null
  error: string | null
}

function serializeNode(node: Node, indent: number, indentStr: string): string {
  const pad = indentStr.repeat(indent)

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim() ?? ''
    return text ? `${pad}${text}` : ''
  }

  if (node.nodeType === Node.COMMENT_NODE) {
    return `${pad}<!--${node.textContent}-->`
  }

  if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
    const pi = node as ProcessingInstruction
    return `${pad}<?${pi.target} ${pi.data}?>`
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return ''

  const el = node as Element
  const tag = el.tagName
  const attrs = Array.from(el.attributes)
    .map((a) => ` ${a.name}="${a.value}"`)
    .join('')

  const children = Array.from(el.childNodes)
  const childTexts = children.filter(
    (c) => c.nodeType === Node.TEXT_NODE && (c.textContent?.trim() ?? '')
  )
  const childElements = children.filter((c) => c.nodeType === Node.ELEMENT_NODE)

  // Self-closing for empty elements
  if (children.length === 0 || (childTexts.length === 0 && childElements.length === 0)) {
    return `${pad}<${tag}${attrs} />`
  }

  // Inline text-only
  if (childElements.length === 0 && childTexts.length > 0) {
    const text = children.map((c) => c.textContent?.trim() ?? '').join('')
    return `${pad}<${tag}${attrs}>${text}</${tag}>`
  }

  const inner = children
    .map((c) => serializeNode(c, indent + 1, indentStr))
    .filter(Boolean)
    .join('\n')

  return `${pad}<${tag}${attrs}>\n${inner}\n${pad}</${tag}>`
}

export function formatXML(input: string, indentStr = '  '): XMLFormatResult {
  if (!input.trim()) return { success: false, output: null, error: 'Empty input.' }

  const parser = new DOMParser()
  const doc = parser.parseFromString(input, 'application/xml')

  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    const msg = parseError.textContent ?? 'Invalid XML'
    return { success: false, output: null, error: msg.trim().split('\n')[0] }
  }

  try {
    const lines: string[] = []
    // Include XML declaration if present in original
    if (input.trim().startsWith('<?xml')) {
      lines.push(input.trim().split('\n')[0].split('?>')[0] + '?>')
    }
    for (const child of Array.from(doc.childNodes)) {
      const serialized = serializeNode(child, 0, indentStr)
      if (serialized) lines.push(serialized)
    }
    return { success: true, output: lines.join('\n'), error: null }
  } catch (e) {
    return { success: false, output: null, error: e instanceof Error ? e.message : 'Format error' }
  }
}

export function minifyXML(input: string): XMLFormatResult {
  if (!input.trim()) return { success: false, output: null, error: 'Empty input.' }

  const parser = new DOMParser()
  const doc = parser.parseFromString(input, 'application/xml')

  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    return { success: false, output: null, error: (parseError.textContent ?? 'Invalid XML').trim().split('\n')[0] }
  }

  const serializer = new XMLSerializer()
  const raw = serializer.serializeToString(doc)
  const minified = raw.replace(/>\s+</g, '><').trim()
  return { success: true, output: minified, error: null }
}

export function validateXML(input: string): { valid: boolean; error: string | null } {
  if (!input.trim()) return { valid: false, error: 'Empty input.' }
  const parser = new DOMParser()
  const doc = parser.parseFromString(input, 'application/xml')
  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    return { valid: false, error: (parseError.textContent ?? 'Invalid XML').trim().split('\n')[0] }
  }
  return { valid: true, error: null }
}
