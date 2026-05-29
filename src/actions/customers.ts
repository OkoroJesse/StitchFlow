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
    .select('*')
    .eq('business_id', user.id)
    .order('full_name', { ascending: true })

  if (error) {
    console.error('Error fetching customers:', error)
    return []
  }

  return data as Customer[]
}

export async function addCustomer(formData: FormData) {
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
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', user.id)

    if (countError) {
      console.error('Error counting customers:', countError)
      throw new Error(countError.message)
    }

    if (count !== null && count >= 5) {
      throw new Error('Workspace Limit Reached: Your Free workspace is limited to onboarding 5 clients. Upgrade to Designer Pro for unlimited client directories!')
    }
  }

  const { data, error } = await supabase
    .from('customers')
    .insert([
      {
        full_name: formData.get('full_name') as string,
        phone_number: formData.get('phone_number') as string,
        address: formData.get('address') as string,
        notes: formData.get('notes') as string,
        business_id: user.id,
      },
    ])
    .select()

  if (error) {
    console.error('Error adding customer:', error)
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/customers')
  return data[0]
}

export async function getCustomerById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      jobs (*, invoices (*)),
      measurements (*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching customer:', error)
    return null
  }

  return data
}
