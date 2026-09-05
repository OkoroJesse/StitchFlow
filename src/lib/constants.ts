// StitchFlow Measurement System Constants & Definitions

// Measurement Units
export const MEASUREMENT_UNITS = [
  { value: 'inches', label: 'Inches (in)', symbol: 'in' },
  { value: 'cm', label: 'Centimeters (cm)', symbol: 'cm' },
] as const

export type MeasurementUnit = 'inches' | 'cm'

// Measurement Categories / Gender
export const GENDER_CATEGORIES = [
  { value: 'MEN', label: 'Men' },
  { value: 'WOMEN', label: 'Women' },
] as const

export type GenderCategory = 'MEN' | 'WOMEN'

// Garment Types for Men
export const MEN_GARMENT_TYPES = [
  'Shirts',
  'T-Shirts',
  'Native/Senator Wear',
  'Agbada',
  'Kaftan',
  'Suit',
  'Blazer',
  'Jacket',
  'Trousers',
  'Shorts',
  'Traditional Wear',
] as const

// Garment Types for Women
export const WOMEN_GARMENT_TYPES = [
  'Blouse/Top',
  'Shirt',
  'T-Shirt',
  'Dress',
  'Gown',
  'Skirt',
  'Trousers',
  'Jumpsuit',
  'Suit/Blazer',
  'Native Wear',
  'Kaftan',
  'Traditional Wear',
  'Bridal/Wedding Gown',
] as const

export type GarmentType = typeof MEN_GARMENT_TYPES[number] | typeof WOMEN_GARMENT_TYPES[number]

// Measurement Form Sections
export const MEASUREMENT_SECTIONS = [
  { key: 'basic', label: 'Basic Info', icon: 'User' },
  { key: 'upper_body', label: 'Upper Body', icon: 'Shirt' },
  { key: 'sleeves_arms', label: 'Sleeves & Arms', icon: 'Arm' },
  { key: 'torso_waist', label: 'Torso & Waist', icon: 'Maximize2' },
  { key: 'lower_body', label: 'Lower Body & Legs', icon: 'Ruler' },
  { key: 'garment_lengths', label: 'Garment Lengths', icon: 'ArrowDown' },
  { key: 'bridal_special', label: 'Bridal / Special Details', icon: 'Sparkles' },
  { key: 'custom_fields', label: 'Custom Measurements', icon: 'PlusCircle' },
] as const

export type MeasurementSectionKey = typeof MEASUREMENT_SECTIONS[number]['key']

export interface MeasurementFieldDef {
  key: string
  label: string
  section: MeasurementSectionKey
  tooltip?: string
  optional?: boolean
}

// Master Definitions for All Standard Measurement Fields
export const ALL_MEASUREMENT_FIELDS: MeasurementFieldDef[] = [
  // Basic
  { key: 'height', label: 'Height', section: 'basic', tooltip: 'Total body height' },
  { key: 'weight', label: 'Weight', section: 'basic', optional: true, tooltip: 'Body weight (optional indicator)' },

  // Upper Body
  { key: 'neck', label: 'Neck Circumference', section: 'upper_body', tooltip: 'Around base of neck' },
  { key: 'shoulder', label: 'Shoulder Width', section: 'upper_body', tooltip: 'Acromion to acromion point across back' },
  { key: 'chest', label: 'Chest / Bust', section: 'upper_body', tooltip: 'Fullest point around chest or bust' },
  { key: 'upper_chest', label: 'Upper Chest / Bust', section: 'upper_body', tooltip: 'Above bust under armpits' },
  { key: 'under_bust', label: 'Under Bust', section: 'upper_body', tooltip: 'Directly underneath bust' },
  { key: 'bust_point', label: 'Bust Point', section: 'upper_body', tooltip: 'Apex to apex distance' },
  { key: 'bust_separation', label: 'Bust Separation', section: 'upper_body', tooltip: 'Distance between bust apexes' },
  { key: 'back_width', label: 'Back Width', section: 'upper_body', tooltip: 'Across upper back seam to seam' },
  { key: 'front_chest_width', label: 'Front Chest Width', section: 'upper_body', tooltip: 'Across front chest armpit to armpit' },

  // Sleeves & Arms
  { key: 'armhole', label: 'Armhole Circumference', section: 'sleeves_arms', tooltip: 'Around arm joint contour' },
  { key: 'bicep', label: 'Bicep / Upper Arm', section: 'sleeves_arms', tooltip: 'Fullest part of bicep' },
  { key: 'elbow', label: 'Elbow Circumference', section: 'sleeves_arms', tooltip: 'Around elbow joint' },
  { key: 'wrist', label: 'Wrist Circumference', section: 'sleeves_arms', tooltip: 'Around wrist bone' },
  { key: 'sleeve_length', label: 'Sleeve Length', section: 'sleeves_arms', tooltip: 'Shoulder point to wrist/cuff' },
  { key: 'shoulder_to_elbow', label: 'Shoulder to Elbow', section: 'sleeves_arms', tooltip: 'Shoulder tip to elbow point' },
  { key: 'shoulder_to_wrist', label: 'Shoulder to Wrist', section: 'sleeves_arms', tooltip: 'Shoulder tip to wrist bone' },
  { key: 'upper_arm', label: 'Upper Arm', section: 'sleeves_arms', tooltip: 'Upper arm circumference' },

  // Torso & Waist
  { key: 'waist', label: 'Waist Circumference', section: 'torso_waist', tooltip: 'Natural waistline' },
  { key: 'high_waist', label: 'High Waist', section: 'torso_waist', tooltip: 'Above natural waistline' },
  { key: 'upper_waist', label: 'Upper Waist', section: 'torso_waist', tooltip: 'Upper abdominal waistline' },
  { key: 'trouser_waist', label: 'Trouser Waist', section: 'torso_waist', tooltip: 'Where trousers sit on waist/hips' },
  { key: 'abdomen', label: 'Abdomen / Stomach', section: 'torso_waist', tooltip: 'Fullest part of stomach area' },
  { key: 'hips', label: 'Hip / Seat', section: 'torso_waist', tooltip: 'Fullest part of hips/buttocks' },
  { key: 'crotch_depth', label: 'Crotch Depth', section: 'torso_waist', tooltip: 'Waist to chair seat level while seated' },
  { key: 'crotch', label: 'Crotch / Rise', section: 'torso_waist', tooltip: 'Front waist through legs to back waist' },
  { key: 'torso_length', label: 'Torso Length', section: 'torso_waist', tooltip: 'Shoulder to crotch seam for jumpsuits' },
  { key: 'shoulder_to_bust', label: 'Shoulder to Bust Point', section: 'torso_waist', tooltip: 'High shoulder point to nipple' },
  { key: 'shoulder_to_under_bust', label: 'Shoulder to Under Bust', section: 'torso_waist', tooltip: 'High shoulder point to under bust line' },
  { key: 'shoulder_to_waist', label: 'Shoulder to Waist', section: 'torso_waist', tooltip: 'High shoulder point to natural waist' },
  { key: 'waist_to_hip', label: 'Waist to Hip', section: 'torso_waist', tooltip: 'Waistline to fullest hip line' },

  // Lower Body & Legs
  { key: 'thigh', label: 'Thigh Circumference', section: 'lower_body', tooltip: 'Fullest part of upper thigh' },
  { key: 'knee', label: 'Knee Circumference', section: 'lower_body', tooltip: 'Around knee joint' },
  { key: 'calf', label: 'Calf Circumference', section: 'lower_body', tooltip: 'Fullest part of calf' },
  { key: 'ankle', label: 'Ankle Circumference', section: 'lower_body', tooltip: 'Around ankle bone' },
  { key: 'inseam', label: 'Inseam Length', section: 'lower_body', tooltip: 'Crotch seam to bottom of trouser' },
  { key: 'outseam', label: 'Outseam Length', section: 'lower_body', tooltip: 'Waistband top down to shoe hem' },
  { key: 'trouser_length', label: 'Trouser Length', section: 'lower_body', tooltip: 'Total length of trousers' },
  { key: 'waist_to_knee', label: 'Waist to Knee', section: 'lower_body', tooltip: 'Waistline down to knee point' },
  { key: 'waist_to_calf', label: 'Waist to Calf', section: 'lower_body', tooltip: 'Waistline down to mid-calf' },
  { key: 'waist_to_ankle', label: 'Waist to Ankle', section: 'lower_body', tooltip: 'Waistline down to ankle bone' },
  { key: 'bottom_hem_opening', label: 'Bottom / Hem Opening', section: 'lower_body', tooltip: 'Leg opening width/circumference' },
  { key: 'hem_opening', label: 'Hem Opening', section: 'lower_body', tooltip: 'Skirt/pant hem opening width' },

  // Garment Lengths
  { key: 'back_length', label: 'Back Length', section: 'garment_lengths', tooltip: 'Nape of neck down back to waist/hem' },
  { key: 'front_length', label: 'Front Length', section: 'garment_lengths', tooltip: 'Shoulder/neck intersection to hem' },
  { key: 'shirt_length', label: 'Shirt Length', section: 'garment_lengths', tooltip: 'Collar seam down to hem' },
  { key: 'garment_length', label: 'Garment Length', section: 'garment_lengths', tooltip: 'Overall length of garment' },
  { key: 'jacket_length', label: 'Jacket Length', section: 'garment_lengths', tooltip: 'Jacket collar seam to bottom edge' },
  { key: 'blazer_length', label: 'Blazer Length', section: 'garment_lengths', tooltip: 'Blazer neck seam to hem' },
  { key: 'native_wear_length', label: 'Native Wear Length', section: 'garment_lengths', tooltip: 'Length for senator/native top' },
  { key: 'native_shirt_length', label: 'Native Shirt Length', section: 'garment_lengths', tooltip: 'Length of native shirt' },
  { key: 'agbada_length', label: 'Agbada Length', section: 'garment_lengths', tooltip: 'Full length of Agbada robe' },
  { key: 'top_length', label: 'Top Length', section: 'garment_lengths', tooltip: 'Top / blouse length' },
  { key: 'blouse_length', label: 'Blouse Length', section: 'garment_lengths', tooltip: 'Blouse neck to waist/hip' },
  { key: 'dress_gown_length', label: 'Dress / Gown Length', section: 'garment_lengths', tooltip: 'Shoulder down to dress hem' },
  { key: 'full_length', label: 'Full Length', section: 'garment_lengths', tooltip: 'Shoulder to floor / total length' },
  { key: 'skirt_length', label: 'Skirt Length', section: 'garment_lengths', tooltip: 'Waistband to skirt hem' },
  { key: 'shoulder_to_knee', label: 'Shoulder to Knee', section: 'garment_lengths', tooltip: 'Shoulder line to kneecap' },
  { key: 'shoulder_to_ankle', label: 'Shoulder to Ankle', section: 'garment_lengths', tooltip: 'Shoulder line to ankle bone' },

  // Special / Bridal
  { key: 'hollow_to_hem', label: 'Hollow-to-Hem / Full Gown', section: 'bridal_special', tooltip: 'Hollow between collarbones to hem' },
  { key: 'waist_to_hem', label: 'Waist-to-Hem', section: 'bridal_special', tooltip: 'Waistband line down to gown hem' },
  { key: 'train_length', label: 'Train Length', section: 'bridal_special', tooltip: 'Length of gown train trailing behind' },
  { key: 'neckline_depth', label: 'Front Neckline Depth', section: 'bridal_special', optional: true, tooltip: 'Collarbone notch to front neckline drop' },
  { key: 'back_neckline_depth', label: 'Back Neckline Depth', section: 'bridal_special', optional: true, tooltip: 'Nape of neck to back neckline drop' },
]

// Mapping of Garment Types to Recommended Measurement Field Keys
export const GARMENT_FIELD_MAP: Record<string, string[]> = {
  // MEN
  'Shirts': ['neck', 'shoulder', 'chest', 'waist', 'armhole', 'bicep', 'wrist', 'sleeve_length', 'back_length', 'shirt_length'],
  'T-Shirts': ['neck', 'shoulder', 'chest', 'waist', 'bicep', 'sleeve_length', 'shirt_length'],
  'Native/Senator Wear': ['neck', 'shoulder', 'chest', 'waist', 'abdomen', 'hips', 'armhole', 'bicep', 'wrist', 'sleeve_length', 'native_wear_length', 'trouser_waist', 'thigh', 'knee', 'ankle', 'trouser_length'],
  'Agbada': ['neck', 'shoulder', 'chest', 'waist', 'abdomen', 'hips', 'armhole', 'bicep', 'wrist', 'sleeve_length', 'agbada_length', 'trouser_waist', 'thigh', 'knee', 'ankle', 'crotch', 'trouser_length'],
  'Suit': ['neck', 'shoulder', 'chest', 'upper_chest', 'waist', 'abdomen', 'hips', 'armhole', 'bicep', 'elbow', 'wrist', 'sleeve_length', 'shoulder_to_elbow', 'shoulder_to_wrist', 'back_width', 'front_chest_width', 'jacket_length', 'trouser_waist', 'thigh', 'knee', 'calf', 'ankle', 'crotch_depth', 'inseam', 'outseam', 'bottom_hem_opening'],
  'Blazer': ['neck', 'shoulder', 'chest', 'waist', 'abdomen', 'hips', 'armhole', 'bicep', 'wrist', 'sleeve_length', 'blazer_length', 'back_width'],
  'Jacket': ['neck', 'shoulder', 'chest', 'waist', 'hips', 'armhole', 'bicep', 'wrist', 'sleeve_length', 'jacket_length'],
  'Shorts': ['trouser_waist', 'hips', 'thigh', 'crotch_depth', 'outseam', 'trouser_length'],

  // WOMEN & COMMON
  'Blouse/Top': ['neck', 'shoulder', 'chest', 'upper_chest', 'under_bust', 'bust_point', 'bust_separation', 'waist', 'upper_waist', 'abdomen', 'hips', 'armhole', 'bicep', 'elbow', 'wrist', 'sleeve_length', 'shoulder_to_bust', 'shoulder_to_under_bust', 'shoulder_to_waist', 'front_length', 'back_length', 'blouse_length', 'top_length'],
  'Shirt': ['neck', 'shoulder', 'chest', 'waist', 'armhole', 'bicep', 'wrist', 'sleeve_length', 'shirt_length', 'shoulder_to_waist'],
  'T-Shirt': ['shoulder', 'chest', 'waist', 'bicep', 'sleeve_length', 'top_length'],
  'Dress': ['shoulder', 'neck', 'chest', 'upper_chest', 'under_bust', 'waist', 'abdomen', 'hips', 'armhole', 'bicep', 'elbow', 'wrist', 'sleeve_length', 'shoulder_to_bust', 'shoulder_to_waist', 'waist_to_hip', 'shoulder_to_knee', 'shoulder_to_ankle', 'full_length', 'dress_gown_length', 'back_length', 'front_length'],
  'Gown': ['shoulder', 'neck', 'chest', 'upper_chest', 'under_bust', 'waist', 'abdomen', 'hips', 'armhole', 'bicep', 'sleeve_length', 'shoulder_to_bust', 'shoulder_to_waist', 'waist_to_hip', 'shoulder_to_ankle', 'full_length', 'dress_gown_length', 'back_length', 'front_length'],
  'Skirt': ['waist', 'high_waist', 'hips', 'waist_to_hip', 'waist_to_knee', 'waist_to_calf', 'waist_to_ankle', 'skirt_length', 'hem_opening'],
  'Trousers': ['waist', 'trouser_waist', 'hips', 'thigh', 'knee', 'calf', 'ankle', 'crotch_depth', 'inseam', 'outseam', 'waist_to_knee', 'waist_to_ankle', 'trouser_length', 'bottom_hem_opening'],
  'Jumpsuit': ['neck', 'shoulder', 'chest', 'under_bust', 'waist', 'abdomen', 'hips', 'armhole', 'bicep', 'sleeve_length', 'torso_length', 'crotch_depth', 'thigh', 'knee', 'calf', 'ankle', 'inseam', 'outseam', 'full_length'],
  'Suit/Blazer': ['shoulder', 'neck', 'chest', 'upper_chest', 'under_bust', 'waist', 'abdomen', 'hips', 'armhole', 'bicep', 'wrist', 'sleeve_length', 'blazer_length', 'shoulder_to_waist', 'trouser_waist', 'thigh', 'knee', 'ankle', 'crotch_depth', 'outseam'],
  'Native Wear': ['neck', 'shoulder', 'chest', 'under_bust', 'waist', 'abdomen', 'hips', 'armhole', 'bicep', 'wrist', 'sleeve_length', 'top_length', 'native_wear_length', 'trouser_waist', 'skirt_length', 'trouser_length'],
  'Kaftan': ['neck', 'shoulder', 'chest', 'waist', 'abdomen', 'hips', 'armhole', 'bicep', 'wrist', 'sleeve_length', 'top_length', 'agbada_length', 'trouser_waist', 'thigh', 'knee', 'ankle', 'crotch', 'trouser_length', 'full_length'],
  'Traditional Wear': ['neck', 'shoulder', 'chest', 'under_bust', 'waist', 'abdomen', 'hips', 'armhole', 'bicep', 'wrist', 'sleeve_length', 'top_length', 'agbada_length', 'trouser_waist', 'thigh', 'knee', 'ankle', 'crotch', 'skirt_length', 'trouser_length'],
  'Bridal/Wedding Gown': ['height', 'shoulder', 'neck', 'upper_chest', 'chest', 'under_bust', 'bust_point', 'bust_separation', 'waist', 'abdomen', 'hips', 'armhole', 'bicep', 'elbow', 'wrist', 'sleeve_length', 'shoulder_to_bust', 'shoulder_to_under_bust', 'shoulder_to_waist', 'waist_to_hip', 'front_length', 'back_length', 'hollow_to_hem', 'waist_to_hem', 'train_length', 'upper_arm', 'neckline_depth', 'back_neckline_depth'],
}

// Custom Field Interface
export interface CustomMeasurementField {
  id: string
  name: string
  value: number | string
  unit: MeasurementUnit
  notes?: string
}

// Complete Measurement Profile Payload Interface
export interface MeasurementProfilePayload {
  profile_name: string
  garment_type: GarmentType | string
  gender: GenderCategory | string
  unit: MeasurementUnit
  notes?: string
  measurements: Record<string, number | string | null>
  custom_fields?: CustomMeasurementField[]
}

// Legacy fields compatibility map (e.g. 'bust' vs 'chest', 'hips' vs 'hip')
export const LEGACY_KEY_ALIASES: Record<string, string> = {
  bust: 'chest',
  hip: 'hips',
  seat: 'hips',
  upper_arm: 'bicep',
}

// Legacy MEASUREMENT_FIELDS for backward compatibility
export const MEASUREMENT_FIELDS = [
  { key: 'chest', label: 'Chest / Bust', col: 1 },
  { key: 'waist', label: 'Waist', col: 1 },
  { key: 'hips', label: 'Hips / Seat', col: 1 },
  { key: 'shoulder', label: 'Shoulder Width', col: 1 },
  { key: 'back_length', label: 'Back Length', col: 1 },
  { key: 'bicep', label: 'Bicep / Upper Arm', col: 1 },
  { key: 'sleeve_length', label: 'Sleeve Length', col: 2 },
  { key: 'wrist', label: 'Wrist', col: 2 },
  { key: 'full_length', label: 'Full Length', col: 2 },
  { key: 'thigh', label: 'Thigh', col: 2 },
  { key: 'ankle', label: 'Ankle', col: 2 },
  { key: 'trouser_length', label: 'Trouser Length', col: 2 },
] as const

export type MeasurementKey = string
export type MeasurementValues = Record<string, any>

// Subscription plan limits
export const PLAN_LIMITS = {
  free: { customers: 5, activeJobs: 3 },
  designer: { customers: Infinity, activeJobs: Infinity },
  studio: { customers: Infinity, activeJobs: Infinity },
} as const

// Job status options  
export const JOB_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { value: 'cutting', label: 'Cutting', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { value: 'sewing', label: 'Sewing', color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { value: 'fitting', label: 'Fitting', color: 'bg-orange-50 text-orange-600 border-orange-200' },
  { value: 'ready', label: 'Ready', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { value: 'delivered', label: 'Delivered', color: 'bg-gray-50 text-gray-500 border-gray-200' },
] as const

export function getStatusStyle(status: string) {
  return JOB_STATUSES.find(s => s.value === status)?.color ?? 'bg-gray-50 text-gray-500 border-gray-200'
}

export function getStatusLabel(status: string) {
  return JOB_STATUSES.find(s => s.value === status)?.label ?? status
}

// Validation helper for measurement numbers
export function validateMeasurementValue(val: any, unit: MeasurementUnit = 'inches'): { isValid: boolean; error?: string; numValue?: number } {
  if (val === undefined || val === null || val === '') {
    return { isValid: true, numValue: undefined }
  }
  const num = Number(val)
  if (isNaN(num)) {
    return { isValid: false, error: 'Must be a valid number' }
  }
  if (num < 0) {
    return { isValid: false, error: 'Cannot be negative' }
  }
  const maxLimit = unit === 'cm' ? 750 : 300
  if (num > maxLimit) {
    return { isValid: false, error: `Value exceeds reasonable limit (${maxLimit} ${unit})` }
  }
  return { isValid: true, numValue: num }
}
