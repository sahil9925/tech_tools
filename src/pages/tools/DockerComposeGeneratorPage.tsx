import { useState } from 'react'
import { Container, Plus, Trash2, Copy, Check, Download, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { getToolById } from '@/config/tools'
import { trackToolUsage, trackToolSuccess } from '@/services/analytics'

const tool = getToolById('docker-compose-generator')!

interface ServiceConfig {
  id: string
  name: string
  image: string
  containerName: string
  ports: string
  environment: string
  volumes: string
  restart: string
  command: string
  dependsOn: string
}

function newService(id: string): ServiceConfig {
  return { id, name: 'service', image: 'nginx:latest', containerName: '', ports: '', environment: '', volumes: '', restart: 'unless-stopped', command: '', dependsOn: '' }
}

const RESTART_OPTIONS = ['no', 'always', 'unless-stopped', 'on-failure']

const faqs = [
  { question: 'Is the YAML sent to a server?', answer: 'No. The YAML is generated entirely in your browser. Nothing is sent to any server.' },
  { question: 'Is this configuration validated?', answer: 'The YAML structure is generated correctly, but it is not validated against a running Docker environment. Always test your configuration locally.' },
  { question: 'What version of Docker Compose is generated?', answer: 'The generated YAML uses the Docker Compose v2 format (services-level only, no version key, which is the recommended modern format).' },
]

function generateYAML(services: ServiceConfig[], projectName: string): string {
  const lines: string[] = []
  if (projectName) lines.push(`name: ${projectName}\n`)
  lines.push('services:')

  for (const svc of services) {
    const name = svc.name || 'service'
    lines.push(`  ${name}:`)
    lines.push(`    image: ${svc.image || 'nginx:latest'}`)
    if (svc.containerName) lines.push(`    container_name: ${svc.containerName}`)
    if (svc.restart) lines.push(`    restart: ${svc.restart}`)
    if (svc.command) lines.push(`    command: ${svc.command}`)

    const ports = svc.ports.split('\n').map((p) => p.trim()).filter(Boolean)
    if (ports.length > 0) {
      lines.push('    ports:')
      ports.forEach((p) => lines.push(`      - "${p}"`))
    }

    const envs = svc.environment.split('\n').map((e) => e.trim()).filter(Boolean)
    if (envs.length > 0) {
      lines.push('    environment:')
      envs.forEach((e) => {
        const [k, ...rest] = e.split('=')
        lines.push(`      ${k.trim()}: "${rest.join('=')}"`)
      })
    }

    const vols = svc.volumes.split('\n').map((v) => v.trim()).filter(Boolean)
    if (vols.length > 0) {
      lines.push('    volumes:')
      vols.forEach((v) => lines.push(`      - ${v}`))
    }

    const deps = svc.dependsOn.split(',').map((d) => d.trim()).filter(Boolean)
    if (deps.length > 0) {
      lines.push('    depends_on:')
      deps.forEach((d) => lines.push(`      - ${d}`))
    }
  }

  return lines.join('\n')
}

let nextId = 1

export function DockerComposeGeneratorPage() {
  const [projectName, setProjectName] = useState('my-project')
  const [services, setServices] = useState<ServiceConfig[]>([newService(String(nextId++))])
  const [yaml, setYaml] = useState('')
  const { copied, copy } = useCopyToClipboard()

  function addService() { setServices((s) => [...s, newService(String(nextId++))]) }
  function removeService(id: string) { setServices((s) => s.filter((svc) => svc.id !== id)) }
  function updateService(id: string, key: keyof ServiceConfig, value: string) {
    setServices((s) => s.map((svc) => svc.id === id ? { ...svc, [key]: value } : svc))
  }
  function duplicateService(id: string) {
    const svc = services.find((s) => s.id === id)
    if (!svc) return
    setServices((s) => [...s, { ...svc, id: String(nextId++), name: svc.name + '-copy' }])
  }

  function handleGenerate() {
    trackToolUsage('docker-compose-generator')
    const generated = generateYAML(services, projectName)
    setYaml(generated)
    trackToolSuccess('docker-compose-generator')
  }

  function downloadYAML() {
    if (!yaml) return
    const blob = new Blob([yaml], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'docker-compose.yml'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <ToolLayout tool={tool} faqs={faqs} howItWorks={
      <>
        <p>Add services, configure their properties, and click <strong>Generate YAML</strong>.</p>
        <p className="text-xs font-medium text-amber-600 dark:text-amber-400">⚠️ Generated configuration is not automatically validated against a running Docker environment.</p>
        <p className="text-xs text-muted-foreground">No data is sent to any server. Nothing is executed.</p>
      </>
    }>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Docker Compose Generator</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleGenerate} className="gap-1.5"><Container className="h-3.5 w-3.5" />Generate YAML</Button>
              <Button size="sm" variant="ghost" onClick={() => { setServices([newService(String(nextId++))]); setYaml('') }} className="gap-1.5 text-muted-foreground"><RotateCcw className="h-3.5 w-3.5" />Reset</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Project Name</label>
            <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="my-project" className="max-w-sm" />
          </div>

          {services.map((svc, idx) => (
            <div key={svc.id} className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Service {idx + 1}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => duplicateService(svc.id)}>Duplicate</Button>
                  {services.length > 1 && (
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-destructive hover:text-destructive" onClick={() => removeService(svc.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Service Name</label>
                  <Input value={svc.name} onChange={(e) => updateService(svc.id, 'name', e.target.value)} placeholder="web" className="font-mono text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Image</label>
                  <Input value={svc.image} onChange={(e) => updateService(svc.id, 'image', e.target.value)} placeholder="nginx:latest" className="font-mono text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Container Name (optional)</label>
                  <Input value={svc.containerName} onChange={(e) => updateService(svc.id, 'containerName', e.target.value)} placeholder="my-nginx" className="font-mono text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Restart Policy</label>
                  <select value={svc.restart} onChange={(e) => updateService(svc.id, 'restart', e.target.value)}
                    className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring">
                    {RESTART_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Ports (one per line, e.g. 8080:80)</label>
                  <textarea value={svc.ports} onChange={(e) => updateService(svc.id, 'ports', e.target.value)}
                    placeholder="8080:80&#10;443:443"
                    className="w-full h-20 resize-none rounded-md border border-border bg-background p-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Environment (one per line, KEY=VALUE)</label>
                  <textarea value={svc.environment} onChange={(e) => updateService(svc.id, 'environment', e.target.value)}
                    placeholder="NODE_ENV=production&#10;PORT=3000"
                    className="w-full h-20 resize-none rounded-md border border-border bg-background p-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Volumes (one per line, host:container)</label>
                  <textarea value={svc.volumes} onChange={(e) => updateService(svc.id, 'volumes', e.target.value)}
                    placeholder="./data:/var/data&#10;./config:/etc/config"
                    className="w-full h-20 resize-none rounded-md border border-border bg-background p-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Depends On (comma-separated service names)</label>
                  <Input value={svc.dependsOn} onChange={(e) => updateService(svc.id, 'dependsOn', e.target.value)} placeholder="db, redis" className="font-mono text-sm" />
                  <label className="text-xs text-muted-foreground">Command (optional)</label>
                  <Input value={svc.command} onChange={(e) => updateService(svc.id, 'command', e.target.value)} placeholder="npm start" className="font-mono text-sm" />
                </div>
              </div>
            </div>
          ))}

          <Button variant="outline" onClick={addService} className="gap-2 w-full">
            <Plus className="h-4 w-4" />Add Service
          </Button>
        </CardContent>
      </Card>

      {yaml && (
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">docker-compose.yml</CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => copy(yaml)}>
                {copied ? <><Check className="h-3 w-3 text-green-500" />Copied</> : <><Copy className="h-3 w-3" />Copy</>}
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={downloadYAML}>
                <Download className="h-3 w-3" />Download
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <pre className="overflow-auto p-4 font-mono text-xs text-foreground max-h-[500px]">{yaml}</pre>
          </CardContent>
        </Card>
      )}
    </ToolLayout>
  )
}
