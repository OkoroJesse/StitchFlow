'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { MeasurementProfilePayload } from '@/lib/constants'

export interface SaveMeasurementOptions {
  profile_name?: string
  garment_type?: string
  gender?: string
  unit?: 'inches' | 'cm'
  notes?: string
  measurements: Record<string, any>
  custom_fields?: any[]
  label?: string
}

export async function saveMeasurements(
  customerId: string,
  measurementsOrPayload: Record<string, any> | SaveMeasurementOptions,
  labelParam?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let profileName = 'Standard Profile'
  let garmentType = 'General'
  let gender = 'MEN'
  let unit = 'inches'
  let notes = ''
  let measurementsObj: Record<string, any> = {}
  let customFields: any[] = []

  if (measurementsOrPayload && 'measurements' in measurementsOrPayload) {
    const payload = measurementsOrPayload as SaveMeasurementOptions
    profileName = payload.profile_name || payload.label || 'Standard Profile'
    garmentType = payload.garment_type || 'General'
    gender = payload.gender || 'MEN'
    unit = payload.unit || 'inches'
    notes = payload.notes || ''
    measurementsObj = payload.measurements || {}
    customFields = payload.custom_fields || []
  } else {
    measurementsObj = measurementsOrPayload as Record<string, any>
    profileName = labelParam || 'Standard Profile'
  }

  const label = profileName

  // Embed complete metadata inside JSON payload for guaranteed backward compatibility and security
  const jsonPayload = {
    ...measurementsObj,
    _metadata: {
      profile_name: profileName,
      garment_type: garmentType,
      gender,
      unit,
      notes,
      custom_fields: customFields,
    }
  }

  // Mark all previous measurements for this customer as not current
  await supabase
    .from('measurements')
    .update({ is_current: false })
    .eq('customer_id', customerId)
    .eq('business_id', user.id)

  const insertData: Record<string, any> = {
    business_id: user.id,
    customer_id: customerId,
    measurements: jsonPayload,
    label: label,
    is_current: true,
  }

  // Try inserting with metadata columns if available in database schema
  try {
    const fullInsertData = {
      ...insertData,
      profile_name: profileName,
      garment_type: garmentType,
      measurement_category: gender,
      unit: unit,
      notes: notes,
      updated_at: new Date().toISOString(),
    }
    const { data, error } = await supabase
      .from('measurements')
      .insert([fullInsertData])
      .select()
      .single()

    if (!error && data) {
      revalidatePath(`/dashboard/customers/${customerId}`)
      revalidatePath('/dashboard')
      return data
    }
  } catch (e) {
    console.warn('Fallback inserting measurements without top-level optional columns:', e)
  }

  // Fallback insert with core columns
  const { data, error } = await supabase
    .from('measurements')
    .insert([insertData])
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/customers/${customerId}`)
  revalidatePath('/dashboard')
  return data
}

export async function duplicateMeasurement(
  measurementId: string,
  customerId: string,
  newProfileName: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: original, error: fetchErr } = await supabase
    .from('measurements')
    .select('*')
    .eq('id', measurementId)
    .eq('business_id', user.id)
    .single()

  if (fetchErr || !original) throw new Error('Original measurement record not found')

  const rawJson = (original.measurements as Record<string, any>) || {}
  const meta = rawJson._metadata || {}

  const duplicatedPayload: SaveMeasurementOptions = {
    profile_name: newProfileName,
    garment_type: (original as any).garment_type || meta.garment_type || 'General',
    gender: (original as any).measurement_category || meta.gender || 'MEN',
    unit: (original as any).unit || meta.unit || 'inches',
    notes: `Duplicated from "${original.label || meta.profile_name || 'Profile'}"`,
    measurements: { ...rawJson },
    custom_fields: meta.custom_fields || [],
  }

  delete duplicatedPayload.measurements._metadata

  return await saveMeasurements(customerId, duplicatedPayload)
}

export async function setActiveMeasurement(id: string, customerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Unset previous active profile
  await supabase
    .from('measurements')
    .update({ is_current: false })
    .eq('customer_id', customerId)
    .eq('business_id', user.id)

  // Set new active profile
  const { data, error } = await supabase
    .from('measurements')
    .update({ is_current: true })
    .eq('id', id)
    .eq('business_id', user.id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/customers/${customerId}`)
  revalidatePath('/dashboard')
  return data
}

export async function updateMeasurement(
  id: string,
  customerId: string,
  payload: SaveMeasurementOptions
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const profileName = payload.profile_name || 'Updated Profile'
  const jsonPayload = {
    ...payload.measurements,
    _metadata: {
      profile_name: profileName,
      garment_type: payload.garment_type || 'General',
      gender: payload.gender || 'MEN',
      unit: payload.unit || 'inches',
      notes: payload.notes || '',
      custom_fields: payload.custom_fields || [],
    }
  }

  const updateFields: Record<string, any> = {
    label: profileName,
    measurements: jsonPayload,
  }

  try {
    const { data, error } = await supabase
      .from('measurements')
      .update({
        ...updateFields,
        profile_name: profileName,
        garment_type: payload.garment_type || 'General',
        measurement_category: payload.gender || 'MEN',
        unit: payload.unit || 'inches',
        notes: payload.notes || '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('business_id', user.id)
      .select()
      .single()

    if (!error && data) {
      revalidatePath(`/dashboard/customers/${customerId}`)
      revalidatePath('/dashboard')
      return data
    }
  } catch (e) {
    console.warn('Fallback updating measurement without top-level optional columns:', e)
  }

  const { data, error } = await supabase
    .from('measurements')
    .update(updateFields)
    .eq('id', id)
    .eq('business_id', user.id)
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
