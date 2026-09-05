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
import { MEASUREMENT_FIELDS, getStatusStyle, getStatusLabel, JOB_STATUSES } from '@/lib/constants'
import { updateCustomer, deleteCustomer } from '@/actions/customers'
import { 
  saveMeasurements, 
  deleteMeasurement, 
  duplicateMeasurement, 
  updateMeasurement, 
  setActiveMeasurement 
} from '@/actions/measurements'
import { updateJobStatus, deleteJob } from '@/actions/jobs'
import { createInvoice, updateInvoiceStatus } from '@/actions/invoices'
import MeasurementForm from '@/components/measurements/MeasurementForm'
import MeasurementViewer from '@/components/measurements/MeasurementViewer'
import MeasurementCompareModal from '@/components/measurements/MeasurementCompareModal'
import { ArrowRightLeft } from 'lucide-react'

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
  profile_name?: string | null
  garment_type?: string | null
  measurement_category?: string | null
  unit?: string | null
  notes?: string | null
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
  const [invoiceError, setInvoiceError] = useState<string | null>(null)
  
  // UI states
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [copiedJobId, setCopiedJobId] = useState<string | null>(null)
  
  // Measurements states
  const [showAddMeasurements, setShowAddMeasurements] = useState(false)
  const [editingRecord, setEditingRecord] = useState<any | null>(null)
  const [isCompareOpen, setIsCompareOpen] = useState(false)
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

  // Save / Update Measurement Profile Handler
  const handleSaveProfilePayload = async (payload: any) => {
    startTransition(async () => {
      try {
        if (editingRecord) {
          await updateMeasurement(editingRecord.id, customer.id, payload)
          setEditingRecord(null)
        } else {
          const saved = await saveMeasurements(customer.id, payload)
          setShowAddMeasurements(false)
          setSelectedMeasurementId(saved.id)
        }
        router.refresh()
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to save measurement profile')
      }
    })
  }

  // Duplicate Measurement Profile Handler
  const handleDuplicateProfileRecord = (record: any) => {
    const defaultName = `Copy of ${record.profile_name || record.label || 'Profile'}`
    const newName = prompt('Enter a name for the duplicated profile:', defaultName)
    if (!newName || !newName.trim()) return

    startTransition(async () => {
      try {
        const duplicated = await duplicateMeasurement(record.id, customer.id, newName.trim())
        setSelectedMeasurementId(duplicated.id)
        router.refresh()
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to duplicate profile')
      }
    })
  }

  // Make Active Measurement Handler
  const handleMakeActiveRecord = (recordId: string) => {
    startTransition(async () => {
      try {
        await setActiveMeasurement(recordId, customer.id)
        setSelectedMeasurementId(recordId)
        router.refresh()
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to activate profile')
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
    setInvoiceError(null)
    startTransition(async () => {
      const result = await createInvoice(jobId, customer.id, amount)
      if (result.success) {
        router.refresh()
      } else {
        setInvoiceError(result.error || 'Failed to generate invoice. Please try again.')
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
    <div className="space-y-6 animate-in fade-in duration-500 pb-16">

      {/* Invoice Error Banner */}
      {invoiceError && (
        <div className="rounded-xl p-3 text-sm border flex items-start gap-2.5" style={{ background: '#fdf2f8', borderColor: '#fce7f3', color: '#c4177a' }}>
          <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="flex-1">{invoiceError}</span>
          <button onClick={() => setInvoiceError(null)} className="flex-shrink-0 opacity-60 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Back to clients */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/dashboard/customers">
          <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />} className="px-3 py-2 text-sm">
            Back to Clients
          </Button>
        </Link>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            icon={<Edit className="w-4 h-4" />} 
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="text-gray-600 border border-gray-200 text-xs sm:text-sm px-2.5 sm:px-3"
          >
            <span className="hidden sm:inline">Edit Profile</span>
            <span className="sm:hidden">Edit</span>
          </Button>
          <Button 
            variant="danger" 
            icon={<Trash2 className="w-4 h-4" />} 
            onClick={handleDeleteClient}
            className="text-xs sm:text-sm px-2.5 sm:px-3"
          >
            <span className="hidden sm:inline">Delete Client</span>
            <span className="sm:hidden">Delete</span>
          </Button>
        </div>
      </div>

      {/* 1. CUSTOMER PROFILE HEADER */}
      {isEditingProfile ? (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-serif font-bold text-stone-900">Edit Client Details</h2>
            <button onClick={() => setIsEditingProfile(false)} className="text-stone-400 hover:text-stone-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">Full Name</label>
                <input
                  name="full_name"
                  defaultValue={customer.full_name}
                  required
                  className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl p-3.5 text-stone-900 focus:border-[#4a1525] focus:outline-none transition-all font-medium text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">Phone Number</label>
                <input
                  name="phone_number"
                  defaultValue={customer.phone_number}
                  required
                  className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl p-3.5 text-stone-900 focus:border-[#4a1525] focus:outline-none transition-all font-medium text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={customer.email || ''}
                  className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl p-3.5 text-stone-900 focus:border-[#4a1525] focus:outline-none transition-all font-medium text-sm"
                  placeholder="client@email.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">Studio/Home Address</label>
                <input
                  name="address"
                  defaultValue={customer.address}
                  required
                  className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl p-3.5 text-stone-900 focus:border-[#4a1525] focus:outline-none transition-all font-medium text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">Designer Notes (Internal)</label>
              <textarea
                name="notes"
                rows={3}
                defaultValue={customer.notes || ''}
                className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl p-3.5 text-stone-900 focus:border-[#4a1525] focus:outline-none transition-all font-medium resize-none text-sm italic"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
              <Button type="submit" variant="primary" loading={isPending}>Save Changes</Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-8 relative overflow-hidden shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex flex-row items-center gap-4 sm:gap-6 min-w-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#18131d] to-[#4a1525] rounded-2xl flex items-center justify-center text-rose-200 font-serif text-2xl sm:text-4xl font-bold shadow-md shrink-0">
                {customer.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-stone-900 tracking-tight truncate">
                  {customer.full_name}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-stone-600 text-xs sm:text-sm font-medium">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#4a1525]" />
                    <span>{customer.phone_number}</span>
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#4a1525] font-bold">@</span>
                      <span className="truncate max-w-[150px] sm:max-w-none">{customer.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#4a1525]" />
                    <span className="truncate max-w-[150px] sm:max-w-none">{customer.address}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="flex gap-3 w-full sm:w-auto">
              <div className="flex-1 sm:flex-none text-center px-5 py-3 bg-[#FAF8F5] rounded-2xl border border-stone-200">
                <p className="text-xl font-serif font-bold text-stone-900 leading-none">{customer.jobs.length}</p>
                <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest mt-1">Total Projects</p>
              </div>
              <div className="flex-1 sm:flex-none text-center px-5 py-3 bg-rose-50/50 rounded-2xl border border-rose-100">
                <p className="text-xl font-serif font-bold text-[#4a1525] leading-none">{activeJobs.length}</p>
                <p className="text-[10px] font-semibold text-rose-800 uppercase tracking-widest mt-1">In Production</p>
              </div>
            </div>
          </div>

          {customer.notes && (
            <div className="mt-5 p-4 bg-[#FAF8F5] rounded-2xl border border-stone-200 flex gap-3">
              <FileText className="w-4 h-4 text-[#4a1525] shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm font-medium text-stone-600 leading-relaxed italic">&ldquo;{customer.notes}&rdquo;</p>
            </div>
          )}
        </div>
      )}

      {/* 2. TABS NAVIGATION */}
      <div className="flex border-b border-stone-200 gap-4 sm:gap-8 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 py-3 px-1 font-semibold text-sm sm:text-base border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-[#4a1525] text-[#4a1525]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Projects</span>
          {customer.jobs.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'orders' ? 'bg-[#4a1525]/10 text-[#4a1525]' : 'bg-stone-100 text-stone-600'
            }`}>
              {customer.jobs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('measurements')}
          className={`flex items-center gap-2 py-3 px-1 font-semibold text-sm sm:text-base border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'measurements'
              ? 'border-[#4a1525] text-[#4a1525]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Ruler className="w-4 h-4" />
          <span>Measurements</span>
          {customer.measurements.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'measurements' ? 'bg-[#4a1525]/10 text-[#4a1525]' : 'bg-stone-100 text-stone-600'
            }`}>
              {customer.measurements.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center gap-2 py-3 px-1 font-semibold text-sm sm:text-base border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'invoices'
              ? 'border-[#4a1525] text-[#4a1525]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
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
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h3 className="text-xl font-bold text-[#1e1b2e] uppercase tracking-tight">Dimensions & Specifications</h3>
                <p className="text-xs text-gray-500">Categorized tailoring profiles and version history.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {customer.measurements.length > 1 && (
                  <Button
                    variant="ghost"
                    icon={<ArrowRightLeft className="w-4 h-4 text-[#e91e8c]" />}
                    onClick={() => setIsCompareOpen(true)}
                    className="px-4 py-2.5 text-xs sm:text-sm h-10 border border-pink-200 bg-pink-50 text-[#e91e8c]"
                  >
                    Compare Specs
                  </Button>
                )}
                {!showAddMeasurements && !editingRecord && (
                  <Button 
                    icon={<Plus className="w-4 h-4" />} 
                    onClick={() => setShowAddMeasurements(true)}
                    className="px-5 py-2.5 text-xs sm:text-sm h-10 bg-[#1e1b2e] hover:bg-[#2d2540] text-white"
                  >
                    New Measurement Profile
                  </Button>
                )}
              </div>
            </div>

            {/* Render Measurement Form when adding or editing */}
            {(showAddMeasurements || editingRecord) ? (
              <MeasurementForm
                customerName={customer.full_name}
                initialData={editingRecord}
                isPending={isPending}
                onCancel={() => {
                  setShowAddMeasurements(false)
                  setEditingRecord(null)
                }}
                onSave={handleSaveProfilePayload}
              />
            ) : customer.measurements.length === 0 ? (
              <div className="bg-white border-2 border-gray-100 border-dashed rounded-[2.5rem] p-12 sm:p-16 text-center space-y-4">
                <div className="w-16 h-16 bg-[#FAFAF8] rounded-full flex items-center justify-center mx-auto">
                  <Ruler className="w-8 h-8 text-gray-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-[#1e1b2e] font-bold text-lg">No measurement profiles logged yet</p>
                  <p className="text-gray-500 text-sm">Log custom garment profiles for Men & Women to ensure perfect fit tailoring.</p>
                </div>
                <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddMeasurements(true)} className="px-6 py-3">
                  Log First Profile
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active/Selected Profile Viewer */}
                <div className="lg:col-span-2">
                  {displayedMeasurement ? (
                    <MeasurementViewer
                      record={displayedMeasurement}
                      onEdit={() => setEditingRecord(displayedMeasurement)}
                      onDuplicate={() => handleDuplicateProfileRecord(displayedMeasurement)}
                      onDelete={() => handleDeleteMeasurementRecord(displayedMeasurement.id)}
                      onMakeActive={!displayedMeasurement.is_current ? () => handleMakeActiveRecord(displayedMeasurement.id) : undefined}
                    />
                  ) : (
                    <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-12 text-center text-gray-400">
                      Select a measurement record from history log to inspect.
                    </div>
                  )}
                </div>

                {/* Profile History Sidebar */}
                <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-6 shadow-md h-fit space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-[#1e1b2e] uppercase tracking-widest">
                      Profile History ({customer.measurements.length})
                    </h4>
                    {customer.measurements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setIsCompareOpen(true)}
                        className="text-[10px] font-black text-[#e91e8c] uppercase tracking-wider hover:underline"
                      >
                        Compare All
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {customer.measurements.map((record) => {
                      const isSelected = selectedMeasurementId === record.id || (!selectedMeasurementId && record.is_current)
                      const meta = record.measurements?._metadata || {}
                      const pName = meta.profile_name || record.profile_name || record.label || 'Profile'
                      const garment = meta.garment_type || record.garment_type || 'General'

                      return (
                        <div
                          key={record.id}
                          onClick={() => setSelectedMeasurementId(record.id)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between group ${
                            isSelected
                              ? 'bg-[#1e1b2e] text-white border-[#1e1b2e] shadow-md shadow-[#1e1b2e]/10'
                              : 'bg-white text-gray-700 border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="min-w-0 pr-2 space-y-1">
                            <p className="font-extrabold truncate text-sm">{pName}</p>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-pink-50 text-[#e91e8c]'
                              }`}>
                                {garment}
                              </span>
                              <span className={`text-[10px] ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                                {new Date(record.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {record.is_current && (
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                isSelected ? 'bg-[#e91e8c] text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              }`}>
                                Active
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Compare Modal */}
            <MeasurementCompareModal
              isOpen={isCompareOpen}
              onClose={() => setIsCompareOpen(false)}
              records={customer.measurements}
            />
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
