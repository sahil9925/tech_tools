import { Mail, Github, Twitter } from 'lucide-react'
import { SEOHead } from '@/components/seo/SEOHead'

export function ContactPage() {
  return (
    <>
      <SEOHead
        title="Contact DevOpsTools"
        description="Get in touch with the DevOpsTools team. Report bugs, suggest features, or ask questions."
        canonical="/contact"
      />
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-3">Contact</h1>
        <p className="text-muted-foreground mb-8">
          Have a question, found a bug, or want to suggest a new tool? We'd love to hear from you.
        </p>
        <div className="space-y-4">
          {[
            { icon: Mail, label: 'Email', value: 'hello@devopstools.io', href: 'mailto:hello@devopstools.io' },
            { icon: Github, label: 'GitHub', value: 'github.com/devopstools', href: 'https://github.com' },
            { icon: Twitter, label: 'Twitter', value: '@devopstools', href: 'https://twitter.com' },
          ].map(({ icon: Icon, label, value, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium">{value}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </>
  )
}
