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

export async function updateSubscriptionTier(
  rawTier: string
): Promise<{ success: boolean; error?: string; data?: Profile; canonicalTier?: CanonicalPlanId }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated. Please log in again.' }

    const canonicalTier = normalizePlanId(rawTier)

    // 1. Try updating with canonical tier string ('basic', 'designer_pro', 'fashion_studio')
    let { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ subscription_tier: canonicalTier })
      .eq('id', user.id)
      .select()

    // 2. If DB constraint check error occurs, fallback to legacy tier string ('free', 'designer', 'studio')
    if (updateError && (updateError.message.includes('profiles_subscription_tier_check') || updateError.code === '23514')) {
      const fallbackTier = LEGACY_TIER_MAP[canonicalTier] || 'free'
      console.warn(`[Profile Server] Retrying update with legacy tier "${fallbackTier}" due to database constraint...`)
      
      const retryRes = await supabase
        .from('profiles')
        .update({ subscription_tier: fallbackTier })
        .eq('id', user.id)
        .select()

      if (!retryRes.error) {
        updateError = null
        updateData = retryRes.data
      }
    }

    if (updateError) {
      console.error('Error updating subscription tier:', updateError)
      return { success: false, error: updateError.message }
    }

    let resultProfile = updateData?.[0]

    // 3. If profile row didn't exist yet, insert a new profile row
    if (!resultProfile) {
      const defaultName = user.email?.split('@')[0] || 'My Studio'

      let { data: insertData, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          business_name: defaultName,
          subscription_tier: canonicalTier,
        })
        .select()

      // Retry with fallback tier string if insert hits constraint error
      if (insertError && (insertError.message.includes('profiles_subscription_tier_check') || insertError.code === '23514')) {
        const fallbackTier = LEGACY_TIER_MAP[canonicalTier] || 'free'
        const retryInsert = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            business_name: defaultName,
            subscription_tier: fallbackTier,
          })
          .select()

        if (!retryInsert.error) {
          insertError = null
          insertData = retryInsert.data
        }
      }

      if (insertError) {
        console.error('Error inserting profile:', insertError)
        return { success: false, error: insertError.message }
      }
      resultProfile = insertData?.[0]
    }

    if (!resultProfile) {
      return { success: false, error: 'Failed to retrieve profile after update.' }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/settings')
    return { success: true, data: resultProfile as Profile, canonicalTier }
  } catch (err: any) {
    console.error('updateSubscriptionTier error:', err)
    return { success: false, error: err?.message || 'An unexpected error occurred.' }
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
    .single()

  const currentTier = existingProfile?.subscription_tier || 'basic'

  let { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      business_name: formData.business_name,
      logo_url: formData.logo_url,
      subscription_tier: currentTier,
    })
    .select()
    .single()

  if (error && (error.message.includes('profiles_subscription_tier_check') || error.code === '23514')) {
    const fallbackTier = LEGACY_TIER_MAP[normalizePlanId(currentTier)] || 'free'
    const retryUpsert = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        business_name: formData.business_name,
        logo_url: formData.logo_url,
        subscription_tier: fallbackTier,
      })
      .select()
      .single()

    if (!retryUpsert.error) {
      error = null
      data = retryUpsert.data
    }
  }

  if (error) {
    console.error('Error updating profile:', error)
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')
  return data as Profile
}
