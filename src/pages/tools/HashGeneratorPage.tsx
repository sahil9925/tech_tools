import { useState, useRef } from 'react'
import { Hash, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { CopyButton } from '@/components/tools/CopyButton'
import { getToolById } from '@/config/tools'
import { hashText, hashFile, type HashAlgorithm } from '@/utils/security'
import { trackToolUsage, trackToolSuccess, trackToolError } from '@/services/analytics'

const tool = getToolById('hash-generator')!

const ALGORITHMS: HashAlgorithm[] = ['SHA-256', 'SHA-512', 'SHA-384', 'SHA-1']

const faqs = [
  { question: 'Is my text sent to a server?', answer: 'No. Hashing uses the browser\'s native Web Crypto API (crypto.subtle). Your input never leaves the browser.' },
  { question: 'Is SHA-1 secure?', answer: 'SHA-1 is considered cryptographically weak and should not be used for security-sensitive applications. Use SHA-256 or SHA-512 instead.' },
  { question: 'Can I hash files?', answer: 'Yes. Select a file using the File Hash tab. The file is read locally using the File API and hashed in the browser — it is never uploaded.' },
]

export function HashGeneratorPage() {
  const [tab, setTab] = useState<'text' | 'file'>('text')
  const [input, setInput] = useState('')
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('SHA-256')
  const [hashes, setHashes] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [fileHash, setFileHash] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleHashText() {
    if (!input.trim()) { setError('Please enter some text.'); return }
    setError(null)
    setLoading(true)
    try {
      trackToolUsage('hash-generator')
      const results: Record<string, string> = {}
      for (const alg of ALGORITHMS) {
        results[alg] = await hashText(input, alg)
      }
      setHashes(results)
      trackToolSuccess('hash-generator')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Hashing failed.'
      setError(msg)
      trackToolError('hash-generator', msg)
    }
    setLoading(false)
  }

  async function handleHashFile(f: File) {
    setFile(f)
    setFileHash(null)
    setError(null)
    setLoading(true)
    try {
      const hash = await hashFile(f, algorithm)
      setFileHash(hash)
      trackToolUsage('hash-generator')
      trackToolSuccess('hash-generator')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'File hashing failed.'
      setError(msg)
      trackToolError('hash-generator', msg)
    }
    setLoading(false)
  }

  return (
    <ToolLayout tool={tool} faqs={faqs} howItWorks={
      <>
        <p>Uses the browser's Web Crypto API (<code className="text-xs bg-muted px-1 rounded">crypto.subtle.digest</code>) for hashing.</p>
        <p>Supports SHA-256, SHA-512, SHA-384, and SHA-1.</p>
        <p className="text-xs text-muted-foreground">Your input is never sent to any server.</p>
      </>
    }>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Hash Generator</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex rounded-lg border border-border overflow-hidden w-fit">
            <button onClick={() => setTab('text')} className={`px-3 py-1.5 text-sm font-medium transition-colors ${tab === 'text' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}>Text</button>
            <button onClick={() => setTab('file')} className={`px-3 py-1.5 text-sm font-medium transition-colors ${tab === 'file' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}>File</button>
          </div>

          {tab === 'text' ? (
            <div className="space-y-3">
              <textarea
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(null) }}
                placeholder="Enter text to hash..."
                className="w-full h-28 resize-none rounded-md border border-border bg-background p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                spellCheck={false}
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button onClick={handleHashText} disabled={loading} className="gap-2">
                  <Hash className="h-4 w-4" />{loading ? 'Hashing…' : 'Generate Hashes'}
                </Button>
                <Button variant="ghost" onClick={() => { setInput(''); setHashes({}); setError(null) }} className="gap-1.5 text-muted-foreground">
                  <Trash2 className="h-3.5 w-3.5" />Clear
                </Button>
              </div>

              {Object.keys(hashes).length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">Input length: {input.length} characters</p>
                  {ALGORITHMS.map((alg) => (
                    <div key={alg} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">{alg}{alg === 'SHA-1' ? ' (legacy, not secure)' : ''}</span>
                        <CopyButton value={hashes[alg]} size="sm" />
                      </div>
                      <p className="font-mono text-xs break-all bg-muted/50 rounded px-2 py-1.5">{hashes[alg]}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">Algorithm:</span>
                {ALGORITHMS.map((alg) => (
                  <button key={alg} onClick={() => setAlgorithm(alg)}
                    className={`text-xs px-2 py-1 rounded border transition-colors ${algorithm === alg ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}>
                    {alg}
                  </button>
                ))}
              </div>
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleHashFile(f) }}
              >
                <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Drop a file here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">File is read locally — never uploaded</p>
                <input ref={fileRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleHashFile(f) }} />
              </div>
              {file && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">File: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)</p>
                  {loading && <p className="text-xs text-muted-foreground">Computing {algorithm} hash…</p>}
                  {fileHash && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">{algorithm}</span>
                        <CopyButton value={fileHash} size="sm" />
                      </div>
                      <p className="font-mono text-xs break-all bg-muted/50 rounded px-2 py-1.5">{fileHash}</p>
                    </div>
                  )}
                </div>
              )}
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </ToolLayout>
  )
}
