import { SEOHead } from '@/components/seo/SEOHead'

export function TermsPage() {
  return (
    <>
      <SEOHead
        title="Terms of Service | DevOpsTools"
        description="DevOpsTools terms of service. Please read these terms before using our tools and services."
        canonical="/terms"
      />
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground text-sm mb-8">Last updated: January 2026</p>

        <div className="space-y-6 text-sm">
          <section>
            <h2 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By using DevOpsTools, you agree to these terms. If you do not agree, please do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">2. Use of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              DevOpsTools provides tools for informational purposes. Results from our tools (DNS lookups, SSL checks, etc.) are provided as-is and may not always reflect real-time DNS state.
              Do not use these tools for any illegal purpose or to violate any third party's rights.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">3. Accuracy of Results</h2>
            <p className="text-muted-foreground leading-relaxed">
              While we strive for accuracy, results may vary from actual DNS or SSL state due to caching, propagation delays, and other factors.
              Always verify critical configuration with authoritative sources.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">4. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              DevOpsTools is provided "as is" without warranty. We are not liable for any direct, indirect, incidental, or consequential damages arising from use of our tools.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">5. Abuse & Rate Limiting</h2>
            <p className="text-muted-foreground leading-relaxed">
              Automated scraping, excessive requests, or abuse of our tools is prohibited. We reserve the right to block access for users who abuse the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">6. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">7. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Questions? Contact us at <a href="mailto:legal@devopstools.io" className="text-primary hover:underline">legal@devopstools.io</a>.
            </p>
          </section>
        </div>
      </div>
    </>
  )
}
