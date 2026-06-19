'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'

export type Customer = Database['public']['Tables']['customers']['Row']

export async function getCustomers() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('customers')
    .select('*, jobs(id, title, status, agreed_price, created_at, delivery_date)')
    .eq('business_id', user.id)
    .order('full_name', { ascending: true })

  if (error) {
    console.error('Error fetching customers:', error)
    return []
  }
  return data
}

export async function addCustomer(formData: FormData) {
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
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', user.id)

    if (count !== null && count >= 5) {
      throw new Error('Free plan limit: You can only add 5 clients. Upgrade to Designer Pro for up to 25 clients.')
    }
  } else if (tier === 'designer') {
    const { count } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', user.id)

    if (count !== null && count >= 25) {
      throw new Error('Designer Pro plan limit: You can only add 25 clients. Upgrade to Fashion Studio for unlimited clients.')
    }
  }

  const { data, error } = await supabase
    .from('customers')
    .insert([{
      full_name: formData.get('full_name') as string,
      phone_number: formData.get('phone_number') as string,
      email: formData.get('email') as string || null,
      address: formData.get('address') as string,
      notes: formData.get('notes') as string || null,
      business_id: user.id,
    }])
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/customers')
  revalidatePath('/dashboard')
  return data
}

export async function updateCustomer(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('customers')
    .update({
      full_name: formData.get('full_name') as string,
      phone_number: formData.get('phone_number') as string,
      email: formData.get('email') as string || null,
      address: formData.get('address') as string,
      notes: formData.get('notes') as string || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('business_id', user.id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/customers/${id}`)
  revalidatePath('/dashboard/customers')
  return data
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)
    .eq('business_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/customers')
  revalidatePath('/dashboard')
}

export async function getCustomerById(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      jobs (
        id, title, status, agreed_price, delivery_date,
        fabric_image_url, style_image_url, review_token,
        created_at, measurement_id,
        invoices (id, total_amount, status, created_at)
      ),
      measurements (
        id, label, measurements, is_current, created_at
      )
    `)
    .eq('id', id)
    .eq('business_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching customer:', error)
    return null
  }

  if (data && data.jobs) {
    const { getSignedUrl } = await import('@/lib/supabase/storage')
    for (const job of data.jobs) {
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
