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
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#18131d] to-[#2c1b26] p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden space-y-1">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#4a1525]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2 text-xs font-semibold text-rose-300 uppercase tracking-widest">
          <CreditCard className="w-4 h-4 text-rose-400" />
          <span>Atelier Billing & Revenue</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-white">
          Client Invoices
        </h1>
        <p className="text-stone-300 text-sm sm:text-base max-w-xl font-light">
          Monitor revenue stream, outstanding client balances, and payment status across all fashion projects.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-[#4a1525]">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <p className="text-2xl font-serif font-bold text-stone-900">{initialInvoices.length}</p>
            <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest mt-0.5">Total Invoices</p>
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-2xl font-serif font-bold text-stone-900">₦{totalRevenue.toLocaleString()}</p>
            <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest mt-0.5">Collected ({paidCount})</p>
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-2xl font-serif font-bold text-stone-900">₦{unpaidTotal.toLocaleString()}</p>
            <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest mt-0.5">Outstanding ({unpaidCount})</p>
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <p className="text-2xl font-serif font-bold text-stone-900">
              {initialInvoices.length > 0 ? Math.round((paidCount / initialInvoices.length) * 100) : 0}%
            </p>
            <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest mt-0.5">Collection Rate</p>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice by client name or project title..."
            className="w-full bg-white border border-stone-200 rounded-xl py-3 pl-11 pr-4 text-stone-900 text-sm focus:outline-none focus:border-[#4a1525] transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-white border border-stone-200 rounded-xl">
          <Filter className="w-4 h-4 text-stone-400 ml-2 flex-shrink-0" />
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                statusFilter === f.value
                  ? 'bg-[#18131d] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center bg-white border border-dashed border-stone-200 rounded-3xl space-y-4">
          <div className="w-16 h-16 bg-[#FAF8F5] rounded-2xl flex items-center justify-center mx-auto text-stone-400">
            <Inbox className="w-8 h-8 text-[#4a1525]" />
          </div>
          <div className="space-y-1 max-w-xs mx-auto">
            <p className="font-serif font-bold text-stone-900 text-lg">No invoices found</p>
            <p className="text-stone-500 text-xs sm:text-sm">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or status filter.'
                : 'Generate invoices from the Projects tab on a client\'s workspace profile.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-[1fr_1.2fr_1fr_0.8fr_auto] gap-4 px-6 py-3.5 bg-[#FAF8F5] border-b border-stone-200">
            <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">Invoice Ref</span>
            <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">Client / Project</span>
            <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">Amount</span>
            <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">Status</span>
            <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest text-right">Action</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-stone-100">
            {filtered.map((inv) => {
              const isPaid = inv.status === 'paid'
              const isOverdue = !isPaid && inv.due_date && new Date(inv.due_date) < new Date()
              const customer = inv.jobs?.customers

              return (
                <div
                  key={inv.id}
                  className="flex flex-col sm:grid sm:grid-cols-[1fr_1.2fr_1fr_0.8fr_auto] gap-3 sm:gap-4 px-6 py-4 hover:bg-stone-50/70 transition-colors group items-center"
                >
                  {/* Invoice ID */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900 text-sm">#INV-{inv.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-[11px] text-stone-400 font-medium">
                        {new Date(inv.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Client / Order */}
                  <div className="w-full sm:w-auto">
                    <p className="font-serif font-bold text-stone-900 text-sm">{customer?.full_name || 'Client Unassigned'}</p>
                    <p className="text-xs text-stone-500 font-medium truncate max-w-[200px]">{inv.jobs?.title || '—'}</p>
                  </div>

                  {/* Amount */}
                  <div className="w-full sm:w-auto">
                    <p className="font-serif text-base font-bold text-stone-900">₦{inv.total_amount.toLocaleString()}</p>
                    {inv.due_date && (
                      <p className={`text-[10px] font-medium ${isOverdue ? 'text-rose-600' : 'text-stone-400'}`}>
                        {isOverdue ? '⚠ Overdue' : `Due: ${new Date(inv.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                      </p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="w-full sm:w-auto">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      isPaid
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isOverdue
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Unpaid'}
                    </span>
                  </div>

                  {/* View Action */}
                  <div className="w-full sm:w-auto text-right">
                    <Link href={`/dashboard/invoices/${inv.id}`}>
                      <button className="inline-flex items-center gap-1 text-xs font-semibold text-[#4a1525] hover:text-[#18131d] transition-colors">
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

