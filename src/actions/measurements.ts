'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveMeasurements(customerId: string, measurements: Record<string, unknown>, label: string = 'Standard') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Set all previous measurements for this customer to not current
  await supabase
    .from('measurements')
    .update({ is_current: false })
    .eq('customer_id', customerId)

  const { data, error } = await supabase
    .from('measurements')
    .insert([
      {
        business_id: user.id,
        customer_id: customerId,
        measurements,
        label,
        is_current: true
      }
    ])
    .select()

  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/customers/${customerId}`)
  return data[0]
}

export async function getMeasurements(customerId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('measurements')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}
