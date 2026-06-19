'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'

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

export async function updateSubscriptionTier(tier: 'free' | 'designer' | 'studio') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Try to update first
  const { data: updateData, error: updateError } = await supabase
    .from('profiles')
    .update({ subscription_tier: tier, updated_at: new Date().toISOString() })
    .eq('id', user.id)
    .select()

  if (updateError) {
    console.error('Error updating subscription tier:', updateError)
    throw new Error(updateError.message)
  }

  let resultProfile = updateData?.[0]

  if (!resultProfile) {
    // If no row was updated, insert a new profile row
    const defaultName = user.email?.split('@')[0] || 'My Studio'
    const { data: insertData, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        business_name: defaultName,
        subscription_tier: tier
      })
      .select()

    if (insertError) {
      console.error('Error inserting subscription tier:', insertError)
      throw new Error(insertError.message)
    }
    resultProfile = insertData?.[0]
  }

  if (!resultProfile) {
    throw new Error('Failed to retrieve profile after update/insert')
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')
  return resultProfile as Profile
}

export async function updateProfile(formData: { business_name: string; logo_url: string | null }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      business_name: formData.business_name,
      logo_url: formData.logo_url,
      updated_at: new Date().toISOString()
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
