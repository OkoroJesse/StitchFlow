'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'
import { CanonicalPlanId, normalizePlanId } from '@/lib/plans'

export type Profile = Database['public']['Tables']['profiles']['Row']

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data as Profile
}

// Fallback tier map for legacy DB check constraints ('free', 'designer', 'studio')
const LEGACY_TIER_MAP: Record<CanonicalPlanId, string> = {
  basic: 'free',
  designer_pro: 'designer',
  fashion_studio: 'studio',
}

function isConstraintError(err: any): boolean {
  if (!err) return false
  const msg = String(err.message || '').toLowerCase()
  const details = String(err.details || '').toLowerCase()
  const code = String(err.code || '')
  return (
    code === '23514' ||
    msg.includes('check constraint') ||
    msg.includes('profiles_subscription_tier_check') ||
    msg.includes('subscription_tier') ||
    details.includes('check constraint')
  )
}

export async function updateSubscriptionTier(
  rawTier: string
): Promise<{ success: boolean; error?: string; data?: Profile; canonicalTier?: CanonicalPlanId }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated. Please log in again.' }

    const canonicalTier = normalizePlanId(rawTier)
    const defaultName = user.email?.split('@')[0] || 'My Studio'

    // 1. Try upserting with canonical tier string ('basic', 'designer_pro', 'fashion_studio')
    let { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          business_name: defaultName,
          subscription_tier: canonicalTier,
        },
        { onConflict: 'id' }
      )
      .select()

    // 2. If DB constraint check error occurs, fallback to legacy tier string ('free', 'designer', 'studio')
    if (isConstraintError(error)) {
      const fallbackTier = LEGACY_TIER_MAP[canonicalTier] || 'free'
      console.warn(`[Profile Server] Tier "${canonicalTier}" failed constraint. Retrying with legacy tier "${fallbackTier}"...`)

      const retryRes = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            business_name: defaultName,
            subscription_tier: fallbackTier,
          },
          { onConflict: 'id' }
        )
        .select()

      if (!retryRes.error) {
        error = null
        data = retryRes.data
      } else {
        error = retryRes.error
      }
    }

    if (error) {
      console.error('Error updating subscription tier:', error)
      return { success: false, error: 'Failed to update workspace plan due to database constraint.' }
    }

    const resultProfile = data?.[0]
    if (!resultProfile) {
      return { success: false, error: 'Failed to retrieve profile after update.' }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/settings')
    return { success: true, data: resultProfile as Profile, canonicalTier }
  } catch (err: any) {
    console.error('updateSubscriptionTier error:', err)
    return { success: false, error: 'An unexpected error occurred while updating subscription.' }
  }
}

export async function updateProfile(formData: { business_name: string; logo_url: string | null }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Fetch current tier so upsert doesn't break constraint
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .maybeSingle()

  const currentTier = existingProfile?.subscription_tier || 'basic'

  let { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        business_name: formData.business_name,
        logo_url: formData.logo_url,
        subscription_tier: currentTier,
      },
      { onConflict: 'id' }
    )
    .select()
    .single()

  if (isConstraintError(error)) {
    const fallbackTier = LEGACY_TIER_MAP[normalizePlanId(currentTier)] || 'free'
    console.warn(`[Profile Server] Retrying updateProfile with fallback tier "${fallbackTier}"...`)

    const retryUpsert = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          business_name: formData.business_name,
          logo_url: formData.logo_url,
          subscription_tier: fallbackTier,
        },
        { onConflict: 'id' }
      )
      .select()
      .single()

    if (!retryUpsert.error) {
      error = null
      data = retryUpsert.data
    } else {
      error = retryUpsert.error
    }
  }

  if (error) {
    console.error('Error updating profile:', error)
    throw new Error('Failed to update workspace profile.')
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')
  return data as Profile
}
