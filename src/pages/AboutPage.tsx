import { Terminal, Target, Zap, Users } from 'lucide-react'
import { SEOHead } from '@/components/seo/SEOHead'

export function AboutPage() {
  return (
    <>
      <SEOHead
        title="About DevOpsTools"
        description="Learn about DevOpsTools — free DevOps, cloud, networking, DNS, email, SSL, and developer utilities for engineers and system administrators."
        canonical="/about"
      />
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="space-y-10">
          <div>
            <h1 className="text-3xl font-bold mb-3">About DevOpsTools</h1>
            <p className="text-muted-foreground leading-relaxed">
              DevOpsTools is a collection of free, fast, and reliable tools designed for developers, DevOps engineers, and system administrators.
              We believe that professional-grade tooling should be accessible to everyone, without paywalls or account requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { icon: Zap, title: 'Fast & Reliable', desc: 'Tools are optimized for speed. Client-side tools run instantly in your browser with no server round-trips.' },
              { icon: Target, title: 'Purpose-Built', desc: 'Each tool is designed to do one thing well, with a clear interface that helps you understand the results.' },
              { icon: Users, title: 'For Engineers', desc: 'Built by engineers who use these tools daily. We understand what information matters and how to present it.' },
              { icon: Terminal, title: 'Privacy-Focused', desc: 'Client-side tools never send your data anywhere. Even for server-side checks, we do not store query data.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-5 rounded-lg border border-border bg-card">
                <Icon className="h-5 w-5 text-primary mb-3" />
                <h2 className="font-semibold mb-1">{title}</h2>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              We are building the go-to platform for DevOps and cloud tooling. Starting with simple lookup tools,
              we plan to grow into guides, error databases, infrastructure monitoring, and eventually a full SaaS platform
              for teams managing cloud infrastructure.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">Roadmap</h2>
            <div className="space-y-3">
              {[
                { phase: 'Phase 1', label: 'Now', desc: 'Free tools — DNS, Email, SSL, Developer Utilities' },
                { phase: 'Phase 2', label: 'Coming soon', desc: 'Guides, Error Database, Search improvements' },
                { phase: 'Phase 3', label: 'Planned', desc: 'Backend API with real DNS/SSL checks, caching' },
                { phase: 'Phase 4', label: 'Future', desc: 'User accounts, domain monitoring, email alerts' },
              ].map((item) => (
                <div key={item.phase} className="flex gap-4 items-start p-3 rounded-lg border border-border bg-muted/30">
                  <div className="text-xs font-mono text-muted-foreground w-16 shrink-0 pt-0.5">{item.phase}</div>
                  <div>
                    <span className="text-xs font-medium text-primary">{item.label} — </span>
                    <span className="text-sm text-muted-foreground">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
