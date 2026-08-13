import { Routes, Route } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'

// Pages
import { HomePage } from '@/pages/HomePage'
import { ToolsPage } from '@/pages/ToolsPage'
import { AboutPage } from '@/pages/AboutPage'
import { ContactPage } from '@/pages/ContactPage'
import { PrivacyPage } from '@/pages/PrivacyPage'
import { TermsPage } from '@/pages/TermsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

// ── Existing tool pages ────────────────────────────────────────────────────────
import { DNSLookupPage } from '@/pages/tools/DNSLookupPage'
import { MXLookupPage } from '@/pages/tools/MXLookupPage'
import { TXTLookupPage } from '@/pages/tools/TXTLookupPage'
import { CNAMELookupPage } from '@/pages/tools/CNAMELookupPage'
import { SPFCheckerPage } from '@/pages/tools/SPFCheckerPage'
import { DKIMCheckerPage } from '@/pages/tools/DKIMCheckerPage'
import { DMARCCheckerPage } from '@/pages/tools/DMARCCheckerPage'
import { SSLCheckerPage } from '@/pages/tools/SSLCheckerPage'
import { CIDRCalculatorPage } from '@/pages/tools/CIDRCalculatorPage'
import { JSONFormatterPage } from '@/pages/tools/JSONFormatterPage'

// ── New tool pages ─────────────────────────────────────────────────────────────
// Networking
import { SubnetCalculatorPage } from '@/pages/tools/SubnetCalculatorPage'
import { IPv4CalculatorPage } from '@/pages/tools/IPv4CalculatorPage'
import { IPv6CalculatorPage } from '@/pages/tools/IPv6CalculatorPage'
import { IPRangeCalculatorPage } from '@/pages/tools/IPRangeCalculatorPage'
// Data & Developer
import { JSONValidatorPage } from '@/pages/tools/JSONValidatorPage'
import { JSONMinifierPage } from '@/pages/tools/JSONMinifierPage'
import { JSONYAMLPage } from '@/pages/tools/JSONYAMLPage'
import { JSONCSVPage } from '@/pages/tools/JSONCSVPage'
import { YAMLValidatorPage } from '@/pages/tools/YAMLValidatorPage'
import { XMLFormatterPage } from '@/pages/tools/XMLFormatterPage'
// Security & Developer
import { JWTDecoderPage } from '@/pages/tools/JWTDecoderPage'
import { HashGeneratorPage } from '@/pages/tools/HashGeneratorPage'
import { Base64Page } from '@/pages/tools/Base64Page'
import { URLEncoderPage } from '@/pages/tools/URLEncoderPage'
import { RegexTesterPage } from '@/pages/tools/RegexTesterPage'
// Developer
import { DiffCheckerPage } from '@/pages/tools/DiffCheckerPage'
import { CronGeneratorPage } from '@/pages/tools/CronGeneratorPage'
import { ChmodCalculatorPage } from '@/pages/tools/ChmodCalculatorPage'
// DevOps
import { DockerComposeGeneratorPage } from '@/pages/tools/DockerComposeGeneratorPage'
import { KubernetesGeneratorPage } from '@/pages/tools/KubernetesGeneratorPage'

export default function App() {
  return (
    <RootLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tools" element={<ToolsPage />} />

        {/* Existing tools */}
        <Route path="/tools/dns-lookup" element={<DNSLookupPage />} />
        <Route path="/tools/mx-lookup" element={<MXLookupPage />} />
        <Route path="/tools/txt-lookup" element={<TXTLookupPage />} />
        <Route path="/tools/cname-lookup" element={<CNAMELookupPage />} />
        <Route path="/tools/spf-checker" element={<SPFCheckerPage />} />
        <Route path="/tools/dkim-checker" element={<DKIMCheckerPage />} />
        <Route path="/tools/dmarc-checker" element={<DMARCCheckerPage />} />
        <Route path="/tools/ssl-checker" element={<SSLCheckerPage />} />
        <Route path="/tools/cidr-calculator" element={<CIDRCalculatorPage />} />
        <Route path="/tools/json-formatter" element={<JSONFormatterPage />} />

        {/* New: Networking */}
        <Route path="/tools/subnet-calculator" element={<SubnetCalculatorPage />} />
        <Route path="/tools/ipv4-calculator" element={<IPv4CalculatorPage />} />
        <Route path="/tools/ipv6-calculator" element={<IPv6CalculatorPage />} />
        <Route path="/tools/ip-range-calculator" element={<IPRangeCalculatorPage />} />

        {/* New: Data & Developer */}
        <Route path="/tools/json-validator" element={<JSONValidatorPage />} />
        <Route path="/tools/json-minifier" element={<JSONMinifierPage />} />
        <Route path="/tools/json-yaml" element={<JSONYAMLPage />} />
        <Route path="/tools/json-csv" element={<JSONCSVPage />} />
        <Route path="/tools/yaml-validator" element={<YAMLValidatorPage />} />
        <Route path="/tools/xml-formatter" element={<XMLFormatterPage />} />

        {/* New: Security & Developer */}
        <Route path="/tools/jwt-decoder" element={<JWTDecoderPage />} />
        <Route path="/tools/hash-generator" element={<HashGeneratorPage />} />
        <Route path="/tools/base64" element={<Base64Page />} />
        <Route path="/tools/url-encoder" element={<URLEncoderPage />} />
        <Route path="/tools/regex-tester" element={<RegexTesterPage />} />

        {/* New: Developer */}
        <Route path="/tools/diff-checker" element={<DiffCheckerPage />} />
        <Route path="/tools/cron-generator" element={<CronGeneratorPage />} />
        <Route path="/tools/chmod-calculator" element={<ChmodCalculatorPage />} />

        {/* New: DevOps */}
        <Route path="/tools/docker-compose-generator" element={<DockerComposeGeneratorPage />} />
        <Route path="/tools/kubernetes-generator" element={<KubernetesGeneratorPage />} />

        {/* Static pages */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </RootLayout>
  )
}
