import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { cn } from '@/lib/utils'

interface CopyButtonProps {
  value: string
  size?: 'sm' | 'icon'
  className?: string
}

export function CopyButton({ value, size = 'sm', className }: CopyButtonProps) {
  const { copied, copy } = useCopyToClipboard()

  if (size === 'icon') {
    return (
      <button
        onClick={() => copy(value)}
        className={cn(
          'inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors',
          className
        )}
        aria-label="Copy to clipboard"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => copy(value)}
      className={cn('gap-1.5 h-7 px-2 text-xs', className)}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-green-500" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          Copy
        </>
      )}
    </Button>
  )
}
