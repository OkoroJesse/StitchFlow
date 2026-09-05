'use client'

import React, { useState } from 'react'
import { ALL_MEASUREMENT_FIELDS, MeasurementUnit } from '@/lib/constants'
import { X, ArrowRightLeft, Check, Sparkles } from 'lucide-react'

interface Props {
  records: any[]
  isOpen: boolean
  onClose: () => void
}

export default function MeasurementCompareModal({ records, isOpen, onClose }: Props) {
  if (!isOpen || !records || records.length === 0) return null

  // Unit for comparison display
  const [compareUnit, setCompareUnit] = useState<MeasurementUnit>('inches')

  // Find all field keys present in at least one record
  const presentFieldKeys = Array.from(
    new Set(
      records.flatMap((r) => {
        const json = (r.measurements as Record<string, any>) || {}
        return Object.keys(json).filter((k) => k !== '_metadata')
      })
    )
  )

  const formatValue = (val: any, recordUnit: string) => {
    if (val === undefined || val === null || val === '') return '—'
    const num = Number(val)
    if (isNaN(num)) return String(val)

    if (recordUnit === compareUnit) {
      return `${num} ${compareUnit === 'inches' ? '"' : 'cm'}`
    }
    if (recordUnit === 'inches' && compareUnit === 'cm') {
      return `${(num * 2.54).toFixed(1)} cm`
    }
    if (recordUnit === 'cm' && compareUnit === 'inches') {
      return `${(num / 2.54).toFixed(1)}"`
    }
    return `${num} ${compareUnit}`
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* MODAL HEADER */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-[#FAFAF8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#e91e8c]/10 text-[#e91e8c] rounded-2xl flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#1e1b2e]">Compare Measurement Specs</h3>
              <p className="text-xs text-gray-500">
                Comparing {records.length} profile versions side-by-side
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Unit switcher */}
            <div className="bg-white p-1 rounded-xl border border-gray-200 flex items-center">
              <button
                type="button"
                onClick={() => setCompareUnit('inches')}
                className={`px-3 py-1 rounded-lg text-xs font-black uppercase transition-all ${
                  compareUnit === 'inches' ? 'bg-[#1e1b2e] text-white' : 'text-gray-500'
                }`}
              >
                in
              </button>
              <button
                type="button"
                onClick={() => setCompareUnit('cm')}
                className={`px-3 py-1 rounded-lg text-xs font-black uppercase transition-all ${
                  compareUnit === 'cm' ? 'bg-[#1e1b2e] text-white' : 'text-gray-500'
                }`}
              >
                cm
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-xl bg-white border border-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* COMPARISON TABLE */}
        <div className="p-6 overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-50/50 sticky left-0 z-10">
                  Measurement Field
                </th>
                {records.map((rec) => {
                  const meta = rec.measurements?._metadata || {}
                  const name = meta.profile_name || rec.profile_name || rec.label || 'Profile'
                  const garment = meta.garment_type || rec.garment_type || 'General'

                  return (
                    <th key={rec.id} className="py-3 px-4 text-center min-w-[160px] bg-gray-50/50">
                      <div className="space-y-1">
                        <span className="text-xs font-black text-[#1e1b2e] block truncate">{name}</span>
                        <span className="text-[10px] font-bold text-[#e91e8c] bg-pink-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block">
                          {garment}
                        </span>
                        {rec.is_current && (
                          <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider block mt-1">
                            Active
                          </span>
                        )}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {presentFieldKeys.map((fieldKey) => {
                const fieldDef = ALL_MEASUREMENT_FIELDS.find((f) => f.key === fieldKey)
                const fieldLabel = fieldDef ? fieldDef.label : fieldKey.replace(/_/g, ' ')

                // Extract all values for diff comparison
                const vals = records.map((rec) => rec.measurements?.[fieldKey])
                const isDifferent = new Set(vals.filter((v) => v !== undefined && v !== null)).size > 1

                return (
                  <tr key={fieldKey} className={isDifferent ? 'bg-amber-50/20' : 'hover:bg-gray-50/50'}>
                    <td className="py-3.5 px-4 font-bold text-xs text-gray-700 bg-white sticky left-0 z-10 border-r border-gray-100">
                      {fieldLabel}
                    </td>
                    {records.map((rec) => {
                      const meta = rec.measurements?._metadata || {}
                      const recUnit = meta.unit || rec.unit || 'inches'
                      const val = rec.measurements?.[fieldKey]

                      return (
                        <td key={rec.id} className="py-3.5 px-4 text-center font-black text-sm text-gray-900">
                          <span className={val ? (isDifferent ? 'text-[#e91e8c]' : 'text-gray-900') : 'text-gray-300'}>
                            {formatValue(val, recUnit)}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
