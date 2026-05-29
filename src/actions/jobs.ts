'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'

export type Job = Database['public']['Tables']['jobs']['Row']

export async function createJob(formData: {
  customer_id: string
  title: string
  description?: string
  agreed_price: number
  delivery_date: string
  fabric_image_url?: string
  style_image_url?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Fetch the subscription tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  const tier = profile?.subscription_tier || 'free'

  if (tier === 'free') {
    const { count, error: countError } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', user.id)
      .neq('status', 'delivered')

    if (countError) {
      console.error('Error counting jobs:', countError)
      throw new Error(countError.message)
    }

    if (count !== null && count >= 3) {
      throw new Error('Workspace Limit Reached: Your Free workspace is limited to 3 active projects. Upgrade to Designer Pro for unlimited active fashion fabrications!')
    }
  }

  const { data, error } = await supabase
    .from('jobs')
    .insert([
      {
        ...formData,
        business_id: user.id,
        status: 'pending'
      }
    ])
    .select()

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/customers/${formData.customer_id}`)
  
  return data[0]
}

export async function getJobs(status?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  let query = supabase
    .from('jobs')
    .select('*, customers(full_name)')
    .eq('business_id', user.id)
    .order('delivery_date', { ascending: true })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) return []
  return data
}

export async function updateJobStatus(jobId: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('jobs')
    .update({ status })
    .eq('id', jobId)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}
