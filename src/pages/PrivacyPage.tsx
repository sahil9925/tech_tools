import { SEOHead } from '@/components/seo/SEOHead'

export function PrivacyPage() {
  return (
    <>
      <SEOHead
        title="Privacy Policy | DevOpsTools"
        description="DevOpsTools privacy policy. We respect your privacy and are committed to protecting your personal data."
        canonical="/privacy"
      />
      <div className="container mx-auto max-w-3xl px-4 py-12 prose prose-sm dark:prose-invert max-w-none">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm mb-8">Last updated: January 2026</p>

        <div className="space-y-6 text-sm text-foreground">
          <section>
            <h2 className="text-lg font-semibold mb-2">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              DevOpsTools is designed to be privacy-friendly. Many of our tools operate entirely within your browser and send no data to our servers.
              For tools that require server-side lookups (DNS, SSL, email checks), we process only the domain or query you submit. We do not store this query data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">2. Client-Side Tools</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tools such as the CIDR Calculator and JSON Formatter operate completely within your browser. No data is transmitted to any server.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">3. Cookies & Local Storage</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use browser localStorage only to remember your theme preference (dark/light mode). We do not use tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">4. Analytics</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may use privacy-respecting analytics (such as page view counts) to understand how the site is used. We do not sell this data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">5. Third Parties</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell, trade, or otherwise transfer your information to third parties. We use Google Fonts for typography which may log requests.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">6. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this privacy policy, contact us at <a href="mailto:privacy@devopstools.io" className="text-primary hover:underline">privacy@devopstools.io</a>.
            </p>
          </section>
        </div>
      </div>
    </>
  )
}
