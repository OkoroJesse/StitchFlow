'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitReview(formData: {
  job_id: string
  rating_fitting: number
  rating_neatness: number
  rating_delivery: number
  comment?: string
  photo_url?: string
}) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('reviews')
    .insert([formData])
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  return data
}

export async function getReviews() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('reviews')
    .select('*, jobs(id, title, business_id, customers(full_name))')
    .eq('jobs.business_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function getJobByToken(token: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('jobs')
    .select(`
      id,
      title,
      description,
      fabric_image_url,
      style_image_url,
      customers (
        full_name
      ),
      profiles (
        business_name,
        logo_url
      )
    `)
    .eq('review_token', token)
    .single()

  if (error || !data) return null
  return data
}
