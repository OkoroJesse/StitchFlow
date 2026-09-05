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

export async function updateSubscriptionTier(
  rawTier: string
): Promise<{ success: boolean; error?: string; data?: Profile; canonicalTier?: CanonicalPlanId }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated. Please log in again.' }

    const canonicalTier = normalizePlanId(rawTier)

    // Try to update existing profile
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ subscription_tier: canonicalTier })
      .eq('id', user.id)
      .select()

    if (updateError) {
      console.error('Error updating subscription tier:', updateError)
      return { success: false, error: updateError.message }
    }

    let resultProfile = updateData?.[0]

    if (!resultProfile) {
      // If no profile row existed, insert a default one
      const defaultName = user.email?.split('@')[0] || 'My Studio'
      const { data: insertData, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          business_name: defaultName,
          subscription_tier: canonicalTier,
        })
        .select()

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

  // Fetch current tier so upsert never violates subscription_tier NOT NULL or check constraint
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  const currentTier = normalizePlanId(existingProfile?.subscription_tier)

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      business_name: formData.business_name,
      logo_url: formData.logo_url,
      subscription_tier: currentTier,
    })
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')
  return data as Profile
}
