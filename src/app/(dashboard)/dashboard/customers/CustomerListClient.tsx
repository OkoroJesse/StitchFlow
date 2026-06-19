'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, User, Phone, MapPin, MoreVertical, Copy, Check, Trash2, ExternalLink, Mail } from 'lucide-react'
import { Button } from '@/components/shared/button'
import { deleteCustomer } from '@/actions/customers'

interface Customer {
  id: string
  full_name: string
  phone_number: string
  email: string | null
  address: string
  notes: string | null
  created_at: string
  jobs?: { id: string; title: string; status: string; agreed_price?: number; created_at?: string; delivery_date?: string }[]
}

interface CustomerListClientProps {
  initialCustomers: Customer[]
}

export default function CustomerListClient({ initialCustomers }: CustomerListClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredCustomers = initialCustomers.filter((customer) => {
    const query = searchQuery.toLowerCase()
    return (
      customer.full_name.toLowerCase().includes(query) ||
      (customer.phone_number && customer.phone_number.toLowerCase().includes(query)) ||
      (customer.address && customer.address.toLowerCase().includes(query)) ||
      (customer.email && customer.email.toLowerCase().includes(query))
    )
  })

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete client "${name}"? This action cannot be undone.`)) {
      try {
        await deleteCustomer(id)
        router.refresh()
      } catch (err: any) {
        alert(err.message || 'Failed to delete customer')
      }
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
  }

  const getJobDateRange = (customer: Customer) => {
    if (!customer.jobs || customer.jobs.length === 0) {
      return formatDate(customer.created_at)
    }
    const dates = customer.jobs.map(j => j.created_at ? new Date(j.created_at).getTime() : 0).filter(Boolean)
    const deliveryDates = customer.jobs.map(j => j.delivery_date ? new Date(j.delivery_date).getTime() : 0).filter(Boolean)
    
    if (dates.length === 0) return formatDate(customer.created_at)
    
    const minDate = new Date(Math.min(...dates))
    const maxDate = deliveryDates.length > 0 ? new Date(Math.max(...deliveryDates)) : minDate
    
    return `${minDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} - ${maxDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}`
  }

  const getJobsAmount = (customer: Customer) => {
    if (!customer.jobs || customer.jobs.length === 0) return '₦0.00'
    const total = customer.jobs.reduce((sum, job) => sum + (job.agreed_price || 0), 0)
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 }).format(total)
  }

  const getCustomerStatus = (customer: Customer) => {
    const activeJobs = customer.jobs?.filter(j => j.status !== 'delivered') || []
    return activeJobs.length > 0 ? 'Active' : 'Inactive'
  }

  const getLatestJobSubject = (customer: Customer) => {
    if (!customer.jobs || customer.jobs.length === 0) return 'No active projects'
    const sorted = [...customer.jobs].sort((a, b) => {
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
    })
    return sorted[0].title || 'Untitled Project'
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-pink-100 text-pink-700',
      'bg-indigo-100 text-indigo-700',
      'bg-teal-100 text-teal-700',
      'bg-amber-100 text-amber-700'
    ]
    const code = name.charCodeAt(0) || 0
    return colors[code % colors.length]
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER WITH ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1e1b2e] tracking-tight flex items-center gap-2">
            <span className="p-1.5 bg-[#e91e8c]/10 rounded-xl text-[#e91e8c]">
              <User className="w-5 h-5" />
            </span>
            Clients Directory
          </h1>
          <p className="text-gray-500 mt-1 text-xs sm:text-sm">
            Manage your customer database, measurements, and active orders.
          </p>
        </div>
        <Link href="/dashboard/customers/new" className="w-full sm:w-auto">
          <Button icon={<Plus className="w-4 h-4" />} className="w-full sm:w-auto">
            Add New Client
          </Button>
        </Link>
      </div>

      {/* SEARCH CONTROL */}
      <div className="relative shadow-sm rounded-xl">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, phone, email, or address..."
          className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#e91e8c]/10 focus:border-[#e91e8c] transition-all font-semibold text-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold text-xs bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-all"
          >
            Clear
          </button>
        )}
      </div>

      {/* COMPACT TABLE LAYOUT */}
      {filteredCustomers.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                  <th className="px-5 py-3.5 font-bold">Client</th>
                  <th className="px-5 py-3.5 font-bold">Email</th>
                  <th className="px-5 py-3.5 font-bold">Create & End Date</th>
                  <th className="px-5 py-3.5 font-bold">Amount</th>
                  <th className="px-5 py-3.5 font-bold">Status</th>
                  <th className="px-5 py-3.5 font-bold">Subject</th>
                  <th className="px-5 py-3.5 w-10 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((customer) => {
                  const status = getCustomerStatus(customer)
                  const isCopied = copiedId === customer.id

                  return (
                    <tr 
                      key={customer.id} 
                      className="hover:bg-gray-50/30 transition-colors text-xs text-gray-700"
                    >
                      {/* Name & Avatar */}
                      <td className="px-5 py-3.5">
                        <Link href={`/dashboard/customers/${customer.id}`} className="flex items-center gap-3 group">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${getAvatarColor(customer.full_name)}`}>
                            {customer.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 group-hover:text-[#e91e8c] transition-colors block">
                              {customer.full_name}
                            </span>
                            <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-gray-400" />
                              {customer.phone_number || 'No Phone'}
                            </span>
                          </div>
                        </Link>
                      </td>

                      {/* Email with copy button */}
                      <td className="px-5 py-3.5">
                        {customer.email ? (
                          <div>
                            <span className="font-medium text-gray-800">{customer.email}</span>
                            <button
                              onClick={() => copyToClipboard(customer.email || '', customer.id)}
                              className="flex items-center gap-1 mt-1 text-[9px] font-bold text-[#e91e8c] hover:text-[#c4177a] transition-colors"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-2.5 h-2.5 text-emerald-500" />
                                  <span className="text-emerald-600 font-bold">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-2.5 h-2.5" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No Email</span>
                        )}
                      </td>

                      {/* Created / Project date range */}
                      <td className="px-5 py-3.5 text-gray-500 font-medium">
                        {getJobDateRange(customer)}
                      </td>

                      {/* Total job value amount */}
                      <td className="px-5 py-3.5 font-bold text-gray-900">
                        {getJobsAmount(customer)}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-gray-50 text-gray-500 border-gray-200'
                        }`}>
                          {status}
                        </span>
                      </td>

                      {/* Subject (Latest Project) */}
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-gray-800 line-clamp-1 max-w-[150px]">
                          {getLatestJobSubject(customer)}
                        </span>
                      </td>

                      {/* Actions drop down */}
                      <td className="px-5 py-3.5 text-right relative">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveDropdown(activeDropdown === customer.id ? null : customer.id)
                            }}
                            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeDropdown === customer.id && (
                            <div 
                              ref={dropdownRef}
                              className="absolute right-5 mt-2 w-36 bg-white border border-gray-200 rounded-xl shadow-xl z-50 text-left overflow-hidden py-1"
                              style={{ top: '65%' }}
                            >
                              <Link
                                href={`/dashboard/customers/${customer.id}`}
                                className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 text-gray-700 text-xs font-semibold"
                                onClick={() => setActiveDropdown(null)}
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                                View Profile
                              </Link>
                              <button
                                onClick={() => {
                                  setActiveDropdown(null)
                                  handleDelete(customer.id, customer.full_name)
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 text-red-600 text-xs font-semibold"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                Delete Client
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="py-16 text-center bg-white border border-gray-200 border-dashed rounded-2xl space-y-4">
          <div className="w-14 h-14 bg-[#f8f7fc] rounded-2xl flex items-center justify-center mx-auto">
            <User className="w-7 h-7 text-gray-400" />
          </div>
          <div className="space-y-1 max-w-md mx-auto px-4">
            <p className="text-[#1e1b2e] font-bold text-base">No clients found</p>
            <p className="text-gray-500 text-xs">
              {searchQuery ? "Try refining your search query or clear the filter to see all clients." : "Add your first client to start recording measurements and jobs."}
            </p>
          </div>
          {!searchQuery && (
            <Link href="/dashboard/customers/new" className="inline-block">
              <Button icon={<Plus className="w-4 h-4" />}>Add Your First Client</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
