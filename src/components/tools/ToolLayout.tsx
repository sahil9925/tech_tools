import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Breadcrumbs } from './Breadcrumbs'
import { ToolHeader } from './ToolHeader'
import { RelatedTools } from './RelatedTools'
import { FAQSection } from './FAQSection'
import { ToolGuideSection } from './ToolGuideSection'
import { SEOHead } from '@/components/seo/SEOHead'
import { CATEGORY_COLORS } from '@/config/categories'
import { getRelatedTools } from '@/config/tools'
import { getToolGuide } from '@/data/guides'
import { trackToolView } from '@/services/analytics'
import type { Tool } from '@/types'

interface FAQItem {
  question: string
  answer: string
}

interface ToolLayoutProps {
  tool: Tool
  children: ReactNode
  faqs?: FAQItem[]
  howItWorks?: ReactNode
}

export function ToolLayout({ tool, children, faqs, howItWorks }: ToolLayoutProps) {
  const relatedTools = getRelatedTools(tool.id)
  const colors = CATEGORY_COLORS[tool.category]
  const guide = getToolGuide(tool.id)

  useEffect(() => {
    trackToolView(tool.id)
  }, [tool.id])

  return (
    <>
      <SEOHead
        title={tool.seoTitle}
        description={tool.seoDescription}
        canonical={tool.slug}
        ogTitle={tool.seoTitle}
        ogDescription={tool.seoDescription}
      />

      <div className="min-h-screen bg-background">
        {/* Top bar */}
        <div className="border-b border-border bg-card/50">
          <div className="container mx-auto max-w-7xl px-4 py-3">
            <Breadcrumbs
              items={[
                { label: 'Tools', href: '/tools' },
                { label: tool.name },
              ]}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column: tool */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tool header */}
              <ToolHeader
                icon={tool.icon}
                name={tool.name}
                description={tool.description}
                category={tool.category}
                categoryColor={`${colors.bg} ${colors.icon}`}
              />

              {/* Tool interactive interface */}
              {children}

              {/* Comprehensive Educational Guide (if available for tool) */}
              {guide && <ToolGuideSection guide={guide} />}
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">
              {/* How it works short sidebar summary */}
              {howItWorks && (
                <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                  <h2 className="text-sm font-semibold">Quick Guide</h2>
                  <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
                    {howItWorks}
                  </div>
                </div>
              )}

              {/* Related tools sidebar */}
              {relatedTools.length > 0 && <RelatedTools tools={relatedTools} />}
            </div>
          </div>

          {/* Standalone FAQ section if guide FAQ is not rendered */}
          {(!guide || !guide.faq) && faqs && faqs.length > 0 && (
            <div className="mt-10 max-w-3xl">
              <FAQSection faqs={faqs} />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
