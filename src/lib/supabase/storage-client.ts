'use client'

import { createClient } from '@/lib/supabase/client'

/** Upload a file using the browser Supabase client (respects the logged-in session). */
export async function uploadImageClient(
  file: File,
  path: string,
  bucket: string = 'fashion_uploads'
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
  })

  if (error) throw error
  return data.path
}

/** Create a signed URL using the browser Supabase client. */
export async function getSignedUrlClient(
  path: string,
  bucket: string = 'fashion_uploads',
  expiresIn: number = 3600
): Promise<string | null> {
  const supabase = createClient()

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)

  if (error) {
    console.error('Error creating signed URL:', error)
    return null
  }
  return data.signedUrl
}
