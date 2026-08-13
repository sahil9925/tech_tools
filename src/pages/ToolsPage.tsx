import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, X, ArrowRight } from 'lucide-react'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card3D } from '@/components/ui/Card3D'
import { SEOHead } from '@/components/seo/SEOHead'
import { TOOLS, searchTools } from '@/config/tools'
import { CATEGORIES, CATEGORY_COLORS } from '@/config/categories'
import { trackSearch } from '@/services/analytics'
import type { Tool, ToolCategory } from '@/types'

function ToolCard({ tool }: { tool: Tool }) {
  const Icon = (Icons as Record<string, LucideIcon>)[tool.icon] ?? Icons.Wrench
  const colors = CATEGORY_COLORS[tool.category]

  return (
    <Card3D intensity={6}>
      <Link
        to={tool.slug}
        className="group flex items-start gap-4 p-4 rounded-xl border border-border/80 bg-card/90 backdrop-blur-sm hover:border-primary/50 hover:shadow-md transition-all duration-300 h-full"
      >
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${colors.bg} ${colors.border} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`h-5 w-5 ${colors.icon}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">{tool.name}</h3>
            {tool.isNew && (
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-primary/20 text-primary border border-primary/30 uppercase">
                NEW
              </span>
            )}
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${colors.bg} ${colors.text} ${colors.border}`}>
              {tool.category.split(' ')[0]}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{tool.description}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 mt-1 transition-transform group-hover:translate-x-1" />
      </Link>
    </Card3D>
  )
}

export function ToolsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'all'>(() => {
    const cat = searchParams.get('cat')
    return (cat as ToolCategory) ?? 'all'
  })

  const searched = query.trim() ? searchTools(query) : TOOLS
  const filteredTools = activeCategory === 'all'
    ? searched
    : searched.filter((t) => t.category === activeCategory)

  useEffect(() => {
    const params: Record<string, string> = {}
    if (query) params.q = query
    if (activeCategory !== 'all') params.cat = activeCategory
    setSearchParams(params, { replace: true })
    if (query.trim()) trackSearch(query, filteredTools.length)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, activeCategory])

  function clearFilters() {
    setQuery('')
    setActiveCategory('all')
  }

  return (
    <>
      <SEOHead
        title="All DevOps & Cloud Tools | DevOpsTools"
        description="Browse 30+ free DevOps, cloud, networking, DNS, email, SSL, and developer utilities."
        canonical="/tools"
      />

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">All Tools</h1>
          <p className="text-sm text-muted-foreground mt-1">{TOOLS.length} high-performance client-side tools available</p>
        </div>

        {/* Search + filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="tools-search"
              placeholder="Search tools by name, keyword or category..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-background border-border/80"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Button
              variant={activeCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory('all')}
              className="shrink-0 rounded-lg"
            >
              All
            </Button>
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.name ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(cat.name)}
                className="shrink-0 text-xs rounded-lg"
              >
                {cat.name.split(' ')[0]}
              </Button>
            ))}
          </div>
        </div>

        {/* Results */}
        {filteredTools.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="font-medium text-lg">No matching tools found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or category filter.</p>
            <Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-4">
              Showing {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''}
              {activeCategory !== 'all' && ` in ${activeCategory}`}
              {query && ` matching "${query}"`}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
