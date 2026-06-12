'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createInvoice(jobId: string, customerId: string, totalAmount: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Check if invoice already exists for this job
  const { data: existing } = await supabase
    .from('invoices')
    .select('id')
    .eq('job_id', jobId)
    .maybeSingle()

  if (existing) throw new Error('An invoice already exists for this order.')

  const { data, error } = await supabase
    .from('invoices')
    .insert([{
      business_id: user.id,
      job_id: jobId,
      customer_id: customerId,
      total_amount: totalAmount,
      status: 'unpaid',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }])
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/invoices')
  revalidatePath('/dashboard/orders')
  revalidatePath(`/dashboard/customers/${customerId}`)
  return data
}

export async function getInvoices() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('invoices')
    .select('id, status, total_amount, created_at, due_date, jobs(id, title, customers(id, full_name))')
    .eq('business_id', user.id)
    .order('created_at', { ascending: false })


  if (error) return []
  return data
}

export async function getInvoiceById(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('invoices')
    .select('*, jobs(id, title, description, agreed_price, delivery_date, customers(id, full_name, phone_number, address), profiles(business_name, logo_url))')
    .eq('id', id)
    .eq('business_id', user.id)
    .single()

  if (error) return null
  return data
}

export async function updateInvoiceStatus(invoiceId: string, status: 'paid' | 'unpaid' | 'partially_paid', customerId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('invoices')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', invoiceId)
    .eq('business_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/invoices')
  revalidatePath('/dashboard/orders')
  if (customerId) revalidatePath(`/dashboard/customers/${customerId}`)
}
