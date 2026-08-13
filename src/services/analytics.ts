/**
 * Analytics abstraction layer.
 * Currently logs to console in development.
 * Replace implementations with real analytics (GA4, PostHog, Plausible, etc.) in Phase 2.
 */

const isDev = import.meta.env.DEV

function log(event: string, data?: Record<string, string>) {
  if (isDev) {
    console.debug(`[Analytics] ${event}`, data ?? '')
  }
  // Future: send to analytics provider
  // analyticsProvider.track(event, data)
}

export function trackToolView(toolId: string): void {
  log('tool_view', { toolId })
}

export function trackToolUsage(toolId: string): void {
  log('tool_usage', { toolId })
}

export function trackToolSuccess(toolId: string): void {
  log('tool_success', { toolId })
}

export function trackToolError(toolId: string, error?: string): void {
  log('tool_error', { toolId, error: error ?? 'unknown' })
}

export function trackSearch(query: string, resultCount: number): void {
  log('search', { query, resultCount: String(resultCount) })
}

export function trackPageView(path: string): void {
  log('page_view', { path })
}
