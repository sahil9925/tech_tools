import type { ToolGuide } from '@/types/guide'
import { dnsGuides } from './dns'
import { networkingGuides } from './networking'
import { dataGuides } from './data'
import { securityGuides } from './security'
import { developerGuides } from './developer'
import { devopsGuides } from './devops'

export const TOOL_GUIDES: Record<string, ToolGuide> = {
  ...dnsGuides,
  ...networkingGuides,
  ...dataGuides,
  ...securityGuides,
  ...developerGuides,
  ...devopsGuides,
}

export function getToolGuide(toolId: string): ToolGuide | undefined {
  return TOOL_GUIDES[toolId]
}
