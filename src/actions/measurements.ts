'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { MeasurementValues } from '@/lib/constants'

export async function saveMeasurements(
  customerId: string,
  measurements: MeasurementValues,
  label: string = 'Standard'
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Mark all previous measurements for this customer as not current
  await supabase
    .from('measurements')
    .update({ is_current: false })
    .eq('customer_id', customerId)
    .eq('business_id', user.id)

  const { data, error } = await supabase
    .from('measurements')
    .insert([{
      business_id: user.id,
      customer_id: customerId,
      measurements,
      label,
      is_current: true,
    }])
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/customers/${customerId}`)
  revalidatePath('/dashboard')
  return data
}

export async function getMeasurements(customerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('measurements')
    .select('*')
    .eq('customer_id', customerId)
    .eq('business_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function getMeasurementsByBusiness() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('measurements')
    .select('*, customers(full_name)')
    .eq('business_id', user.id)
    .eq('is_current', true)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function deleteMeasurement(id: string, customerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('measurements')
    .delete()
    .eq('id', id)
    .eq('business_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/customers/${customerId}`)
}
