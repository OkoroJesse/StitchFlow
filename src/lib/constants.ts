// Standard body measurement fields used across StitchFlow
export const MEASUREMENT_FIELDS = [
  { key: 'bust',          label: 'Bust',          col: 1 },
  { key: 'waist',         label: 'Waist',         col: 1 },
  { key: 'hips',          label: 'Hips',          col: 1 },
  { key: 'shoulder',      label: 'Shoulder',      col: 1 },
  { key: 'back_length',   label: 'Back Length',   col: 1 },
  { key: 'upper_arm',     label: 'Upper Arm',     col: 1 },
  { key: 'sleeve_length', label: 'Sleeve Length', col: 2 },
  { key: 'bicep',         label: 'Bicep',         col: 2 },
  { key: 'wrist',         label: 'Wrist',         col: 2 },
  { key: 'full_length',   label: 'Full Length',   col: 2 },
  { key: 'thigh',         label: 'Thigh',         col: 2 },
  { key: 'ankle',         label: 'Ankle',         col: 2 },
] as const

export type MeasurementKey = typeof MEASUREMENT_FIELDS[number]['key']

export type MeasurementValues = Partial<Record<MeasurementKey, number | string>>

// Subscription plan limits
export const PLAN_LIMITS = {
  free:     { customers: 5, activeJobs: 3 },
  designer: { customers: Infinity, activeJobs: Infinity },
  studio:   { customers: Infinity, activeJobs: Infinity },
} as const

// Job status options  
export const JOB_STATUSES = [
  { value: 'pending',   label: 'Pending',      color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { value: 'cutting',   label: 'Cutting',      color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { value: 'sewing',    label: 'Sewing',       color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { value: 'fitting',   label: 'Fitting',      color: 'bg-orange-50 text-orange-600 border-orange-200' },
  { value: 'ready',     label: 'Ready',        color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { value: 'delivered', label: 'Delivered',    color: 'bg-gray-50 text-gray-500 border-gray-200' },
] as const

export function getStatusStyle(status: string) {
  return JOB_STATUSES.find(s => s.value === status)?.color ?? 'bg-gray-50 text-gray-500 border-gray-200'
}

export function getStatusLabel(status: string) {
  return JOB_STATUSES.find(s => s.value === status)?.label ?? status
}
