import { Link } from 'react-router-dom'
import { Home, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SEOHead } from '@/components/seo/SEOHead'

export function NotFoundPage() {
  return (
    <>
      <SEOHead
        title="404 - Page Not Found | DevOpsTools"
        description="The page you are looking for does not exist."
      />
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <p className="text-8xl font-bold text-muted-foreground/20 font-mono">404</p>
        <h1 className="text-2xl font-bold mt-4">Page Not Found</h1>
        <p className="text-muted-foreground mt-2 mb-6">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link to="/" className="gap-2"><Home className="h-4 w-4" />Go Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/tools" className="gap-2"><Search className="h-4 w-4" />Browse Tools</Link>
          </Button>
        </div>
      </div>
    </>
  )
}
