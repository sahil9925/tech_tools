import React from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Code2,
  Terminal,
  Cpu,
  Layers,
  Wrench,
  Check,
  X
} from 'lucide-react'
import type { ToolGuide } from '@/types/guide'
import { getRelatedTools } from '@/config/tools'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ToolGuideSectionProps {
  guide: ToolGuide
}

export function ToolGuideSection({ guide }: ToolGuideSectionProps) {
  const relatedTools = getRelatedTools(guide.toolId)

  // Generate Google FAQ Schema structured data
  const faqSchema = guide.faq && guide.faq.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': guide.faq.map(f => ({
      '@type': 'Question',
      'name': f.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': f.answer
      }
    }))
  } : null

  return (
    <div className="mt-12 space-y-10 border-t border-border pt-10 text-foreground">
      {/* Inject FAQ Schema JSON-LD */}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* 1. Introduction */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary shrink-0" />
          About this Tool
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground bg-card p-4 rounded-lg border border-border">
          {guide.introduction}
        </p>
      </section>

      {/* 2. What Is It */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Cpu className="h-5 w-5 text-primary shrink-0" />
          {guide.whatIsIt.title}
        </h2>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          {guide.whatIsIt.content.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        {guide.whatIsIt.keyConcepts && guide.whatIsIt.keyConcepts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {guide.whatIsIt.keyConcepts.map((concept, idx) => (
              <div key={idx} className="p-3 rounded-md bg-muted/40 border border-border/60 text-xs">
                <span className="font-semibold text-foreground block mb-1">{concept.term}</span>
                <span className="text-muted-foreground">{concept.explanation}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. How It Works */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary shrink-0" />
          {guide.howItWorks.title}
        </h2>
        <ol className="space-y-2 text-sm text-muted-foreground">
          {guide.howItWorks.steps.map((step, idx) => (
            <li key={idx} className="flex items-start gap-3 bg-card p-3 rounded-md border border-border/50">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-mono text-xs font-bold">
                {idx + 1}
              </span>
              <span className="pt-0.5 leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
        {guide.howItWorks.technicalDetails && (
          <p className="text-xs text-muted-foreground italic bg-muted/30 p-2.5 rounded border border-border/40">
            💡 {guide.howItWorks.technicalDetails}
          </p>
        )}
      </section>

      {/* 4. How To Use */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Wrench className="h-5 w-5 text-primary shrink-0" />
          {guide.howToUse.title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {guide.howToUse.steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg border border-border bg-card/60">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span className="text-xs font-medium text-foreground">{step}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Practical Examples */}
      {guide.examples && guide.examples.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary shrink-0" />
            Practical Examples
          </h2>
          <div className="space-y-4">
            {guide.examples.map((ex, idx) => (
              <Card key={idx} className="overflow-hidden border-border">
                <CardHeader className="py-2.5 px-4 bg-muted/30 border-b border-border">
                  <CardTitle className="text-xs font-semibold text-foreground">{ex.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2 font-mono text-xs">
                  <div>
                    <span className="text-muted-foreground font-sans block mb-1">Input:</span>
                    <pre className="p-2.5 rounded bg-background border border-border overflow-x-auto text-foreground">{ex.input}</pre>
                  </div>
                  {ex.output && (
                    <div>
                      <span className="text-muted-foreground font-sans block mb-1">Output / Result:</span>
                      <pre className="p-2.5 rounded bg-primary/5 border border-primary/20 text-primary overflow-x-auto">{ex.output}</pre>
                    </div>
                  )}
                  <p className="font-sans text-xs text-muted-foreground pt-1 leading-relaxed">{ex.explanation}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 6. Result Explanation */}
      {guide.resultExplanation && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary shrink-0" />
            {guide.resultExplanation.title}
          </h2>
          {guide.resultExplanation.description && (
            <p className="text-xs text-muted-foreground">{guide.resultExplanation.description}</p>
          )}
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 font-semibold text-foreground">
                  <th className="py-2.5 px-3">Field Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {guide.resultExplanation.fields.map((f, idx) => (
                  <tr key={idx} className="hover:bg-muted/20">
                    <td className="py-2 px-3 font-mono font-medium text-foreground">{f.name}</td>
                    <td className="py-2 px-3 font-mono text-muted-foreground">{f.type ?? 'String'}</td>
                    <td className="py-2 px-3 text-muted-foreground leading-relaxed">{f.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 7. Common Mistakes */}
      {guide.commonMistakes && guide.commonMistakes.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
            Common Mistakes to Avoid
          </h2>
          <div className="space-y-3">
            {guide.commonMistakes.map((mistake, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-amber-500/20 bg-amber-500/5 space-y-2 text-xs">
                <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                  <span>⚠️</span> {mistake.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">{mistake.description}</p>
                {(mistake.badExample || mistake.goodExample) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono">
                    {mistake.badExample && (
                      <div className="p-2 rounded bg-destructive/10 border border-destructive/20 text-destructive text-[11px]">
                        <span className="font-sans font-bold block text-[10px] text-destructive uppercase mb-0.5 flex items-center gap-1">
                          <X className="h-3 w-3" /> Incorrect
                        </span>
                        {mistake.badExample}
                      </div>
                    )}
                    {mistake.goodExample && (
                      <div className="p-2 rounded bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-[11px]">
                        <span className="font-sans font-bold block text-[10px] text-green-600 dark:text-green-400 uppercase mb-0.5 flex items-center gap-1">
                          <Check className="h-3 w-3" /> Correct
                        </span>
                        {mistake.goodExample}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. Best Practices */}
      {guide.bestPractices && guide.bestPractices.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
            Best Practices
          </h2>
          <ul className="space-y-2 text-xs text-muted-foreground">
            {guide.bestPractices.map((bp, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-md bg-card border border-border">
                <span className="text-green-500 font-bold shrink-0">✓</span>
                <span className="leading-relaxed text-foreground">{bp}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 9. Real-World Use Cases */}
      {guide.useCases && guide.useCases.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary shrink-0" />
            Real-World DevOps & Engineering Use Cases
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {guide.useCases.map((uc, idx) => (
              <div key={idx} className="p-3.5 rounded-lg border border-border bg-card space-y-1 text-xs">
                <span className="font-semibold text-foreground block">{uc.title}</span>
                <span className="text-muted-foreground leading-relaxed block">{uc.description}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 10. Troubleshooting */}
      {guide.troubleshooting && guide.troubleshooting.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary shrink-0" />
            Troubleshooting Guide
          </h2>
          <div className="space-y-3">
            {guide.troubleshooting.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-lg border border-border bg-card space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-destructive font-semibold">
                  <span>Issue:</span> {item.problem}
                </div>
                <div className="text-muted-foreground">
                  <strong className="text-foreground">Possible Cause:</strong> {item.cause}
                </div>
                <div className="text-green-600 dark:text-green-400">
                  <strong className="text-foreground">Solution:</strong> {item.solution}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 11. Security & Privacy */}
      {guide.securityPrivacy && (
        <section className="p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-2 text-xs">
          <h2 className="font-semibold text-foreground text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            Security & Privacy Considerations
          </h2>
          <p className="text-muted-foreground leading-relaxed">{guide.securityPrivacy.details}</p>
          {guide.securityPrivacy.isLocalProcessing && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-green-500/10 text-green-600 dark:text-green-400 font-medium text-[11px] border border-green-500/20">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              100% Client-Side Processing (No server uploads)
            </div>
          )}
        </section>
      )}

      {/* 12. FAQ Section */}
      {guide.faq && guide.faq.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary shrink-0" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {guide.faq.map((f, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-border bg-card space-y-1.5 text-xs">
                <h3 className="font-semibold text-foreground text-sm">{f.question}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 13. Technical References */}
      {guide.technicalReferences && guide.technicalReferences.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Technical References & Standards
          </h2>
          <div className="flex flex-wrap gap-2">
            {guide.technicalReferences.map((ref, idx) => (
              <a
                key={idx}
                href={ref.url ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-card text-xs font-medium text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <span>{ref.title}</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* 14. Related Tools */}
      {relatedTools.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold tracking-tight">Related Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {relatedTools.slice(0, 3).map((tool) => (
              <Link
                key={tool.id}
                to={tool.slug}
                className="p-3 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors space-y-1 text-xs block"
              >
                <span className="font-semibold text-foreground block">{tool.name}</span>
                <span className="text-muted-foreground line-clamp-2">{tool.description}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 15. Summary */}
      <section className="p-4 rounded-lg border border-border bg-muted/30 text-xs space-y-1">
        <span className="font-semibold text-foreground block">Summary</span>
        <p className="text-muted-foreground leading-relaxed">{guide.summary}</p>
      </section>
    </div>
  )
}
