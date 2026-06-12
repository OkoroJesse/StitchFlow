'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Phone, 
  MapPin, 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Calendar,
  Ruler,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  ArrowUpRight,
  Star as StarIcon,
  Trash2,
  Edit,
  ChevronRight,
  Copy,
  Check,
  Loader2,
  ArrowLeft,
  X
} from 'lucide-react'
import { Button } from '@/components/shared/button'
import { MEASUREMENT_FIELDS, getStatusStyle, getStatusLabel, JOB_STATUSES, MeasurementValues } from '@/lib/constants'
import { updateCustomer, deleteCustomer } from '@/actions/customers'
import { saveMeasurements, deleteMeasurement } from '@/actions/measurements'
import { updateJobStatus, deleteJob } from '@/actions/jobs'
import { createInvoice, updateInvoiceStatus } from '@/actions/invoices'

interface Invoice {
  id: string
  status: string
  created_at: string
  total_amount: number
}

interface Job {
  id: string
  title: string
  status: string
  agreed_price: number
  delivery_date: string
  fabric_image_url?: string | null
  style_image_url?: string | null
  review_token?: string
  measurement_id?: string | null
  created_at: string
  invoices?: Invoice[]
}

interface MeasurementRecord {
  id: string
  label: string
  measurements: any // JSON type
  is_current: boolean
  created_at: string
}

interface Customer {
  id: string
  full_name: string
  phone_number: string
  email: string | null
  address: string
  notes: string | null
  created_at: string
  jobs: Job[]
  measurements: MeasurementRecord[]
}

interface Props {
  customer: Customer
}

export default function CustomerProfileClient({ customer }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'orders' | 'measurements' | 'invoices'>('orders')
  const [isPending, startTransition] = useTransition()
  
  // UI states
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [copiedJobId, setCopiedJobId] = useState<string | null>(null)
  
  // Measurements states
  const [showAddMeasurements, setShowAddMeasurements] = useState(false)
  const [selectedMeasurementId, setSelectedMeasurementId] = useState<string | null>(
    customer.measurements.find(m => m.is_current)?.id || customer.measurements[0]?.id || null
  )

  const activeJobs = customer.jobs.filter(j => j.status !== 'delivered')
  const invoices = customer.jobs.flatMap(j => j.invoices || [])
  const unpaidInvoices = invoices.filter(i => i.status !== 'paid')

  // Find the currently displayed measurement record
  const displayedMeasurement = customer.measurements.find(m => m.id === selectedMeasurementId) || customer.measurements.find(m => m.is_current)

  // Copy Review Link Helper
  const handleCopyReviewLink = async (token?: string, jobId?: string) => {
    if (!token || !jobId) return
    const url = `${window.location.origin}/review/${token}`
    await navigator.clipboard.writeText(url)
    setCopiedJobId(jobId)
    setTimeout(() => setCopiedJobId(null), 2000)
  }

  // Profile Form Handler
  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await updateCustomer(customer.id, formData)
        setIsEditingProfile(false)
        router.refresh()
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to update profile')
      }
    })
  }

  // Client Deletion Handler
  const handleDeleteClient = () => {
    if (confirm('Are you absolutely sure you want to delete this client? All their orders and measurements will be deleted.')) {
      startTransition(async () => {
        try {
          await deleteCustomer(customer.id)
          router.push('/dashboard/customers')
          router.refresh()
        } catch (err) {
          alert(err instanceof Error ? err.message : 'Failed to delete client')
        }
      })
    }
  }

  // Measurement Form Handler
  const handleSaveMeasurements = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const label = formData.get('label') as string || 'Standard'
    
    const measurementsObj: Record<string, number> = {}
    MEASUREMENT_FIELDS.forEach(field => {
      const val = formData.get(field.key)
      if (val) {
        measurementsObj[field.key] = parseFloat(val as string)
      }
    })

    startTransition(async () => {
      try {
        const saved = await saveMeasurements(customer.id, measurementsObj, label)
        setShowAddMeasurements(false)
        setSelectedMeasurementId(saved.id)
        router.refresh()
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to save measurements')
      }
    })
  }

  // Delete Measurement Handler
  const handleDeleteMeasurementRecord = (measId: string) => {
    if (confirm('Are you sure you want to delete this measurement record?')) {
      startTransition(async () => {
        try {
          await deleteMeasurement(measId, customer.id)
          if (selectedMeasurementId === measId) {
            setSelectedMeasurementId(null)
          }
          router.refresh()
        } catch (err) {
          alert(err instanceof Error ? err.message : 'Failed to delete measurement')
        }
      })
    }
  }

  // Job Status Changer
  const handleStatusChange = async (jobId: string, newStatus: string) => {
    startTransition(async () => {
      try {
        await updateJobStatus(jobId, newStatus, customer.id)
        router.refresh()
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to update status')
      }
    })
  }

  // Generate Invoice Handler
  const handleGenerateInvoice = async (jobId: string, amount: number) => {
    startTransition(async () => {
      try {
        await createInvoice(jobId, customer.id, amount)
        router.refresh()
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to generate invoice')
      }
    })
  }

  // Pay Invoice Handler
  const handleMarkInvoicePaid = async (invoiceId: string) => {
    startTransition(async () => {
      try {
        await updateInvoiceStatus(invoiceId, 'paid', customer.id)
        router.refresh()
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to update invoice status')
      }
    })
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      {/* Back to clients */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/customers">
          <Button variant="ghost" icon={<ArrowLeft className="w-5 h-5" />} className="px-4 py-2">
            Back to Clients
          </Button>
        </Link>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            icon={<Edit className="w-4 h-4" />} 
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="text-gray-600 border border-gray-200"
          >
            Edit Profile
          </Button>
          <Button 
            variant="danger" 
            icon={<Trash2 className="w-4 h-4" />} 
            onClick={handleDeleteClient}
            className="px-4.5"
          >
            Delete Client
          </Button>
        </div>
      </div>

      {/* 1. CUSTOMER PROFILE HEADER */}
      {isEditingProfile ? (
        <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-extrabold text-[#1e1b2e]">Edit Client Details</h2>
            <button onClick={() => setIsEditingProfile(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Full Name</label>
                <input
                  name="full_name"
                  defaultValue={customer.full_name}
                  required
                  className="w-full bg-[#FAFAF8] border border-gray-200 rounded-xl p-4 text-gray-900 focus:border-[#e91e8c] focus:outline-none transition-all font-semibold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Phone Number</label>
                <input
                  name="phone_number"
                  defaultValue={customer.phone_number}
                  required
                  className="w-full bg-[#FAFAF8] border border-gray-200 rounded-xl p-4 text-gray-900 focus:border-[#e91e8c] focus:outline-none transition-all font-semibold"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={customer.email || ''}
                  className="w-full bg-[#FAFAF8] border border-gray-200 rounded-xl p-4 text-gray-900 focus:border-[#e91e8c] focus:outline-none transition-all font-semibold"
                  placeholder="client@email.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Studio/Home Address</label>
                <input
                  name="address"
                  defaultValue={customer.address}
                  required
                  className="w-full bg-[#FAFAF8] border border-gray-200 rounded-xl p-4 text-gray-900 focus:border-[#e91e8c] focus:outline-none transition-all font-semibold"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Designer Notes (Internal)</label>
              <textarea
                name="notes"
                rows={3}
                defaultValue={customer.notes || ''}
                className="w-full bg-[#FAFAF8] border border-gray-200 rounded-2xl p-4 text-gray-900 focus:border-[#e91e8c] focus:outline-none transition-all font-medium resize-none italic"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
              <Button type="submit" loading={isPending}>Save Changes</Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#e91e8c]/5 blur-[120px] -z-10 rounded-full" />
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-24 h-24 bg-[#1e1b2e] rounded-[2rem] flex items-center justify-center text-pink-500 text-4xl font-black shadow-lg shadow-[#e91e8c]/10 shrink-0">
                {customer.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-2.5">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1e1b2e] tracking-tight uppercase">
                  {customer.full_name}
                </h1>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-500">
                  <div className="flex items-center gap-2 font-semibold text-base">
                    <Phone className="w-5 h-5 text-[#e91e8c]" />
                    <span>{customer.phone_number}</span>
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-2 font-semibold text-base">
                      <span className="text-[#e91e8c] font-bold">@</span>
                      <span>{customer.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 font-semibold text-base">
                    <MapPin className="w-5 h-5 text-[#e91e8c]" />
                    <span>{customer.address}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="flex gap-4 w-full sm:w-auto">
              <div className="flex-1 sm:flex-none text-center px-8 py-5 bg-[#FAFAF8] rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-3xl font-extrabold text-[#1e1b2e] leading-none tracking-tight">{customer.jobs.length}</p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-2">Projects</p>
              </div>
              <div className="flex-1 sm:flex-none text-center px-8 py-5 bg-[#e91e8c]/5 rounded-2xl border border-[#e91e8c]/10 shadow-sm">
                <p className="text-3xl font-extrabold text-[#e91e8c] leading-none tracking-tight">{activeJobs.length}</p>
                <p className="text-xs font-bold text-[#e91e8c]/80 uppercase tracking-wider mt-2">Active</p>
              </div>
            </div>
          </div>

          {customer.notes && (
            <div className="mt-8 p-5 bg-[#FAFAF8] rounded-2xl border border-gray-100 flex gap-4">
              <FileText className="w-5 h-5 text-[#e91e8c] shrink-0 mt-0.5" />
              <p className="text-base font-medium text-gray-500 leading-relaxed italic">&ldquo;{customer.notes}&rdquo;</p>
            </div>
          )}
        </div>
      )}

      {/* 2. TABS NAVIGATION */}
      <div className="flex border-b border-gray-200 gap-8 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2.5 py-4 px-1 font-bold text-lg border-b-4 transition-all whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-[#e91e8c] text-[#e91e8c]'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Orders</span>
          {customer.jobs.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'orders' ? 'bg-[#e91e8c]/15 text-[#e91e8c]' : 'bg-gray-100 text-gray-500'
            }`}>
              {customer.jobs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('measurements')}
          className={`flex items-center gap-2.5 py-4 px-1 font-bold text-lg border-b-4 transition-all whitespace-nowrap ${
            activeTab === 'measurements'
              ? 'border-[#e91e8c] text-[#e91e8c]'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <Ruler className="w-5 h-5" />
          <span>Measurements</span>
          {customer.measurements.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'measurements' ? 'bg-[#e91e8c]/15 text-[#e91e8c]' : 'bg-gray-100 text-gray-500'
            }`}>
              {customer.measurements.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center gap-2.5 py-4 px-1 font-bold text-lg border-b-4 transition-all whitespace-nowrap ${
            activeTab === 'invoices'
              ? 'border-[#e91e8c] text-[#e91e8c]'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span>Invoices</span>
          {unpaidInvoices.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white animate-pulse">
              {unpaidInvoices.length} Unpaid
            </span>
          )}
        </button>
      </div>

      {/* 3. TAB CONTENT */}
      <div className="min-h-[300px]">
        {isPending && (
          <div className="flex items-center justify-center py-12 gap-2 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Updating...</span>
          </div>
        )}

        {/* --- ORDERS TAB --- */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#1e1b2e] uppercase tracking-tight">Project Directory</h3>
              <Link href={`/dashboard/orders/new?customer=${customer.id}`}>
                <Button icon={<Plus className="w-4 h-4" />} className="px-5 py-2.5 text-sm h-10">
                  New Order
                </Button>
              </Link>
            </div>

            {customer.jobs.length === 0 ? (
              <div className="bg-white border-2 border-gray-100 border-dashed rounded-[2.5rem] p-16 text-center space-y-4">
                <div className="w-16 h-16 bg-[#FAFAF8] rounded-full flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8 text-gray-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-[#1e1b2e] font-bold">No orders logged yet</p>
                  <p className="text-gray-500 text-sm">Click &ldquo;New Order&rdquo; to set up their first fashion fabrication project.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {customer.jobs.map((job) => {
                  const invoice = job.invoices?.[0]
                  
                  return (
                    <div 
                      key={job.id} 
                      className="bg-white border-2 border-gray-100 rounded-[2rem] p-6 hover:border-gray-200 transition-all shadow-md hover:shadow-xl relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-64 h-64 bg-[#e91e8c]/5 blur-[100px] -z-10 rounded-full" />
                      
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Reference Images */}
                        <div className="w-full md:w-36 h-36 bg-[#FAFAF8] rounded-2xl flex-shrink-0 overflow-hidden relative border border-gray-100">
                          {job.fabric_image_url ? (
                            <img src={job.fabric_image_url} className="absolute inset-0 w-full h-full object-cover" alt="Fabric" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                              <ShoppingBag className="w-10 h-10" />
                            </div>
                          )}
                        </div>

                        {/* Order Details */}
                        <div className="flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                              <div>
                                <h4 className="text-xl font-extrabold text-[#1e1b2e] tracking-tight">{job.title}</h4>
                                <p className="text-xs text-gray-400 mt-1 font-semibold uppercase tracking-wider">
                                  Created {new Date(job.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              
                              {/* Workflow status selector */}
                              <div className="flex items-center gap-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:inline">Status:</label>
                                <select
                                  value={job.status}
                                  onChange={(e) => handleStatusChange(job.id, e.target.value)}
                                  className={`rounded-lg px-3 py-1.5 text-sm font-bold border transition-colors focus:outline-none ${getStatusStyle(job.status)}`}
                                >
                                  {JOB_STATUSES.map((status) => (
                                    <option key={status.value} value={status.value} className="bg-white text-gray-800 font-semibold">
                                      {status.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 mt-3">
                              <span className="text-lg font-extrabold text-[#e91e8c]">₦{job.agreed_price.toLocaleString()}</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-sm font-semibold text-gray-500 flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span>Deadline: {new Date(job.delivery_date).toLocaleDateString()}</span>
                              </span>
                            </div>
                          </div>

                          {/* Action Bar */}
                          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100">
                            {/* Copy review link */}
                            <Button 
                              variant="ghost" 
                              onClick={() => handleCopyReviewLink(job.review_token, job.id)}
                              className="px-4 py-2 text-xs border border-gray-100 h-9 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg"
                              icon={copiedJobId === job.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            >
                              {copiedJobId === job.id ? 'Copied Link' : 'Copy Review Link'}
                            </Button>

                            {/* Invoice generator or view */}
                            {invoice ? (
                              <div className="flex items-center gap-2">
                                <Link href={`/dashboard/invoices/${invoice.id}`}>
                                  <Button 
                                    variant="ghost"
                                    className="px-4 py-2 text-xs border border-gray-100 h-9 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg"
                                    icon={<CreditCard className="w-3.5 h-3.5" />}
                                  >
                                    View Invoice (#INV-{invoice.id.slice(0, 4)})
                                  </Button>
                                </Link>
                                {invoice.status !== 'paid' && (
                                  <Button
                                    onClick={() => handleMarkInvoicePaid(invoice.id)}
                                    className="px-3.5 py-2 text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs"
                                  >
                                    Mark Paid
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <Button
                                onClick={() => handleGenerateInvoice(job.id, job.agreed_price)}
                                className="px-4 py-2 text-xs h-9 bg-[#1e1b2e] hover:bg-[#2d2540] text-white rounded-lg"
                                icon={<Plus className="w-3.5 h-3.5" />}
                              >
                                Generate Invoice
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* --- MEASUREMENTS TAB --- */}
        {activeTab === 'measurements' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#1e1b2e] uppercase tracking-tight">Dimensions & Fit</h3>
              {!showAddMeasurements && (
                <Button 
                  icon={<Plus className="w-4 h-4" />} 
                  onClick={() => setShowAddMeasurements(true)}
                  className="px-5 py-2.5 text-sm h-10"
                >
                  Log Measurements
                </Button>
              )}
            </div>

            {/* In-Line Measurements Addition Form */}
            {showAddMeasurements && (
              <div className="bg-white border-2 border-[#e91e8c]/20 rounded-[2rem] p-6 shadow-lg relative animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg font-extrabold text-[#1e1b2e]">Record New Measurements</h4>
                  <button 
                    onClick={() => setShowAddMeasurements(false)} 
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-lg bg-gray-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveMeasurements} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Record Label / Date</label>
                    <input
                      name="label"
                      required
                      defaultValue={`Standard (${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})`}
                      className="w-full bg-[#FAFAF8] border border-gray-200 rounded-xl p-4 text-gray-900 focus:border-[#e91e8c] focus:outline-none transition-all font-semibold"
                      placeholder="e.g. Standard Fit, January Update"
                    />
                  </div>

                  {/* Standard body measurements input matrix */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {MEASUREMENT_FIELDS.map((field) => (
                      <div key={field.key} className="space-y-1 bg-[#FAFAF8] p-3.5 border border-gray-100 rounded-xl">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
                          {field.label}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            name={field.key}
                            placeholder="0.0"
                            defaultValue={displayedMeasurement?.measurements?.[field.key] || ''}
                            className="w-full bg-transparent border-0 border-b border-gray-200 focus:border-[#e91e8c] focus:outline-none focus:ring-0 p-1 text-lg font-bold text-gray-900 pr-5"
                          />
                          <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">in</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button type="button" variant="ghost" onClick={() => setShowAddMeasurements(false)}>Cancel</Button>
                    <Button type="submit" loading={isPending}>Save Measurements</Button>
                  </div>
                </form>
              </div>
            )}

            {customer.measurements.length === 0 ? (
              <div className="bg-white border-2 border-gray-100 border-dashed rounded-[2.5rem] p-16 text-center space-y-4">
                <div className="w-16 h-16 bg-[#FAFAF8] rounded-full flex items-center justify-center mx-auto">
                  <Ruler className="w-8 h-8 text-gray-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-[#1e1b2e] font-bold">No dimensions logged yet</p>
                  <p className="text-gray-500 text-sm">Please log a measurement to ensure perfect fit tailoring.</p>
                </div>
                {!showAddMeasurements && (
                  <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddMeasurements(true)}>
                    Log First Measurements
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active measurements rendering card */}
                <div className="lg:col-span-2 bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 shadow-md relative overflow-hidden h-fit">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full" />
                  
                  {displayedMeasurement ? (
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h4 className="text-xl font-extrabold text-[#1e1b2e] tracking-tight">
                            {displayedMeasurement.label}
                          </h4>
                          <p className="text-xs text-gray-400 font-semibold uppercase mt-0.5 tracking-wider">
                            Logged {new Date(displayedMeasurement.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {displayedMeasurement.is_current && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold shadow-xs">
                            Active Spec
                          </span>
                        )}
                      </div>

                      {/* Display measurements grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                        {MEASUREMENT_FIELDS.map((field) => {
                          const val = displayedMeasurement.measurements?.[field.key]
                          return (
                            <div key={field.key} className="bg-[#FAFAF8] p-4 border border-gray-100 rounded-2xl flex flex-col justify-between">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                {field.label}
                              </span>
                              <span className="text-2xl font-black text-[#1e1b2e] italic mt-2">
                                {val !== undefined && val !== null ? `${val}"` : '—'}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-gray-400">
                      Select a measurement record to inspect.
                    </div>
                  )}
                </div>

                {/* History list card */}
                <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-6 shadow-md h-fit">
                  <h4 className="text-lg font-extrabold text-[#1e1b2e] mb-4 uppercase tracking-tight">Record Logs</h4>
                  
                  <div className="space-y-3">
                    {customer.measurements.map((record) => (
                      <div 
                        key={record.id}
                        onClick={() => setSelectedMeasurementId(record.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                          (selectedMeasurementId === record.id || (!selectedMeasurementId && record.is_current))
                            ? 'bg-[#1e1b2e] text-white border-[#1e1b2e] shadow-md shadow-[#1e1b2e]/10'
                            : 'bg-white text-gray-700 border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="font-bold truncate text-base">{record.label}</p>
                          <p className={`text-xs mt-1 ${
                            (selectedMeasurementId === record.id || (!selectedMeasurementId && record.is_current))
                              ? 'text-gray-300' : 'text-gray-400'
                          }`}>
                            {new Date(record.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          {record.is_current && (
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                              (selectedMeasurementId === record.id || (!selectedMeasurementId && record.is_current))
                                ? 'bg-[#e91e8c] text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            }`}>
                              Active
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteMeasurementRecord(record.id)
                            }}
                            className={`p-1.5 rounded-lg border transition-all ${
                              (selectedMeasurementId === record.id || (!selectedMeasurementId && record.is_current))
                                ? 'text-gray-400 hover:text-white border-gray-800 hover:bg-gray-800'
                                : 'text-gray-400 hover:text-red-500 border-gray-100 hover:bg-red-50'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- INVOICES TAB --- */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-[#1e1b2e] uppercase tracking-tight">Invoice History</h3>

            {invoices.length === 0 ? (
              <div className="bg-white border-2 border-gray-100 border-dashed rounded-[2.5rem] p-16 text-center space-y-4">
                <div className="w-16 h-16 bg-[#FAFAF8] rounded-full flex items-center justify-center mx-auto">
                  <CreditCard className="w-8 h-8 text-gray-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-[#1e1b2e] font-bold">No invoices generated yet</p>
                  <p className="text-gray-500 text-sm">Invoices are automatically created or manual on the Orders tab.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {invoices.map((inv) => (
                  <div 
                    key={inv.id}
                    className="bg-white border-2 border-gray-100 rounded-3xl p-6 hover:border-gray-200 transition-all shadow-md flex justify-between items-center group relative overflow-hidden"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <Link href={`/dashboard/invoices/${inv.id}`} className="hover:underline flex items-center gap-1 font-extrabold text-[#1e1b2e] text-lg">
                          <span>#INV-{inv.id.slice(0, 4).toUpperCase()}</span>
                          <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Link>
                        
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          inv.status === 'paid' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse'
                        }`}>
                          {inv.status === 'paid' ? 'Paid' : 'Unpaid'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                        Issued {new Date(inv.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-black text-[#1e1b2e] italic">₦{inv.total_amount.toLocaleString()}</span>
                      
                      {inv.status !== 'paid' && (
                        <Button
                          onClick={() => handleMarkInvoicePaid(inv.id)}
                          className="px-4 py-2 text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
                        >
                          Mark Paid
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
