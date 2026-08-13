import { Helmet } from 'react-helmet-async'

interface SEOHeadProps {
  title: string
  description: string
  canonical?: string
  ogTitle?: string
  ogDescription?: string
}

export function SEOHead({ title, description, canonical, ogTitle, ogDescription }: SEOHeadProps) {
  const fullTitle = title.includes('DevOpsTools') ? title : `${title} | DevOpsTools`
  const canonicalUrl = canonical ? `https://devopstools.io${canonical}` : undefined

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:title" content={ogTitle ?? fullTitle} />
      <meta property="og:description" content={ogDescription ?? description} />
      <meta property="og:type" content="website" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:site_name" content="DevOpsTools" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={ogTitle ?? fullTitle} />
      <meta name="twitter:description" content={ogDescription ?? description} />
    </Helmet>
  )
}
