import { useState } from 'react'
import { Server, Copy, Check, Download, RotateCcw, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { getToolById } from '@/config/tools'
import { trackToolUsage, trackToolSuccess } from '@/services/analytics'

const tool = getToolById('kubernetes-generator')!

type ResourceType = 'Deployment' | 'Service' | 'Ingress' | 'Namespace' | 'ConfigMap' | 'Job'

const RESOURCE_TYPES: ResourceType[] = ['Deployment', 'Service', 'Ingress', 'Namespace', 'ConfigMap', 'Job']

interface EnvVar { key: string; value: string }

interface DeploymentConfig {
  name: string; namespace: string; image: string; replicas: number; containerPort: string
  cpuRequest: string; memRequest: string; cpuLimit: string; memLimit: string
  envVars: EnvVar[]
}

interface ServiceConfig {
  name: string; namespace: string; type: 'ClusterIP' | 'NodePort' | 'LoadBalancer'
  port: string; targetPort: string; selector: string
}

interface IngressConfig {
  name: string; namespace: string; host: string; path: string
  serviceName: string; servicePort: string; tlsEnabled: boolean
}

interface NamespaceConfig { name: string }

interface ConfigMapConfig {
  name: string; namespace: string; data: string
}

interface JobConfig {
  name: string; namespace: string; image: string; command: string
}

const faqs = [
  { question: 'Is my YAML sent to a server?', answer: 'No. All YAML is generated in the browser. Nothing is sent to any server and no kubectl commands are executed.' },
  { question: 'Is this for production use?', answer: 'The generated YAML follows Kubernetes API conventions but should be reviewed and customised before production deployment.' },
  { question: 'Why no Secrets generator?', answer: 'Kubernetes Secrets contain sensitive values. We encourage creating secrets via kubectl apply or a secrets manager rather than browser-generated YAML.' },
]

function downloadYAML(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/yaml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function generateDeployment(c: DeploymentConfig): string {
  const envLines = c.envVars.filter((e) => e.key).map((e) => `          - name: ${e.key}\n            value: "${e.value}"`).join('\n')
  return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${c.name || 'my-app'}
  namespace: ${c.namespace || 'default'}
  labels:
    app: ${c.name || 'my-app'}
spec:
  replicas: ${c.replicas || 1}
  selector:
    matchLabels:
      app: ${c.name || 'my-app'}
  template:
    metadata:
      labels:
        app: ${c.name || 'my-app'}
    spec:
      containers:
        - name: ${c.name || 'my-app'}
          image: ${c.image || 'nginx:latest'}${c.containerPort ? `\n          ports:\n            - containerPort: ${c.containerPort}` : ''}${envLines ? `\n          env:\n${envLines}` : ''}${(c.cpuRequest || c.memRequest || c.cpuLimit || c.memLimit) ? `\n          resources:
            requests:${c.cpuRequest ? `\n              cpu: "${c.cpuRequest}"` : ''}${c.memRequest ? `\n              memory: "${c.memRequest}"` : ''}
            limits:${c.cpuLimit ? `\n              cpu: "${c.cpuLimit}"` : ''}${c.memLimit ? `\n              memory: "${c.memLimit}"` : ''}` : ''}`
}

function generateService(c: ServiceConfig): string {
  return `apiVersion: v1
kind: Service
metadata:
  name: ${c.name || 'my-service'}
  namespace: ${c.namespace || 'default'}
spec:
  type: ${c.type || 'ClusterIP'}
  selector:
    app: ${c.selector || c.name || 'my-app'}
  ports:
    - port: ${c.port || '80'}
      targetPort: ${c.targetPort || '80'}`
}

function generateIngress(c: IngressConfig): string {
  return `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${c.name || 'my-ingress'}
  namespace: ${c.namespace || 'default'}
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:${c.tlsEnabled ? `\n  tls:\n    - hosts:\n        - ${c.host || 'example.com'}\n      secretName: ${c.name || 'my-ingress'}-tls` : ''}
  rules:
    - host: ${c.host || 'example.com'}
      http:
        paths:
          - path: ${c.path || '/'}
            pathType: Prefix
            backend:
              service:
                name: ${c.serviceName || 'my-service'}
                port:
                  number: ${parseInt(c.servicePort || '80', 10) || 80}`
}

function generateNamespace(c: NamespaceConfig): string {
  return `apiVersion: v1
kind: Namespace
metadata:
  name: ${c.name || 'my-namespace'}
  labels:
    name: ${c.name || 'my-namespace'}`
}

function generateConfigMap(c: ConfigMapConfig): string {
  const dataLines = c.data.split('\n').map((l) => l.trim()).filter((l) => l.includes('=')).map((l) => {
    const [k, ...rest] = l.split('=')
    return `  ${k.trim()}: "${rest.join('=')}"`
  }).join('\n')
  return `apiVersion: v1
kind: ConfigMap
metadata:
  name: ${c.name || 'my-config'}
  namespace: ${c.namespace || 'default'}
data:
${dataLines || '  KEY: "value"'}`
}

function generateJob(c: JobConfig): string {
  return `apiVersion: batch/v1
kind: Job
metadata:
  name: ${c.name || 'my-job'}
  namespace: ${c.namespace || 'default'}
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: ${c.name || 'my-job'}
          image: ${c.image || 'busybox:latest'}${c.command ? `\n          command: ["/bin/sh", "-c", "${c.command}"]` : ''}`
}

export function KubernetesGeneratorPage() {
  const [resourceType, setResourceType] = useState<ResourceType>('Deployment')
  const [yaml, setYaml] = useState('')
  const { copied, copy } = useCopyToClipboard()

  // Deployment
  const [dep, setDep] = useState<DeploymentConfig>({ name: 'my-app', namespace: 'default', image: 'nginx:latest', replicas: 3, containerPort: '80', cpuRequest: '100m', memRequest: '128Mi', cpuLimit: '500m', memLimit: '512Mi', envVars: [{ key: '', value: '' }] })
  // Service
  const [svc, setSvc] = useState<ServiceConfig>({ name: 'my-service', namespace: 'default', type: 'ClusterIP', port: '80', targetPort: '80', selector: 'my-app' })
  // Ingress
  const [ing, setIng] = useState<IngressConfig>({ name: 'my-ingress', namespace: 'default', host: 'example.com', path: '/', serviceName: 'my-service', servicePort: '80', tlsEnabled: false })
  // Namespace
  const [ns, setNs] = useState<NamespaceConfig>({ name: 'my-namespace' })
  // ConfigMap
  const [cm, setCm] = useState<ConfigMapConfig>({ name: 'my-config', namespace: 'default', data: 'APP_ENV=production\nDEBUG=false' })
  // Job
  const [job, setJob] = useState<JobConfig>({ name: 'my-job', namespace: 'default', image: 'busybox:latest', command: 'echo hello' })

  function handleGenerate() {
    trackToolUsage('kubernetes-generator')
    let generated = ''
    if (resourceType === 'Deployment') generated = generateDeployment(dep)
    else if (resourceType === 'Service') generated = generateService(svc)
    else if (resourceType === 'Ingress') generated = generateIngress(ing)
    else if (resourceType === 'Namespace') generated = generateNamespace(ns)
    else if (resourceType === 'ConfigMap') generated = generateConfigMap(cm)
    else if (resourceType === 'Job') generated = generateJob(job)
    setYaml(generated)
    trackToolSuccess('kubernetes-generator')
  }

  function handleDownload() {
    if (!yaml) return
    const filename = `${resourceType.toLowerCase()}.yaml`
    downloadYAML(yaml, filename)
  }

  const depUpdate = (k: keyof DeploymentConfig, v: string | number) => setDep((d) => ({ ...d, [k]: v }))
  const svcUpdate = (k: keyof ServiceConfig, v: string) => setSvc((s) => ({ ...s, [k]: v }))
  const ingUpdate = (k: keyof IngressConfig, v: string | boolean) => setIng((i) => ({ ...i, [k]: v }))

  return (
    <ToolLayout tool={tool} faqs={faqs} howItWorks={
      <>
        <p>Select a resource type, fill in the fields, and click <strong>Generate YAML</strong>.</p>
        <p className="text-xs font-medium text-amber-600 dark:text-amber-400">⚠️ This tool generates YAML text only. No kubectl commands are run. No cluster connection is made.</p>
        <p className="text-xs text-muted-foreground">All generation is client-side.</p>
      </>
    }>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base">Kubernetes YAML Generator</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleGenerate} className="gap-1.5"><Server className="h-3.5 w-3.5" />Generate YAML</Button>
              <Button size="sm" variant="ghost" onClick={() => setYaml('')} className="gap-1.5 text-muted-foreground"><RotateCcw className="h-3.5 w-3.5" />Reset</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Resource type selector */}
          <div className="flex flex-wrap gap-1">
            {RESOURCE_TYPES.map((rt) => (
              <button key={rt} onClick={() => { setResourceType(rt); setYaml('') }}
                className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${resourceType === rt ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:bg-muted'}`}>
                {rt}
              </button>
            ))}
          </div>

          {/* Deployment */}
          {resourceType === 'Deployment' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[{ k: 'name', label: 'Name', p: 'my-app' }, { k: 'namespace', label: 'Namespace', p: 'default' }, { k: 'image', label: 'Image', p: 'nginx:latest' }, { k: 'containerPort', label: 'Container Port', p: '80' }].map(({ k, label, p }) => (
                  <div key={k} className="space-y-1">
                    <label className="text-xs text-muted-foreground">{label}</label>
                    <Input value={String((dep as unknown as Record<string, unknown>)[k])} onChange={(e) => depUpdate(k as keyof DeploymentConfig, e.target.value)} placeholder={p} className="font-mono text-sm" />
                  </div>
                ))}
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Replicas</label>
                  <Input type="number" min={1} value={dep.replicas} onChange={(e) => depUpdate('replicas', parseInt(e.target.value, 10) || 1)} className="font-mono text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[{ k: 'cpuRequest', label: 'CPU Request', p: '100m' }, { k: 'memRequest', label: 'Memory Request', p: '128Mi' }, { k: 'cpuLimit', label: 'CPU Limit', p: '500m' }, { k: 'memLimit', label: 'Memory Limit', p: '512Mi' }].map(({ k, label, p }) => (
                  <div key={k} className="space-y-1">
                    <label className="text-xs text-muted-foreground">{label}</label>
                    <Input value={String((dep as unknown as Record<string, unknown>)[k])} onChange={(e) => depUpdate(k as keyof DeploymentConfig, e.target.value)} placeholder={p} className="font-mono text-sm" />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Environment Variables</label>
                {dep.envVars.map((ev, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input value={ev.key} onChange={(e) => { const evs = [...dep.envVars]; evs[i] = { ...evs[i], key: e.target.value }; setDep((d) => ({ ...d, envVars: evs })) }} placeholder="KEY" className="font-mono text-sm" />
                    <Input value={ev.value} onChange={(e) => { const evs = [...dep.envVars]; evs[i] = { ...evs[i], value: e.target.value }; setDep((d) => ({ ...d, envVars: evs })) }} placeholder="value" className="font-mono text-sm" />
                    {dep.envVars.length > 1 && (
                      <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => setDep((d) => ({ ...d, envVars: d.envVars.filter((_, j) => j !== i) }))}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setDep((d) => ({ ...d, envVars: [...d.envVars, { key: '', value: '' }] }))}>
                  <Plus className="h-3.5 w-3.5" />Add Variable
                </Button>
              </div>
            </div>
          )}

          {/* Service */}
          {resourceType === 'Service' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[{ k: 'name', label: 'Service Name', p: 'my-service' }, { k: 'namespace', label: 'Namespace', p: 'default' }, { k: 'port', label: 'Port', p: '80' }, { k: 'targetPort', label: 'Target Port', p: '80' }, { k: 'selector', label: 'Selector (app label)', p: 'my-app' }].map(({ k, label, p }) => (
                <div key={k} className="space-y-1">
                  <label className="text-xs text-muted-foreground">{label}</label>
                  <Input value={(svc as unknown as Record<string, string>)[k]} onChange={(e) => svcUpdate(k as keyof ServiceConfig, e.target.value)} placeholder={p} className="font-mono text-sm" />
                </div>
              ))}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Service Type</label>
                <select value={svc.type} onChange={(e) => svcUpdate('type', e.target.value)}
                  className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring">
                  {['ClusterIP', 'NodePort', 'LoadBalancer'].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Ingress */}
          {resourceType === 'Ingress' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[{ k: 'name', label: 'Ingress Name', p: 'my-ingress' }, { k: 'namespace', label: 'Namespace', p: 'default' }, { k: 'host', label: 'Host', p: 'example.com' }, { k: 'path', label: 'Path', p: '/' }, { k: 'serviceName', label: 'Service Name', p: 'my-service' }, { k: 'servicePort', label: 'Service Port', p: '80' }].map(({ k, label, p }) => (
                  <div key={k} className="space-y-1">
                    <label className="text-xs text-muted-foreground">{label}</label>
                    <Input value={(ing as unknown as Record<string, string | boolean>)[k] as string} onChange={(e) => ingUpdate(k as keyof IngressConfig, e.target.value)} placeholder={p} className="font-mono text-sm" />
                  </div>
                ))}
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={ing.tlsEnabled} onChange={(e) => ingUpdate('tlsEnabled', e.target.checked)} className="rounded" />
                Enable TLS
              </label>
            </div>
          )}

          {/* Namespace */}
          {resourceType === 'Namespace' && (
            <div className="space-y-1 max-w-xs">
              <label className="text-xs text-muted-foreground">Namespace Name</label>
              <Input value={ns.name} onChange={(e) => setNs({ name: e.target.value })} placeholder="my-namespace" className="font-mono text-sm" />
            </div>
          )}

          {/* ConfigMap */}
          {resourceType === 'ConfigMap' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">ConfigMap Name</label>
                  <Input value={cm.name} onChange={(e) => setCm((c) => ({ ...c, name: e.target.value }))} placeholder="my-config" className="font-mono text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Namespace</label>
                  <Input value={cm.namespace} onChange={(e) => setCm((c) => ({ ...c, namespace: e.target.value }))} placeholder="default" className="font-mono text-sm" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Data (KEY=value, one per line)</label>
                <textarea value={cm.data} onChange={(e) => setCm((c) => ({ ...c, data: e.target.value }))}
                  placeholder="APP_ENV=production&#10;DEBUG=false"
                  className="w-full h-24 resize-none rounded-md border border-border bg-background p-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
          )}

          {/* Job */}
          {resourceType === 'Job' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[{ k: 'name', label: 'Job Name', p: 'my-job' }, { k: 'namespace', label: 'Namespace', p: 'default' }, { k: 'image', label: 'Image', p: 'busybox:latest' }, { k: 'command', label: 'Command', p: 'echo hello' }].map(({ k, label, p }) => (
                <div key={k} className="space-y-1">
                  <label className="text-xs text-muted-foreground">{label}</label>
                  <Input value={(job as unknown as Record<string, string>)[k]} onChange={(e) => setJob((j) => ({ ...j, [k]: e.target.value }))} placeholder={p} className="font-mono text-sm" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {yaml && (
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">{resourceType.toLowerCase()}.yaml</CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => copy(yaml)}>
                {copied ? <><Check className="h-3 w-3 text-green-500" />Copied</> : <><Copy className="h-3 w-3" />Copy</>}
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={handleDownload}>
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
