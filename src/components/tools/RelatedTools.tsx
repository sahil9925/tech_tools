import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Tool } from '@/types'
import { CATEGORY_COLORS } from '@/config/categories'

interface RelatedToolsProps {
  tools: Tool[]
}

export function RelatedTools({ tools }: RelatedToolsProps) {
  if (tools.length === 0) return null

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold">Related Tools</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tools.map((tool) => {
          const Icon = (Icons as unknown as Record<string, LucideIcon>)[tool.icon] ?? Icons.Wrench
          const colors = CATEGORY_COLORS[tool.category]

          return (
            <Link
              key={tool.id}
              to={tool.slug}
              className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-accent/50 transition-all duration-200 group"
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${colors.bg} ${colors.border} border`}>
                <Icon className={`h-4 w-4 ${colors.icon}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{tool.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{tool.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 mt-1 transition-colors" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
