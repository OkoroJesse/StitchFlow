'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createInvoice(jobId: string, totalAmount: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('invoices')
    .insert([
      {
        business_id: user.id,
        job_id: jobId,
        total_amount: totalAmount,
        status: 'unpaid',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      }
    ])
    .select()

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  return data[0]
}

export async function updateInvoiceStatus(invoiceId: string, status: 'paid' | 'unpaid' | 'partially_paid') {
  const supabase = await createClient()
  const { error } = await supabase
    .from('invoices')
    .update({ status })
    .eq('id', invoiceId)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}
