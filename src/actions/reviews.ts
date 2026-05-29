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

  if (error) throw new Error(error.message)

  // Mark job as reviewed if needed? Or just revalidate
  revalidatePath('/dashboard')
  return data[0]
}

export async function getJobByToken(token: string) {
  const supabase = await createClient()
  
  // Publicly fetch the specific job by review token
  // This is safe because we only select non-sensitive fields
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      id,
      title,
      description,
      fabric_image_url,
      style_image_url,
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
