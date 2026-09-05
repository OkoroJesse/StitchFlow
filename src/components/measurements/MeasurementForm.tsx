'use client'

import React, { useState, useMemo } from 'react'
import {
  GENDER_CATEGORIES,
  MEN_GARMENT_TYPES,
  WOMEN_GARMENT_TYPES,
  MEASUREMENT_UNITS,
  ALL_MEASUREMENT_FIELDS,
  GARMENT_FIELD_MAP,
  MEASUREMENT_SECTIONS,
  CustomMeasurementField,
  MeasurementUnit,
  GenderCategory,
  GarmentType,
  validateMeasurementValue,
  MeasurementSectionKey,
} from '@/lib/constants'
import {
  Shirt,
  User,
  Ruler,
  Maximize2,
  ArrowDown,
  Sparkles,
  PlusCircle,
  X,
  Plus,
  Info,
  Check,
  AlertCircle,
  HelpCircle,
  Save,
} from 'lucide-react'
import { Button } from '@/components/shared/button'

interface Props {
  initialData?: any
  onSave: (payload: any) => Promise<void>
  onCancel: () => void
  isPending?: boolean
  customerName?: string
}

export default function MeasurementForm({
  initialData,
  onSave,
  onCancel,
  isPending = false,
  customerName,
}: Props) {
  // Extract metadata from initialData if editing
  const existingMeta = initialData?.measurements?._metadata || {}
  const existingValues = initialData?.measurements || {}

  const [gender, setGender] = useState<GenderCategory>(
    existingMeta.gender || initialData?.measurement_category || 'MEN'
  )
  const [garmentType, setGarmentType] = useState<GarmentType | string>(
    existingMeta.garment_type || initialData?.garment_type || (gender === 'MEN' ? 'Shirts' : 'Dress')
  )
  const [profileName, setProfileName] = useState<string>(
    existingMeta.profile_name || initialData?.profile_name || initialData?.label || ''
  )
  const [unit, setUnit] = useState<MeasurementUnit>(
    existingMeta.unit || initialData?.unit || 'inches'
  )
  const [notes, setNotes] = useState<string>(
    existingMeta.notes || initialData?.notes || ''
  )

  // Field values state
  const [values, setValues] = useState<Record<string, string | number>>(
    () => {
      const initial: Record<string, string | number> = {}
      ALL_MEASUREMENT_FIELDS.forEach((f) => {
        const val = existingValues[f.key]
        if (val !== undefined && val !== null && val !== '') {
          initial[f.key] = val
        }
      })
      return initial
    }
  )

  // Custom fields state
  const [customFields, setCustomFields] = useState<CustomMeasurementField[]>(
    existingMeta.custom_fields || []
  )
  const [newCustomName, setNewCustomName] = useState('')
  const [newCustomVal, setNewCustomVal] = useState('')
  const [newCustomNotes, setNewCustomNotes] = useState('')

  // Active UI section tab
  const [activeSection, setActiveSection] = useState<MeasurementSectionKey>('upper_body')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)

  // Available garment options based on gender
  const garmentOptions = gender === 'MEN' ? MEN_GARMENT_TYPES : WOMEN_GARMENT_TYPES

  // Handle Gender Switch
  const handleGenderChange = (newGender: GenderCategory) => {
    setGender(newGender)
    const defaultGarment = newGender === 'MEN' ? 'Shirts' : 'Dress'
    setGarmentType(defaultGarment)
  }

  // Recommended field keys for selected garment
  const recommendedFieldKeys = useMemo(() => {
    return GARMENT_FIELD_MAP[garmentType] || ALL_MEASUREMENT_FIELDS.map((f) => f.key)
  }, [garmentType])

  // Filter fields belonging to active section
  const currentSectionFields = useMemo(() => {
    return ALL_MEASUREMENT_FIELDS.filter((f) => {
      if (f.section !== activeSection) return false;
      // Bridal section is only visible for bridal/wedding gown or general women dress
      if (f.section === 'bridal_special' && garmentType !== 'Bridal/Wedding Gown' && garmentType !== 'Gown' && garmentType !== 'Dress') {
        return false;
      }
      return true;
    })
  }, [activeSection, garmentType])

  // Count filled fields per section
  const sectionCounts = useMemo(() => {
    const counts: Record<string, { filled: number; total: number }> = {}
    MEASUREMENT_SECTIONS.forEach((sec) => {
      const fieldsInSec = ALL_MEASUREMENT_FIELDS.filter((f) => f.section === sec.key)
      const filled = fieldsInSec.filter((f) => values[f.key] !== undefined && values[f.key] !== '').length
      counts[sec.key] = { filled, total: fieldsInSec.length }
    })
    return counts
  }, [values])

  // Handle value change with instant validation
  const handleValueChange = (key: string, rawVal: string) => {
    const check = validateMeasurementValue(rawVal, unit)
    if (!check.isValid && check.error) {
      setErrors((prev) => ({ ...prev, [key]: check.error! }))
    } else {
      setErrors((prev) => {
        const copy = { ...prev }
        delete copy[key]
        return copy
      })
    }

    setValues((prev) => ({
      ...prev,
      [key]: rawVal,
    }))
  }

  // Handle adding custom field
  const handleAddCustomField = () => {
    if (!newCustomName.trim()) return
    const newField: CustomMeasurementField = {
      id: Date.now().toString(),
      name: newCustomName.trim(),
      value: newCustomVal,
      unit: unit,
      notes: newCustomNotes.trim() || undefined,
    }
    setCustomFields((prev) => [...prev, newField])
    setNewCustomName('')
    setNewCustomVal('')
    setNewCustomNotes('')
  }

  // Remove custom field
  const handleRemoveCustomField = (id: string) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id))
  }

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all numeric inputs
    const newErrors: Record<string, string> = {}
    Object.entries(values).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) {
        const check = validateMeasurementValue(v, unit)
        if (!check.isValid && check.error) {
          newErrors[k] = check.error
        }
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      alert('Please correct invalid measurement entries highlighted in red.')
      return
    }

    const defaultName = profileName.trim() || `${garmentType} Profile (${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})`

    // Clean up empty values
    const cleanedValues: Record<string, number | string> = {}
    Object.entries(values).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) {
        cleanedValues[k] = typeof v === 'string' ? parseFloat(v) || v : v
      }
    })

    const payload = {
      profile_name: defaultName,
      garment_type: garmentType,
      gender: gender,
      unit: unit,
      notes: notes.trim(),
      measurements: cleanedValues,
      custom_fields: customFields,
      label: defaultName,
    }

    await onSave(payload)
  }

  return (
    <div className="bg-white border-2 border-[#e91e8c]/20 rounded-[2.5rem] p-4 sm:p-8 shadow-xl relative animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
        <div>
          <span className="text-[10px] font-black text-[#e91e8c] uppercase tracking-widest bg-[#e91e8c]/10 px-3 py-1 rounded-full inline-block mb-1">
            Measurement Profile Builder
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#1e1b2e] tracking-tight">
            {initialData ? 'Edit Measurement Spec' : `New Profile ${customerName ? `for ${customerName}` : ''}`}
          </h3>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="self-end sm:self-auto p-2 text-gray-400 hover:text-gray-600 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. PROFILE BASIC CONFIGURATION (Gender, Garment Type, Profile Name, Unit) */}
        <div className="bg-[#FAFAF8] p-5 sm:p-6 border border-gray-200/80 rounded-3xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Gender Pill Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest">
                Client Category
              </label>
              <div className="grid grid-cols-2 gap-2 bg-white p-1 rounded-xl border border-gray-200">
                {GENDER_CATEGORIES.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => handleGenderChange(g.value as GenderCategory)}
                    className={`py-2.5 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                      gender === g.value
                        ? 'bg-[#1e1b2e] text-white shadow-md'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span>{g.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Garment Type Dropdown */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest">
                Garment / Outfit Type
              </label>
              <select
                value={garmentType}
                onChange={(e) => setGarmentType(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-extrabold text-gray-900 focus:border-[#e91e8c] focus:outline-none transition-all cursor-pointer"
              >
                {garmentOptions.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Profile Name */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest">
                Profile Name
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder={`e.g. ${garmentType} - Sept 2026`}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-900 focus:border-[#e91e8c] focus:outline-none transition-all"
              />
            </div>

            {/* Measurement Unit */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest">
                Measurement Unit
              </label>
              <div className="grid grid-cols-2 gap-2 bg-white p-1 rounded-xl border border-gray-200">
                {MEASUREMENT_UNITS.map((u) => (
                  <button
                    key={u.value}
                    type="button"
                    onClick={() => setUnit(u.value as MeasurementUnit)}
                    className={`py-2.5 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center ${
                      unit === u.value
                        ? 'bg-[#e91e8c] text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. SECTION NAVIGATION TABS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between overflow-x-auto no-scrollbar pb-2 border-b border-gray-100 gap-2">
            {MEASUREMENT_SECTIONS.map((sec) => {
              const isBridalSec = sec.key === 'bridal_special'
              if (isBridalSec && garmentType !== 'Bridal/Wedding Gown' && garmentType !== 'Gown' && garmentType !== 'Dress') {
                return null
              }
              const isActive = activeSection === sec.key
              const count = sectionCounts[sec.key] || { filled: 0, total: 0 }

              return (
                <button
                  key={sec.key}
                  type="button"
                  onClick={() => setActiveSection(sec.key as MeasurementSectionKey)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-2 shrink-0 ${
                    isActive
                      ? 'bg-[#1e1b2e] text-white shadow-md'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{sec.label}</span>
                  {sec.key !== 'custom_fields' && count.filled > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-[#e91e8c] text-white' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {count.filled}
                    </span>
                  )}
                  {sec.key === 'custom_fields' && customFields.length > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-[#e91e8c] text-white' : 'bg-pink-100 text-pink-800'
                      }`}
                    >
                      {customFields.length}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* 3. SECTION FIELDS RENDERING MATRIX */}
          {activeSection !== 'custom_fields' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs text-gray-500 font-semibold">
                  Fields marked with <span className="text-[#e91e8c] font-extrabold">*</span> are recommended for{' '}
                  <strong className="text-gray-900">{garmentType}</strong>. Leave optional fields empty if not taken.
                </p>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:inline">
                  Unit: {unit}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentSectionFields.map((field) => {
                  const isRecommended = recommendedFieldKeys.includes(field.key)
                  const hasError = errors[field.key]
                  const val = values[field.key] ?? ''

                  return (
                    <div
                      key={field.key}
                      className={`p-4 rounded-2xl border transition-all relative group ${
                        hasError
                          ? 'border-red-300 bg-red-50/30'
                          : val !== ''
                          ? 'border-[#e91e8c]/30 bg-[#e91e8c]/[0.02] shadow-xs'
                          : isRecommended
                          ? 'border-gray-200 bg-white hover:border-gray-300'
                          : 'border-gray-100 bg-[#FAFAF8] opacity-90'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-extrabold text-gray-700 flex items-center gap-1 truncate">
                          {field.label}
                          {isRecommended && <span className="text-[#e91e8c] text-sm">*</span>}
                        </label>

                        {field.tooltip && (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveTooltip(activeTooltip === field.key ? null : field.key)
                              }
                              className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                            </button>
                            {activeTooltip === field.key && (
                              <div className="absolute right-0 bottom-full mb-2 w-48 p-2.5 bg-gray-900 text-white text-[11px] rounded-xl shadow-xl z-20">
                                {field.tooltip}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          value={val}
                          onChange={(e) => handleValueChange(field.key, e.target.value)}
                          placeholder="0.0"
                          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-lg font-black text-gray-900 focus:border-[#e91e8c] focus:ring-2 focus:ring-[#e91e8c]/10 focus:outline-none transition-all pr-10"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 uppercase pointer-events-none">
                          {unit === 'inches' ? 'in' : 'cm'}
                        </span>
                      </div>

                      {hasError && (
                        <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {hasError}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            /* 4. CUSTOM MEASUREMENTS BUILDER */
            <div className="space-y-6">
              <div className="bg-[#FAFAF8] border border-gray-200 rounded-3xl p-6 space-y-4">
                <h4 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-[#e91e8c]" />
                  Add Custom Field
                </h4>
                <p className="text-xs text-gray-500">
                  Create custom tailing measurements specific to this client or garment (e.g. "Shoulder to Floor", "Wrist to Thumb", etc.).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Measurement Name
                    </label>
                    <input
                      type="text"
                      value={newCustomName}
                      onChange={(e) => setNewCustomName(e.target.value)}
                      placeholder='e.g. "Shoulder to Floor"'
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-bold text-gray-900 focus:border-[#e91e8c] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Value ({unit})
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      value={newCustomVal}
                      onChange={(e) => setNewCustomVal(e.target.value)}
                      placeholder="58"
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-bold text-gray-900 focus:border-[#e91e8c] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={newCustomNotes}
                      onChange={(e) => setNewCustomNotes(e.target.value)}
                      placeholder='e.g. "Measured without shoes"'
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-bold text-gray-900 focus:border-[#e91e8c] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleAddCustomField}
                      disabled={!newCustomName.trim()}
                      className="w-full py-3 bg-[#1e1b2e] hover:bg-[#2d2540] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Field
                    </button>
                  </div>
                </div>
              </div>

              {/* Added Custom Fields List */}
              {customFields.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    Saved Custom Fields ({customFields.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {customFields.map((cf) => (
                      <div
                        key={cf.id}
                        className="bg-white border-2 border-pink-100 rounded-2xl p-4 flex items-start justify-between gap-3 shadow-xs"
                      >
                        <div className="space-y-1 min-w-0">
                          <p className="text-xs font-black text-gray-900 truncate">{cf.name}</p>
                          <p className="text-xl font-black text-[#e91e8c] italic">
                            {cf.value} <span className="text-xs font-bold text-gray-400">{cf.unit}</span>
                          </p>
                          {cf.notes && <p className="text-[11px] text-gray-500 italic">"{cf.notes}"</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomField(cf.id)}
                          className="p-1 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 5. NOTES & GENERAL OBSERVATIONS */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-black text-gray-500 uppercase tracking-widest">
            Tailoring Notes & Fit Preferences
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add specific observations e.g. Customer prefers relaxed chest fit, slouched right shoulder..."
            className="w-full bg-[#FAFAF8] border border-gray-200 rounded-2xl p-4 text-xs font-semibold text-gray-900 focus:border-[#e91e8c] focus:outline-none transition-all resize-none"
          />
        </div>

        {/* 6. FORM ACTION BUTTONS */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="ghost" onClick={onCancel} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isPending}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#1e1b2e] hover:bg-[#2d2540] text-white rounded-xl font-bold shadow-lg"
          >
            <Save className="w-4 h-4 mr-2" />
            {initialData ? 'Update Profile' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </div>
  )
}
