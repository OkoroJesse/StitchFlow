'use server'

import { createClient } from '@/lib/supabase/server'

export async function getSignedUrl(path: string, bucket: string = 'fashion_uploads') {
  const supabase = await createClient()
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 3600) // 1 hour expiry

  if (error) {
    console.error('Error creating signed URL:', error)
    return null
  }

  return data.signedUrl
}

export async function uploadImage(file: File, path: string, bucket: string = 'fashion_uploads') {
  const supabase = await createClient()
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: true
    })

  if (error) throw error
  return data.path
}
