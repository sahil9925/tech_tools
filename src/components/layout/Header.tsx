import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  Search,
  Sun,
  Moon,
  Menu,
  X,
  Globe,
  ChevronDown,
  Terminal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTheme } from '@/hooks/useTheme'
import { TOOLS } from '@/config/tools'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/tools', label: 'Tools' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { resolvedTheme, setTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(TOOLS.slice(0, 5))

  function handleSearch(q: string) {
    setSearchQuery(q)
    if (!q.trim()) {
      setSearchResults(TOOLS.slice(0, 5))
      return
    }
    const lower = q.toLowerCase()
    setSearchResults(
      TOOLS.filter(
        (t) =>
          t.name.toLowerCase().includes(lower) ||
          t.description.toLowerCase().includes(lower) ||
          t.category.toLowerCase().includes(lower) ||
          t.keywords.some((k) => k.toLowerCase().includes(lower))
      ).slice(0, 6)
    )
  }

  function handleResultClick(slug: string) {
    navigate(slug)
    setSearchOpen(false)
    setSearchQuery('')
    setMobileOpen(false)
  }

  function toggleTheme() {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors"
          onClick={() => setMobileOpen(false)}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <Terminal className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-bold tracking-tight">DevOpsTools</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'px-3 py-1.5 text-sm rounded-md transition-colors',
                location.pathname === link.href || location.pathname.startsWith(link.href + '/')
                  ? 'text-foreground font-medium bg-accent'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex items-center gap-2 text-muted-foreground h-8 px-3 text-xs min-w-[160px] justify-start"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-3.5 w-3.5" />
              Search tools...
              <kbd className="ml-auto font-mono text-[10px] bg-muted px-1 py-0.5 rounded">⌘K</kbd>
            </Button>

            {/* Search panel */}
            {searchOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                />
                <div className="absolute right-0 top-9 z-50 w-80 rounded-lg border border-border bg-popover shadow-lg">
                  <div className="flex items-center border-b border-border px-3">
                    <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Search tools..."
                      className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto py-1">
                    {searchResults.length === 0 ? (
                      <p className="px-4 py-6 text-center text-sm text-muted-foreground">No tools found.</p>
                    ) : (
                      searchResults.map((tool) => (
                        <button
                          key={tool.id}
                          className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-accent transition-colors"
                          onClick={() => handleResultClick(tool.slug)}
                        >
                          <div className="mt-0.5 flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{tool.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{tool.description}</p>
                          </div>
                          <span className="shrink-0 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded mt-0.5">
                            {tool.category.split(' ')[0]}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-3 space-y-1">
            {/* Mobile search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tools..."
                className="pl-9 h-9"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            {searchQuery && (
              <div className="rounded-md border border-border bg-card mb-2 overflow-hidden">
                {searchResults.map((tool) => (
                  <button
                    key={tool.id}
                    className="flex w-full items-start gap-3 px-3 py-2 text-left hover:bg-accent text-sm border-b border-border last:border-0"
                    onClick={() => handleResultClick(tool.slug)}
                  >
                    <span className="font-medium">{tool.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{tool.category.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            )}
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center px-3 py-2 text-sm rounded-md transition-colors',
                  location.pathname === link.href
                    ? 'text-foreground font-medium bg-accent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
