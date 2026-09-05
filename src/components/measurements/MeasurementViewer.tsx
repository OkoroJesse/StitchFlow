'use client'

import React, { useState } from 'react'
import {
  ALL_MEASUREMENT_FIELDS,
  MEASUREMENT_SECTIONS,
  MeasurementUnit,
} from '@/lib/constants'
import {
  Ruler,
  Calendar,
  Sparkles,
  Tag,
  Copy,
  Edit,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/shared/button'

interface Props {
  record: any
  onEdit?: () => void
  onDuplicate?: () => void
  onDelete?: () => void
  onMakeActive?: () => void
}

export default function MeasurementViewer({
  record,
  onEdit,
  onDuplicate,
  onDelete,
  onMakeActive,
}: Props) {
  if (!record) return null

  const rawJson = (record.measurements as Record<string, any>) || {}
  const meta = rawJson._metadata || {}

  const profileName = meta.profile_name || record.profile_name || record.label || 'Standard Profile'
  const garmentType = meta.garment_type || record.garment_type || 'General'
  const gender = meta.gender || record.measurement_category || 'MEN'
  const originalUnit: MeasurementUnit = meta.unit || record.unit || 'inches'
  const notes = meta.notes || record.notes || ''
  const customFields: any[] = meta.custom_fields || []

  // Unit Toggle for viewing (can convert view on the fly)
  const [displayUnit, setDisplayUnit] = useState<MeasurementUnit>(originalUnit)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    upper_body: true,
    sleeves_arms: true,
    torso_waist: true,
    lower_body: true,
    garment_lengths: true,
    bridal_special: true,
  })

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Convert measurement value between inches & cm if user toggles view
  const formatValue = (val: any) => {
    if (val === undefined || val === null || val === '') return '—'
    const num = Number(val)
    if (isNaN(num)) return String(val)

    if (originalUnit === displayUnit) {
      return `${num} ${displayUnit === 'inches' ? '"' : 'cm'}`
    }

    // Convert
    if (originalUnit === 'inches' && displayUnit === 'cm') {
      const converted = (num * 2.54).toFixed(1)
      return `${converted} cm`
    }
    if (originalUnit === 'cm' && displayUnit === 'inches') {
      const converted = (num / 2.54).toFixed(1)
      return `${converted}"`
    }

    return `${num} ${displayUnit}`
  }

  return (
    <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-6 sm:p-8 shadow-md relative overflow-hidden space-y-6">
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 blur-[50px] rounded-full pointer-events-none" />

      {/* HEADER BAR: Profile Title, Badges, Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#1e1b2e] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              {gender}
            </span>
            <span className="bg-pink-50 text-[#e91e8c] border border-pink-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              {garmentType}
            </span>
            {record.is_current ? (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                <Check className="w-3 h-3 text-emerald-600" />
                Active Profile
              </span>
            ) : (
              onMakeActive && (
                <button
                  type="button"
                  onClick={onMakeActive}
                  className="text-[10px] font-black uppercase tracking-wider text-gray-500 hover:text-emerald-700 underline"
                >
                  Set as Active
                </button>
              )
            )}
          </div>

          <h3 className="text-2xl font-extrabold text-[#1e1b2e] tracking-tight">{profileName}</h3>

          <p className="text-xs text-gray-400 font-semibold flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            Logged on {new Date(record.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
          </p>
        </div>

        {/* Action Controls & Unit Switcher */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Display Unit Switcher */}
          <div className="bg-[#FAFAF8] p-1 rounded-xl border border-gray-200 flex items-center mr-2">
            <button
              type="button"
              onClick={() => setDisplayUnit('inches')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                displayUnit === 'inches' ? 'bg-[#1e1b2e] text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              in
            </button>
            <button
              type="button"
              onClick={() => setDisplayUnit('cm')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                displayUnit === 'cm' ? 'bg-[#1e1b2e] text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              cm
            </button>
          </div>

          {onDuplicate && (
            <button
              type="button"
              onClick={onDuplicate}
              className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              title="Duplicate Profile"
            >
              <Copy className="w-4 h-4 text-gray-600" />
              <span className="hidden sm:inline">Duplicate</span>
            </button>
          )}

          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="p-2.5 bg-pink-50 hover:bg-pink-100 text-[#e91e8c] border border-pink-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              title="Edit Profile"
            >
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              title="Delete Profile"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* NOTES BANNER IF PRESENT */}
      {notes && (
        <div className="bg-[#FAFAF8] border border-gray-200/80 rounded-2xl p-4 text-xs font-medium text-gray-700">
          <strong className="text-gray-900 uppercase font-black tracking-widest text-[10px] block mb-1">
            Fit Notes:
          </strong>
          "{notes}"
        </div>
      )}

      {/* SECTIONS BREAKDOWN */}
      <div className="space-y-6">
        {MEASUREMENT_SECTIONS.map((sec) => {
          if (sec.key === 'custom_fields') return null

          const secFields = ALL_MEASUREMENT_FIELDS.filter((f) => f.section === sec.key)
          // Filter to fields that actually have recorded values
          const filledFields = secFields.filter((f) => {
            const v = rawJson[f.key]
            return v !== undefined && v !== null && v !== ''
          })

          if (filledFields.length === 0) return null

          const isExpanded = expandedSections[sec.key] ?? true

          return (
            <div key={sec.key} className="space-y-3">
              <button
                type="button"
                onClick={() => toggleSection(sec.key)}
                className="w-full flex items-center justify-between text-left group py-1"
              >
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-900 transition-colors">
                    {sec.label}
                  </h4>
                  <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {filledFields.length}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {isExpanded && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 animate-in fade-in duration-200">
                  {filledFields.map((f) => {
                    const val = rawJson[f.key]
                    return (
                      <div
                        key={f.key}
                        className="bg-[#FAFAF8] p-3.5 border border-gray-100 rounded-2xl flex flex-col justify-between"
                      >
                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider truncate">
                          {f.label}
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-[#1e1b2e] italic mt-1">
                          {formatValue(val)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {/* CUSTOM FIELDS DISPLAY */}
        {customFields.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black text-[#e91e8c] uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Custom Measurements ({customFields.length})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {customFields.map((cf: any) => (
                <div
                  key={cf.id || cf.name}
                  className="bg-[#e91e8c]/[0.03] border border-[#e91e8c]/20 rounded-2xl p-4 flex flex-col justify-between"
                >
                  <span className="text-[10px] font-black text-[#e91e8c] uppercase tracking-wider">
                    {cf.name}
                  </span>
                  <span className="text-2xl font-black text-[#1e1b2e] italic mt-1">
                    {formatValue(cf.value)}
                  </span>
                  {cf.notes && <span className="text-[11px] text-gray-500 italic mt-1">"{cf.notes}"</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
