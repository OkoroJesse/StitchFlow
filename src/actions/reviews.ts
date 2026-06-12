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

  // First get all job IDs belonging to this business
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id')
    .eq('business_id', user.id)

  if (!jobs || jobs.length === 0) return []

  const jobIds = jobs.map(j => j.id)

  const { data, error } = await supabase
    .from('reviews')
    .select('*, jobs(id, title, customers(full_name))')
    .in('job_id', jobIds)
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
