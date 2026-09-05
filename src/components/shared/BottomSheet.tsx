'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import {
  UserPlus,
  ShoppingBag,
  Calendar,
  FileText,
  Ruler,
  X,
  Plus,
} from 'lucide-react'

interface QuickActionItem {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  color: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
}

export const QUICK_ACTIONS: QuickActionItem[] = [
  {
    icon: <UserPlus className="w-5 h-5 text-[#4a1525]" />,
    title: 'New Client',
    description: 'Add a new client profile & contact info',
    href: '/dashboard/customers?action=new',
    color: 'bg-[#fbf0f3]',
  },
  {
    icon: <ShoppingBag className="w-5 h-5 text-purple-700" />,
    title: 'New Project',
    description: 'Create a fashion project with fabric & style',
    href: '/dashboard/orders/new',
    color: 'bg-purple-50',
  },
  {
    icon: <Calendar className="w-5 h-5 text-amber-700" />,
    title: 'New Appointment',
    description: 'Schedule a fitting or delivery appointment',
    href: '/dashboard/appointments?action=new',
    color: 'bg-amber-50',
  },
  {
    icon: <Ruler className="w-5 h-5 text-pink-700" />,
    title: 'New Measurement',
    description: 'Log body specs for Men or Women',
    href: '/dashboard/measurements?action=new',
    color: 'bg-pink-50',
  },
  {
    icon: <FileText className="w-5 h-5 text-emerald-700" />,
    title: 'New Invoice',
    description: 'Generate invoice documentation for a project',
    href: '/dashboard/invoices?action=new',
    color: 'bg-emerald-50',
  },
]

export function QuickActionBottomSheet({ isOpen, onClose }: Props) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet Container */}
      <div className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl z-10 animate-in slide-in-from-bottom duration-300 border border-stone-100 max-h-[85vh] overflow-y-auto">
        {/* Handle bar on mobile */}
        <div className="w-12 h-1 bg-stone-200 rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
          <div>
            <h3 className="text-xl font-extrabold text-[#18131d] tracking-tight">Quick Action</h3>
            <p className="text-xs text-stone-500">Create new fashion assets & entries</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 rounded-xl bg-stone-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Grid */}
        <div className="space-y-3">
          {QUICK_ACTIONS.map((act) => (
            <Link
              key={act.title}
              href={act.href}
              onClick={onClose}
              className="flex items-center gap-4 p-3.5 rounded-2xl border border-stone-100 hover:border-stone-200 hover:bg-[#FAF8F5] transition-all group"
            >
              <div className={`w-11 h-11 rounded-2xl ${act.color} flex items-center justify-center shrink-0`}>
                {act.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-sm text-[#18131d] group-hover:text-[#4a1525] transition-colors truncate">
                  {act.title}
                </h4>
                <p className="text-xs text-stone-500 truncate">{act.description}</p>
              </div>
              <Plus className="w-4 h-4 text-stone-400 group-hover:text-[#4a1525] transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
