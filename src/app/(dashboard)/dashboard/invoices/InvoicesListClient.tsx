'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, Search, ChevronRight, TrendingUp, CreditCard, CheckCircle2, Clock, Inbox, Filter } from 'lucide-react'

interface Invoice {
  id: string
  status: string
  total_amount: number
  created_at: string
  due_date: string
  jobs?: {
    id: string
    title: string
    customers?: {
      id: string
      full_name: string
    } | null
  } | null
}

interface Props {
  initialInvoices: Invoice[]
}

const STATUS_FILTERS = [
  { value: 'all', label: 'All Invoices' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'paid', label: 'Paid' },
]

export default function InvoicesListClient({ initialInvoices }: Props) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = initialInvoices.filter((inv) => {
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter
    const name = inv.jobs?.customers?.full_name?.toLowerCase() || ''
    const title = inv.jobs?.title?.toLowerCase() || ''
    const matchSearch = name.includes(searchQuery.toLowerCase()) || title.includes(searchQuery.toLowerCase())
    return matchStatus && matchSearch
  })

  const totalRevenue = initialInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total_amount, 0)
  const unpaidTotal  = initialInvoices.filter(i => i.status === 'unpaid').reduce((s, i) => s + i.total_amount, 0)
  const paidCount    = initialInvoices.filter(i => i.status === 'paid').length
  const unpaidCount  = initialInvoices.filter(i => i.status === 'unpaid').length

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1e1b2e] tracking-tight flex items-center gap-3">
          <span className="p-2 rounded-2xl" style={{ background: 'rgba(233,30,140,0.08)' }}>
            <FileText className="w-8 h-8 text-[#e91e8c]" />
          </span>
          Invoices
        </h1>
        <p className="text-gray-500 mt-2 text-base font-medium">
          Track all generated invoices and payment statuses.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-gray-100 rounded-[1.75rem] p-5 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(233,30,140,0.08)' }}>
            <FileText className="w-5 h-5 text-[#e91e8c]" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-[#1e1b2e]">{initialInvoices.length}</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Total Invoices</p>
          </div>
        </div>
        <div className="bg-white border-2 border-gray-100 rounded-[1.75rem] p-5 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.08)' }}>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-[#1e1b2e]">₦{totalRevenue.toLocaleString()}</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Revenue Collected ({paidCount})</p>
          </div>
        </div>
        <div className="bg-white border-2 border-gray-100 rounded-[1.75rem] p-5 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.08)' }}>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-[#1e1b2e]">₦{unpaidTotal.toLocaleString()}</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Outstanding ({unpaidCount})</p>
          </div>
        </div>
        <div className="bg-white border-2 border-gray-100 rounded-[1.75rem] p-5 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.08)' }}>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-[#1e1b2e]">
              {initialInvoices.length > 0 ? Math.round((paidCount / initialInvoices.length) * 100) : 0}%
            </p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Collection Rate</p>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client or order name..."
            className="w-full bg-white border-2 border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 focus:outline-none focus:border-[#e91e8c] transition-all font-semibold"
          />
        </div>
        <div className="flex items-center gap-2 p-1 bg-white border-2 border-gray-100 rounded-2xl">
          <Filter className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                statusFilter === f.value
                  ? 'bg-[#1e1b2e] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List */}
      {filtered.length === 0 ? (
        <div className="py-24 text-center bg-white border-2 border-dashed border-gray-100 rounded-[3rem] space-y-5">
          <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto">
            <Inbox className="w-10 h-10 text-gray-300" />
          </div>
          <div className="space-y-1 max-w-xs mx-auto">
            <p className="font-extrabold text-[#1e1b2e] text-xl">No invoices found</p>
            <p className="text-gray-500 text-sm">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Generate invoices from the Orders tab on a client\'s profile.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white border-2 border-gray-100 rounded-[2rem] overflow-hidden shadow-sm">
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-[1fr_1.2fr_1fr_0.8fr_auto] gap-4 px-7 py-4 bg-[#FAFAF8] border-b border-gray-100">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice</span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Client / Order</span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-right pr-2">Action</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-50">
            {filtered.map((inv) => {
              const isPaid = inv.status === 'paid'
              const isOverdue = !isPaid && inv.due_date && new Date(inv.due_date) < new Date()
              const customer = inv.jobs?.customers

              return (
                <div
                  key={inv.id}
                  className="flex flex-col sm:grid sm:grid-cols-[1fr_1.2fr_1fr_0.8fr_auto] gap-3 sm:gap-4 px-7 py-5 hover:bg-gray-50/60 transition-colors group"
                >
                  {/* Invoice ID */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: isPaid ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)' }}>
                      <CreditCard className={`w-4 h-4 ${isPaid ? 'text-emerald-600' : 'text-amber-500'}`} />
                    </div>
                    <div>
                      <p className="font-extrabold text-[#1e1b2e] text-sm">#INV-{inv.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-[10px] font-semibold text-gray-400">
                        {new Date(inv.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Client / Order */}
                  <div className="sm:flex sm:flex-col sm:justify-center">
                    <p className="font-bold text-[#1e1b2e] text-sm">{customer?.full_name || 'Unknown Client'}</p>
                    <p className="text-xs text-gray-400 font-medium truncate max-w-[200px]">{inv.jobs?.title || '—'}</p>
                  </div>

                  {/* Amount */}
                  <div className="sm:flex sm:flex-col sm:justify-center">
                    <p className="text-lg font-black text-[#e91e8c]">₦{inv.total_amount.toLocaleString()}</p>
                    {inv.due_date && (
                      <p className={`text-[10px] font-bold ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                        {isOverdue ? '⚠ Overdue' : `Due: ${new Date(inv.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                      </p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="sm:flex sm:items-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      isPaid
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isOverdue
                        ? 'bg-red-50 text-red-600 border-red-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Unpaid'}
                    </span>
                  </div>

                  {/* View Action */}
                  <div className="sm:flex sm:items-center sm:justify-end">
                    <Link href={`/dashboard/invoices/${inv.id}`}>
                      <button className="flex items-center gap-1.5 text-xs font-bold text-[#e91e8c] hover:text-[#1e1b2e] transition-colors group-hover:gap-2.5">
                        View
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
