export interface KeyConcept {
  term: string
  explanation: string
}

export interface PracticalExample {
  title: string
  input: string
  output?: string
  explanation: string
}

export interface ResultField {
  name: string
  type?: string
  description: string
}

export interface CommonMistake {
  title: string
  description: string
  badExample?: string
  goodExample?: string
}

export interface TroubleshootingItem {
  problem: string
  cause: string
  solution: string
}

export interface TechnicalReference {
  title: string
  url?: string
  description: string
}

export interface FAQItem {
  question: string
  answer: string
}

export interface ToolGuide {
  toolId: string
  introduction: string
  whatIsIt: {
    title: string
    content: string[]
    keyConcepts?: KeyConcept[]
  }
  howItWorks: {
    title: string
    steps: string[]
    technicalDetails?: string
  }
  howToUse: {
    title: string
    steps: string[]
  }
  examples: PracticalExample[]
  resultExplanation: {
    title: string
    description?: string
    fields: ResultField[]
  }
  commonMistakes: CommonMistake[]
  bestPractices: string[]
  useCases: { title: string; description: string }[]
  troubleshooting: TroubleshootingItem[]
  securityPrivacy?: {
    isLocalProcessing: boolean
    details: string
    recommendations?: string[]
  }
  faq: FAQItem[]
  technicalReferences?: TechnicalReference[]
  summary: string
}
