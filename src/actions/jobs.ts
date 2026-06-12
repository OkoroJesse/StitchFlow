'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'

export type Job = Database['public']['Tables']['jobs']['Row']

export async function createJob(formData: {
  customer_id: string
  measurement_id?: string | null
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  const tier = profile?.subscription_tier || 'free'

  if (tier === 'free') {
    const { count } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', user.id)
      .neq('status', 'delivered')

    if (count !== null && count >= 3) {
      throw new Error('Free plan limit: You can only have 3 active orders. Upgrade to Designer Pro for unlimited orders.')
    }
  }

  const { data, error } = await supabase
    .from('jobs')
    .insert([{
      ...formData,
      business_id: user.id,
      status: 'pending',
    }])
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/orders')
  revalidatePath(`/dashboard/customers/${formData.customer_id}`)
  return data
}

export async function getJobs(status?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let query = supabase
    .from('jobs')
    .select('*, customers(id, full_name, phone_number)')
    .eq('business_id', user.id)
    .order('delivery_date', { ascending: true })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) return []

  if (data) {
    const { getSignedUrl } = await import('@/lib/supabase/storage')
    for (const job of data) {
      if (job.fabric_image_url) {
        try {
          const signed = await getSignedUrl(job.fabric_image_url)
          if (signed) job.fabric_image_url = signed
        } catch (e) {
          console.error('Error resolving fabric signed URL:', e)
        }
      }
      if (job.style_image_url) {
        try {
          const signed = await getSignedUrl(job.style_image_url)
          if (signed) job.style_image_url = signed
        } catch (e) {
          console.error('Error resolving style signed URL:', e)
        }
      }
    }
  }

  return data
}

export async function getJobById(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('jobs')
    .select('*, customers(id, full_name, phone_number, address), invoices(*)')
    .eq('id', id)
    .eq('business_id', user.id)
    .single()

  if (error) return null

  if (data) {
    const { getSignedUrl } = await import('@/lib/supabase/storage')
    if (data.fabric_image_url) {
      try {
        const signed = await getSignedUrl(data.fabric_image_url)
        if (signed) data.fabric_image_url = signed
      } catch (e) {
        console.error('Error resolving fabric signed URL:', e)
      }
    }
    if (data.style_image_url) {
      try {
        const signed = await getSignedUrl(data.style_image_url)
        if (signed) data.style_image_url = signed
      } catch (e) {
        console.error('Error resolving style signed URL:', e)
      }
    }
  }

  return data
}

export async function updateJobStatus(jobId: string, status: string, customerId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('jobs')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', jobId)
    .eq('business_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/orders')
  if (customerId) revalidatePath(`/dashboard/customers/${customerId}`)
}

export async function deleteJob(id: string, customerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id)
    .eq('business_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/orders')
  revalidatePath(`/dashboard/customers/${customerId}`)
}
