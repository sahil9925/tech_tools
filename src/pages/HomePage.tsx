import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ArrowRight, Zap, Shield, Cpu, Lock, CheckCircle2 } from 'lucide-react'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card3D } from '@/components/ui/Card3D'
import { HeroBackground3D } from '@/components/ui/HeroBackground3D'
import { SEOHead } from '@/components/seo/SEOHead'
import { searchTools, getPopularTools } from '@/config/tools'
import { CATEGORIES, CATEGORY_COLORS } from '@/config/categories'
import { getToolsByCategory } from '@/config/tools'
import { trackSearch } from '@/services/analytics'
import type { Tool } from '@/types'

function ToolCard({ tool }: { tool: Tool }) {
  const Icon = (Icons as unknown as Record<string, LucideIcon>)[tool.icon] ?? Icons.Wrench
  const colors = CATEGORY_COLORS[tool.category]

  return (
    <Card3D intensity={10}>
      <Link
        to={tool.slug}
        className="group flex flex-col p-5 rounded-xl border border-border/80 bg-card/90 backdrop-blur-sm hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full"
      >
        <div className="flex items-start justify-between mb-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${colors.bg} ${colors.border} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`h-5 w-5 ${colors.icon}`} />
          </div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
            {tool.category.split(' ')[0]}
          </span>
        </div>
        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
          {tool.name}
          {tool.isNew && (
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-primary/20 text-primary border border-primary/30 uppercase">
              NEW
            </span>
          )}
        </h3>
        <p className="text-xs text-muted-foreground mt-1.5 flex-1 leading-relaxed">{tool.description}</p>
        <div className="flex items-center gap-1 mt-4 text-xs text-primary font-medium">
          Open Tool <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
    </Card3D>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const popularTools = getPopularTools()

  const searchResults = query.trim() ? searchTools(query) : []

  function handleSearch(q: string) {
    setQuery(q)
    if (q.trim()) trackSearch(q, searchResults.length)
  }

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault()
    if (query.trim()) navigate(`/tools?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <>
      <SEOHead
        title="DevOpsTools — Free High-Performance Client-Side DevOps & Cloud Tools"
        description="Free, secure client-side DevOps, networking, DNS, email, SSL, and developer utilities. 100% browser-based data privacy."
        canonical="/"
      />

      {/* Hero Section with 3D Background */}
      <section className="relative bg-card/20 overflow-hidden">
        <HeroBackground3D />

        <div className="container relative z-10 mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-3.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm animate-pulse">
              <Zap className="h-3.5 w-3.5 text-primary" />
              100% Client-Side • Zero Server Uploads • Free Forever
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
              High-Performance{' '}
              <span className="bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent">
                DevOps & Cloud Tools
              </span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Complete suite of 30+ browser-native utilities for network engineers, developers, system administrators, and security specialists.
            </p>

            {/* Interactive Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative max-w-xl mx-auto pt-2">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors" />
                <Input
                  id="hero-search"
                  placeholder='Search 30+ tools... e.g. "DNS", "Subnet", "JWT", "Docker"'
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-11 h-12 pr-4 text-sm bg-background/90 backdrop-blur-md border-border/80 rounded-xl shadow-lg focus-visible:ring-primary/40"
                />
              </div>

              {/* Search dropdown */}
              {query.trim() && (
                <div className="absolute top-16 left-0 right-0 z-50 rounded-xl border border-border bg-popover/95 backdrop-blur-md shadow-2xl overflow-hidden text-left animate-in fade-in slide-in-from-top-2">
                  {searchResults.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-muted-foreground text-center">No tools found for "{query}"</p>
                  ) : (
                    <>
                      {searchResults.slice(0, 5).map((tool) => (
                        <Link
                          key={tool.id}
                          to={tool.slug}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors border-b border-border/50 last:border-0"
                          onClick={() => setQuery('')}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">{tool.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{tool.category}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </Link>
                      ))}
                      {searchResults.length > 5 && (
                        <button
                          className="w-full px-4 py-2.5 text-xs text-primary font-medium text-center hover:bg-accent border-t border-border"
                          onClick={() => navigate(`/tools?q=${encodeURIComponent(query.trim())}`)}
                        >
                          View all {searchResults.length} matching tools →
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </form>

            <div className="flex items-center justify-center gap-4 flex-wrap pt-2">
              <Button asChild size="lg" className="gap-2 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                <Link to="/tools">Explore All 30 Tools <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl border-border hover:bg-card">
                <a href="#popular">View Popular Tools</a>
              </Button>
            </div>

            {/* 3D Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-8">
              <Card3D intensity={6}>
                <div className="p-3 rounded-lg border border-border/60 bg-card/60 backdrop-blur-sm text-center space-y-0.5">
                  <div className="text-xl font-extrabold text-primary">30+</div>
                  <div className="text-[11px] font-medium text-muted-foreground">Client-Side Tools</div>
                </div>
              </Card3D>

              <Card3D intensity={6}>
                <div className="p-3 rounded-lg border border-border/60 bg-card/60 backdrop-blur-sm text-center space-y-0.5">
                  <div className="text-xl font-extrabold text-green-500">100%</div>
                  <div className="text-[11px] font-medium text-muted-foreground">Data Privacy</div>
                </div>
              </Card3D>

              <Card3D intensity={6}>
                <div className="p-3 rounded-lg border border-border/60 bg-card/60 backdrop-blur-sm text-center space-y-0.5">
                  <div className="text-xl font-extrabold text-purple-500">0 ms</div>
                  <div className="text-[11px] font-medium text-muted-foreground">Server Latency</div>
                </div>
              </Card3D>

              <Card3D intensity={6}>
                <div className="p-3 rounded-lg border border-border/60 bg-card/60 backdrop-blur-sm text-center space-y-0.5">
                  <div className="text-xl font-extrabold text-blue-500">Free</div>
                  <div className="text-[11px] font-medium text-muted-foreground">No Registration</div>
                </div>
              </Card3D>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid with 3D Tilt */}
      <section className="container mx-auto max-w-7xl px-4 py-14">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Tool Categories</h2>
          <p className="text-sm text-muted-foreground mt-1">Explore our complete collection organized by domain</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = (Icons as unknown as Record<string, LucideIcon>)[cat.icon] ?? Icons.Wrench
            const colors = CATEGORY_COLORS[cat.name]
            const toolCount = getToolsByCategory(cat.name).length

            return (
              <Card3D key={cat.id} intensity={8}>
                <Link
                  to={`/tools?cat=${encodeURIComponent(cat.name)}`}
                  className="group flex flex-col p-5 rounded-xl border border-border/80 bg-card/90 backdrop-blur-sm hover:border-primary/50 hover:shadow-md transition-all duration-300 h-full"
                >
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${colors.bg} ${colors.border} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-5.5 w-5.5 ${colors.icon}`} />
                  </div>
                  <h3 className="text-base font-semibold group-hover:text-primary transition-colors">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1.5 flex-1 leading-relaxed">{cat.description}</p>
                  <div className="flex items-center justify-between mt-4 text-xs">
                    <span className="font-semibold text-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/50">
                      {toolCount} Tool{toolCount !== 1 ? 's' : ''}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </Card3D>
            )
          })}
        </div>
      </section>

      {/* Popular Tools Grid with 3D Tilt */}
      <section id="popular" className="container mx-auto max-w-7xl px-4 py-8 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Popular Developer & DevOps Tools</h2>
            <p className="text-sm text-muted-foreground mt-1">Frequently used tools by system administrators and cloud engineers</p>
          </div>
          <Button asChild variant="outline" size="sm" className="gap-1.5 rounded-lg border-border">
            <Link to="/tools">View All Tools <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>
    </>
  )
}
