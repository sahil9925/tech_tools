import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import * as Icons from 'lucide-react'

interface ToolHeaderProps {
  icon: string
  name: string
  description: string
  category: string
  categoryColor?: string
}

export function ToolHeader({ icon, name, description, category, categoryColor }: ToolHeaderProps) {
  const Icon = (Icons as unknown as Record<string, LucideIcon>)[icon] ?? Icons.Wrench

  return (
    <div className="flex items-start gap-4">
      <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-background', categoryColor)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-bold text-foreground">{name}</h1>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{category}</span>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
