import { Link } from 'react-router-dom'
import { Terminal, Github, Twitter } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const FOOTER_TOOLS = [
  { name: 'DNS Lookup', href: '/tools/dns-lookup' },
  { name: 'MX Lookup', href: '/tools/mx-lookup' },
  { name: 'SPF Checker', href: '/tools/spf-checker' },
  { name: 'DKIM Checker', href: '/tools/dkim-checker' },
  { name: 'DMARC Checker', href: '/tools/dmarc-checker' },
  { name: 'SSL Checker', href: '/tools/ssl-checker' },
  { name: 'CIDR Calculator', href: '/tools/cidr-calculator' },
  { name: 'JSON Formatter', href: '/tools/json-formatter' },
]

const FOOTER_COMPANY = [
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
  { name: 'Tools', href: '/tools' },
]

const FOOTER_LEGAL = [
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms of Service', href: '/terms' },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2 font-bold">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <Terminal className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-bold">DevOpsTools</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Free tools for developers, DevOps engineers and system administrators.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Tools */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Tools</h3>
            <ul className="space-y-2">
              {FOOTER_TOOLS.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="space-y-2">
              {FOOTER_COMPANY.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="space-y-2">
              {FOOTER_LEGAL.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2026 DevOpsTools. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            All tools are provided for informational purposes. Results may vary.
          </p>
        </div>
      </div>
    </footer>
  )
}
