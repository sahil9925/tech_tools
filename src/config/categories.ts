import type { Category, ToolCategory } from '@/types'

export const CATEGORIES: Category[] = [
  {
    id: 'dns-networking',
    name: 'DNS & Networking',
    description: 'Check DNS records, domains and network configuration.',
    icon: 'Globe',
    color: 'blue',
  },
  {
    id: 'email-deliverability',
    name: 'Email & Deliverability',
    description: 'Validate SPF, DKIM and DMARC configuration.',
    icon: 'Mail',
    color: 'purple',
  },
  {
    id: 'ssl-security',
    name: 'SSL & Security',
    description: 'Inspect SSL certificates and security configuration.',
    icon: 'Shield',
    color: 'green',
  },
  {
    id: 'developer-utilities',
    name: 'Developer Utilities',
    description: 'Useful utilities for everyday development.',
    icon: 'Code2',
    color: 'orange',
  },
  {
    id: 'networking',
    name: 'Networking',
    description: 'IP address and subnet calculators for network planning.',
    icon: 'Network',
    color: 'cyan',
  },
  {
    id: 'data-developer',
    name: 'Data & Developer',
    description: 'Format, validate and convert JSON, YAML, XML and CSV data.',
    icon: 'Braces',
    color: 'indigo',
  },
  {
    id: 'security-developer',
    name: 'Security & Developer',
    description: 'Encode, decode, hash and inspect security-related data.',
    icon: 'KeyRound',
    color: 'red',
  },
  {
    id: 'developer',
    name: 'Developer',
    description: 'Essential developer tools: regex, diff, cron, permissions.',
    icon: 'Terminal',
    color: 'teal',
  },
  {
    id: 'devops',
    name: 'DevOps',
    description: 'Generate Docker Compose and Kubernetes YAML configurations.',
    icon: 'Container',
    color: 'amber',
  },
]

export const CATEGORY_COLORS: Record<ToolCategory, { bg: string; text: string; border: string; icon: string }> = {
  'DNS & Networking': {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
  },
  'Email & Deliverability': {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    icon: 'text-purple-600 dark:text-purple-400',
  },
  'SSL & Security': {
    bg: 'bg-green-50 dark:bg-green-950/30',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
    icon: 'text-green-600 dark:text-green-400',
  },
  'Developer Utilities': {
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800',
    icon: 'text-orange-600 dark:text-orange-400',
  },
  'Networking': {
    bg: 'bg-cyan-50 dark:bg-cyan-950/30',
    text: 'text-cyan-700 dark:text-cyan-400',
    border: 'border-cyan-200 dark:border-cyan-800',
    icon: 'text-cyan-600 dark:text-cyan-400',
  },
  'Data & Developer': {
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    text: 'text-indigo-700 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-800',
    icon: 'text-indigo-600 dark:text-indigo-400',
  },
  'Security & Developer': {
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-600 dark:text-red-400',
  },
  'Developer': {
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    text: 'text-teal-700 dark:text-teal-400',
    border: 'border-teal-200 dark:border-teal-800',
    icon: 'text-teal-600 dark:text-teal-400',
  },
  'DevOps': {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'text-amber-600 dark:text-amber-400',
  },
}
