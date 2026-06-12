import { createClient } from '@/lib/supabase/server'
import OrderWizardClient from './OrderWizardClient'

export default async function NewOrderPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: customers } = await supabase
    .from('customers')
    .select(`
      id, full_name, phone_number, address, notes,
      measurements (
        id, label, is_current, measurements
      )
    `)
    .eq('business_id', user.id)
    .order('full_name', { ascending: true })

  return (
    <OrderWizardClient initialCustomers={(customers as any) || []} />
  )
}
