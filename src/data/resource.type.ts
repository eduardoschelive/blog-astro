export type ResourceCategory =
  | 'database'
  | 'design'
  | 'devops'
  | 'api'
  | 'hosting'
  | 'monitoring'
  | 'testing'
  | 'documentation'
  | 'productivity'
  | 'security'
  | 'ai'
  | 'other'

export type ResourcePricing = 'free' | 'freemium' | 'paid' | 'open-source'

export interface Resource {
  id: string
  name: string
  url: string
  category: ResourceCategory
  pricing: ResourcePricing
  description: string
  why: string
  tags: string[]
}
