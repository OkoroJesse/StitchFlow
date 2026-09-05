// StitchFlow Canonical Subscription Plan System
// Single source of truth for plan identifiers, pricing, limits, and features.

export type CanonicalPlanId = 'basic' | 'designer_pro' | 'fashion_studio'

export interface PlanDefinition {
  id: CanonicalPlanId
  name: string
  nairaPrice: number          // e.g. 3000
  koboAmount: number          // e.g. 300000 (lowest denomination for Paystack)
  formattedPrice: string      // e.g. "₦3,000"
  period: string              // e.g. "/mo"
  tagline: string
  highlight?: boolean
  badge?: string | null
  limits: {
    clients: number
    activeJobs: number
  }
  features: string[]
}

export const CANONICAL_PLANS: Record<CanonicalPlanId, PlanDefinition> = {
  basic: {
    id: 'basic',
    name: 'Basic',
    nairaPrice: 3000,
    koboAmount: 300000,
    formattedPrice: '₦3,000',
    period: '/mo',
    tagline: 'Essential workflow tools for solo tailors',
    limits: {
      clients: 15,
      activeJobs: 10,
    },
    features: [
      'Up to 15 client profiles',
      '10 active projects at a time',
      'Body measurement engine',
      'Professional invoice generator',
      'Client review links',
    ],
  },
  designer_pro: {
    id: 'designer_pro',
    name: 'Designer Pro',
    nairaPrice: 7000,
    koboAmount: 700000,
    formattedPrice: '₦7,000',
    period: '/mo',
    tagline: 'For growing boutique studios & tailors',
    highlight: true,
    badge: 'Most Popular',
    limits: {
      clients: 50,
      activeJobs: 30,
    },
    features: [
      'Up to 50 client profiles',
      'Up to 30 active projects',
      'Full body measurement engine & history',
      'Invoicing & deposit balance tracking',
      'Client review links',
      'Studio analytics dashboard',
    ],
  },
  fashion_studio: {
    id: 'fashion_studio',
    name: 'Fashion Studio',
    nairaPrice: 25000,
    koboAmount: 2500000,
    formattedPrice: '₦25,000',
    period: '/mo',
    tagline: 'For large design houses & ateliers',
    badge: 'Enterprise',
    limits: {
      clients: Infinity,
      activeJobs: Infinity,
    },
    features: [
      'Unlimited client profiles',
      'Unlimited active projects',
      'Full body measurement engine & history',
      'Custom branding on client invoices',
      'Multi-designer team workflow',
      'Priority support',
    ],
  },
}

/**
 * Normalizes any legacy or alias plan string into a canonical plan identifier.
 * Maps 'free' -> 'basic', 'designer' -> 'designer_pro', 'studio' -> 'fashion_studio'.
 */
export function normalizePlanId(rawInput: string | null | undefined): CanonicalPlanId {
  if (!rawInput) return 'basic'
  const cleaned = rawInput.trim().toLowerCase()
  if (cleaned === 'basic' || cleaned === 'free') {
    return 'basic'
  }
  if (cleaned === 'designer' || cleaned === 'designer_pro' || cleaned === 'pro') {
    return 'designer_pro'
  }
  if (cleaned === 'studio' || cleaned === 'fashion_studio') {
    return 'fashion_studio'
  }
  return 'basic'
}

/**
 * Get plan configuration for any plan input (canonical or legacy)
 */
export function getPlanConfig(rawInput: string | null | undefined): PlanDefinition {
  const canonicalId = normalizePlanId(rawInput)
  return CANONICAL_PLANS[canonicalId]
}
