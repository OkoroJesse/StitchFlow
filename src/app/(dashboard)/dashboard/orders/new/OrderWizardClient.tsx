'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  User, 
  Ruler, 
  ShoppingBag, 
  Plus, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Search, 
  Phone, 
  MapPin, 
  FileText, 
  Coins, 
  Calendar, 
  ImageIcon, 
  X,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/shared/button'
import { MEASUREMENT_FIELDS, MeasurementValues } from '@/lib/constants'
import { addCustomer } from '@/actions/customers'
import { saveMeasurements } from '@/actions/measurements'
import { createJob } from '@/actions/jobs'
import { uploadImage } from '@/lib/supabase/storage'

interface Customer {
  id: string
  full_name: string
  phone_number: string
  address: string
  notes: string | null
  measurements?: Array<{
    id: string
    label: string
    is_current: boolean
    measurements: any
  }>
}

interface Props {
  initialCustomers: Customer[]
}

export default function OrderWizardClient({ initialCustomers }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  // Step state: 1, 2, 3
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  
  // Customers state
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false)
  
  // Measurements state
  const [measurementMode, setMeasurementMode] = useState<'use-existing' | 'take-new'>('use-existing')
  const [selectedMeasurementId, setSelectedMeasurementId] = useState<string | null>(null)
  
  // Image states
  const [fabricFile, setFabricFile] = useState<File | null>(null)
  const [fabricPreview, setFabricPreview] = useState<string | null>(null)
  const [styleFile, setStyleFile] = useState<File | null>(null)
  const [stylePreview, setStylePreview] = useState<string | null>(null)

  // URL Query Param Check
  useEffect(() => {
    const customerIdParam = searchParams.get('customer')
    if (customerIdParam) {
      const match = customers.find(c => c.id === customerIdParam)
      if (match) {
        setSelectedCustomer(match)
        // Set selected measurement if they have an active one
        const activeMeas = match.measurements?.find(m => m.is_current) || match.measurements?.[0]
        if (activeMeas) {
          setSelectedMeasurementId(activeMeas.id)
          setMeasurementMode('use-existing')
        } else {
          setMeasurementMode('take-new')
        }
        setStep(2)
      }
    }
  }, [searchParams, customers])

  // Filter customers for selection list
  const filteredCustomers = customers.filter(c => 
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone_number.includes(searchQuery)
  )

  // Step 1: Select Customer
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    const activeMeas = customer.measurements?.find(m => m.is_current) || customer.measurements?.[0]
    if (activeMeas) {
      setSelectedMeasurementId(activeMeas.id)
      setMeasurementMode('use-existing')
    } else {
      setMeasurementMode('take-new')
    }
    setError(null)
    setStep(2)
  }

  // Step 1 Alternative: Onboard Client Inline
  const handleCreateCustomerInline = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      try {
        const newCust = await addCustomer(formData)
        // Add to customer list state
        const updatedCustomers = [...customers, { ...newCust, measurements: [] }]
        setCustomers(updatedCustomers)
        setSelectedCustomer(newCust)
        setMeasurementMode('take-new')
        setShowAddCustomerForm(false)
        setStep(2)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to register client')
      }
    })
  }

  // Step 2: Select/Log Measurements
  const handleSaveMeasurementsStep = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedCustomer) return
    setError(null)

    if (measurementMode === 'use-existing' && selectedMeasurementId) {
      setStep(3)
      return
    }

    // Capture measurements form values
    const formData = new FormData(e.currentTarget)
    const measurementsObj: Record<string, number> = {}
    MEASUREMENT_FIELDS.forEach(field => {
      const val = formData.get(field.key)
      if (val) {
        measurementsObj[field.key] = parseFloat(val as string)
      }
    })

    const label = (formData.get('label') as string) || 'Standard Spec'

    startTransition(async () => {
      try {
        const saved = await saveMeasurements(selectedCustomer.id, measurementsObj, label)
        setSelectedMeasurementId(saved.id)
        
        // Update customer local measurements cache
        const updatedCusts = customers.map(c => {
          if (c.id === selectedCustomer.id) {
            return {
              ...c,
              measurements: [...(c.measurements || []), saved]
            }
          }
          return c
        })
        setCustomers(updatedCusts)
        
        setStep(3)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save measurements')
      }
    })
  }

  // Step 3: Complete Order Creation
  const handleCreateOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedCustomer) return
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      try {
        let fabricUrl = ''
        let styleUrl = ''

        // Upload images if exists
        if (fabricFile) {
          const path = `fabrics/${Date.now()}_${fabricFile.name}`
          fabricUrl = await uploadImage(fabricFile, path)
        }
        if (styleFile) {
          const path = `styles/${Date.now()}_${styleFile.name}`
          styleUrl = await uploadImage(styleFile, path)
        }

        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const delivery_date = formData.get('delivery_date') as string
        const agreed_price = Number(formData.get('agreed_price'))

        await createJob({
          customer_id: selectedCustomer.id,
          measurement_id: selectedMeasurementId,
          title,
          description,
          delivery_date,
          agreed_price,
          fabric_image_url: fabricUrl || undefined,
          style_image_url: styleUrl || undefined
        })

        router.push(`/dashboard/customers/${selectedCustomer.id}`)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create order')
      }
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* HEADER SECTION WITH STEP TRACKER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/orders">
            <button className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#1e1b2e] hover:border-gray-300 transition-all shadow-sm">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-[#1e1b2e] tracking-tight uppercase">New Order Wizard</h1>
            <p className="text-gray-500 text-sm font-semibold mt-1">Unified client registration, measurements, and project stream</p>
          </div>
        </div>

        {/* Wizard Steps indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                step === num 
                  ? 'bg-[#e91e8c] text-white shadow-md shadow-[#e91e8c]/20'
                  : step > num
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white border-2 border-gray-100 text-gray-400'
              }`}>
                {step > num ? <Check className="w-4 h-4" /> : num}
              </div>
              {num < 3 && (
                <div className={`w-8 h-0.5 mx-1.5 transition-colors ${
                  step > num ? 'bg-emerald-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ERROR ALERT DISPLAY */}
      {error && (
        <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-[1.5rem] text-red-500 text-base font-bold shadow-xs">
          {error}
        </div>
      )}

      {/* ── STEP 1: SELECT OR CREATE CUSTOMER ── */}
      {step === 1 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-extrabold text-[#1e1b2e] tracking-tight flex items-center gap-2">
              <User className="w-6 h-6 text-[#e91e8c]" />
              Step 1: Select Client
            </h2>
            <Button
              onClick={() => setShowAddCustomerForm(!showAddCustomerForm)}
              icon={<Plus className="w-4 h-4" />}
              className="text-sm h-10 px-5"
            >
              {showAddCustomerForm ? 'Select Existing' : 'Onboard New Client'}
            </Button>
          </div>

          {showAddCustomerForm ? (
            <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#e91e8c]/5 blur-[120px] rounded-full -z-10" />
              <h3 className="text-xl font-extrabold text-[#1e1b2e] mb-6">Register Client Details</h3>
              
              <form onSubmit={handleCreateCustomerInline} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gray-400" /> Full Name
                    </label>
                    <input
                      name="full_name"
                      required
                      placeholder="e.g. Phavour Okoro"
                      className="w-full bg-[#FAFAF8] border border-gray-200 rounded-xl p-4 text-gray-900 focus:border-[#e91e8c] focus:outline-none transition-all font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400" /> Phone Number
                    </label>
                    <input
                      name="phone_number"
                      required
                      placeholder="+234..."
                      className="w-full bg-[#FAFAF8] border border-gray-200 rounded-xl p-4 text-gray-900 focus:border-[#e91e8c] focus:outline-none transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="client@gmail.com"
                      className="w-full bg-[#FAFAF8] border border-gray-200 rounded-xl p-4 text-gray-900 focus:border-[#e91e8c] focus:outline-none transition-all font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" /> Studio/Home Address
                    </label>
                    <input
                      name="address"
                      required
                      placeholder="12 Fashion Lane, Lagos"
                      className="w-full bg-[#FAFAF8] border border-gray-200 rounded-xl p-4 text-gray-900 focus:border-[#e91e8c] focus:outline-none transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-gray-400" /> Designer Notes (Internal)
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="Prefers high-waisted cuts, sensitive skin..."
                    className="w-full bg-[#FAFAF8] border border-gray-200 rounded-2xl p-4 text-gray-900 focus:border-[#e91e8c] focus:outline-none transition-all font-medium resize-none italic"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <Button type="button" variant="ghost" onClick={() => setShowAddCustomerForm(false)}>Cancel</Button>
                  <Button type="submit" loading={isPending}>Continue to Measurements</Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Search client input */}
              <div className="relative group shadow-sm rounded-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-[#e91e8c] transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search existing client by name or phone..."
                  className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-gray-900 focus:outline-none focus:ring-4 focus:ring-[#e91e8c]/10 focus:border-[#e91e8c] transition-all font-semibold"
                />
              </div>

              {/* Client selection grid */}
              {filteredCustomers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCustomers.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleSelectCustomer(c)}
                      className="bg-white border-2 border-gray-100 p-6 rounded-3xl hover:border-[#e91e8c]/25 transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 bg-[#1e1b2e] rounded-xl flex items-center justify-center text-pink-500 font-bold shrink-0">
                          {c.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-[#1e1b2e] group-hover:text-[#e91e8c] transition-colors truncate text-base uppercase">
                            {c.full_name}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1 font-semibold flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {c.phone_number}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[#e91e8c] group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center bg-white border-2 border-gray-100 border-dashed rounded-[2.5rem] space-y-4">
                  <p className="text-gray-500 font-bold">No clients found matching query</p>
                  <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddCustomerForm(true)}>
                    Register New Client
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── STEP 2: MEASUREMENTS ── */}
      {step === 2 && selectedCustomer && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <Ruler className="w-6 h-6 text-[#e91e8c]" />
            <h2 className="text-2xl font-extrabold text-[#1e1b2e] tracking-tight">
              Step 2: Measurements spec for {selectedCustomer.full_name}
            </h2>
          </div>

          <form onSubmit={handleSaveMeasurementsStep} className="space-y-8">
            {/* Toggle selection mode */}
            {selectedCustomer.measurements && selectedCustomer.measurements.length > 0 && (
              <div className="flex gap-4 p-1 bg-gray-100 rounded-xl w-fit">
                <button
                  type="button"
                  onClick={() => setMeasurementMode('use-existing')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    measurementMode === 'use-existing' 
                      ? 'bg-white text-[#1e1b2e] shadow-xs' 
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Use Existing Logs
                </button>
                <button
                  type="button"
                  onClick={() => setMeasurementMode('take-new')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    measurementMode === 'take-new' 
                      ? 'bg-white text-[#1e1b2e] shadow-xs' 
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Log New Measurements
                </button>
              </div>
            )}

            {measurementMode === 'use-existing' && selectedCustomer.measurements && selectedCustomer.measurements.length > 0 ? (
              /* Display list of existing measurements for selection */
              <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-6 shadow-md max-w-2xl">
                <h3 className="font-extrabold text-[#1e1b2e] text-lg mb-4">Select Reference Log</h3>
                <div className="space-y-3">
                  {selectedCustomer.measurements.map((record) => (
                    <label
                      key={record.id}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedMeasurementId === record.id
                          ? 'border-[#e91e8c] bg-[#e91e8c]/5'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="selected_measurement"
                          checked={selectedMeasurementId === record.id}
                          onChange={() => setSelectedMeasurementId(record.id)}
                          className="text-[#e91e8c] focus:ring-[#e91e8c] h-4 w-4"
                        />
                        <div>
                          <p className="font-extrabold text-gray-900">{record.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Active dimensions: {Object.keys(record.measurements || {}).length} logged
                          </p>
                        </div>
                      </div>
                      {record.is_current && (
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                          Current
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              /* Inline form to take new measurements */
              <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 shadow-md space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Record Label / Title</label>
                  <input
                    name="label"
                    required
                    defaultValue={`Standard Fit (${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})`}
                    className="w-full bg-[#FAFAF8] border border-gray-200 rounded-xl p-4 text-gray-900 focus:border-[#e91e8c] focus:outline-none transition-all font-semibold"
                    placeholder="e.g. Standard, Wedding Outfit"
                  />
                </div>

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
                          className="w-full bg-transparent border-0 border-b border-gray-200 focus:border-[#e91e8c] focus:outline-none focus:ring-0 p-1 text-lg font-bold text-gray-900 pr-5"
                        />
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">in</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-6 border-t border-gray-100">
              <Button type="button" variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button type="submit" loading={isPending} disabled={measurementMode === 'use-existing' && !selectedMeasurementId}>
                Continue to Order Details
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ── STEP 3: ORDER DETAILS ── */}
      {step === 3 && selectedCustomer && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-[#e91e8c]" />
            <h2 className="text-2xl font-extrabold text-[#1e1b2e] tracking-tight">
              Step 3: Enter Order Details
            </h2>
          </div>

          <form onSubmit={handleCreateOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left side details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 shadow-md space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#e91e8c]/5 blur-[100px] rounded-full -z-10" />
                
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                    Order Title / Project Name
                  </label>
                  <input
                    name="title"
                    required
                    placeholder="e.g. Kaftan and Trouser Set"
                    className="w-full bg-[#FAFAF8] border border-gray-200 rounded-xl p-4 text-gray-900 focus:border-[#e91e8c] focus:outline-none transition-all font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">
                    Fabric Description & Sewing Notes
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    placeholder="Details about styles, pockets, collar, fabric colors..."
                    className="w-full bg-[#FAFAF8] border border-gray-200 rounded-2xl p-4 text-gray-900 focus:border-[#e91e8c] focus:outline-none transition-all font-medium resize-none italic"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-400" /> Target Delivery Date
                    </label>
                    <input
                      type="date"
                      name="delivery_date"
                      required
                      className="w-full bg-[#FAFAF8] border border-gray-200 rounded-xl p-4 text-gray-900 focus:border-[#e91e8c] focus:outline-none transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-gray-400" /> Agreed Price (₦)
                    </label>
                    <input
                      type="number"
                      name="agreed_price"
                      required
                      placeholder="e.g. 45000"
                      className="w-full bg-[#FAFAF8] border border-gray-200 rounded-xl p-4 text-[#e91e8c] focus:border-[#e91e8c] focus:outline-none transition-all font-extrabold text-xl"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right side photo uploads */}
            <div className="space-y-6">
              {/* Fabric upload */}
              <div className="bg-white border-2 border-gray-100 rounded-[2rem] p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold text-[#1e1b2e] uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-500" /> Fabric Photo
                </h3>
                
                <div className="relative aspect-square bg-[#FAFAF8] rounded-2xl border border-gray-200 overflow-hidden group">
                  {fabricPreview ? (
                    <>
                      <img src={fabricPreview} className="w-full h-full object-cover" alt="Fabric Preview" />
                      <button 
                        type="button"
                        onClick={() => {
                          setFabricPreview(null)
                          setFabricFile(null)
                        }}
                        className="absolute top-3 right-3 p-1.5 bg-white/95 hover:bg-red-50 text-gray-900 rounded-full transition-all shadow-md"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all">
                      <Plus className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-xs font-bold text-gray-500">Upload Fabric</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setFabricFile(file)
                            setFabricPreview(URL.createObjectURL(file))
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Style upload */}
              <div className="bg-white border-2 border-gray-100 rounded-[2rem] p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold text-[#1e1b2e] uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#e91e8c]" /> Style Reference
                </h3>
                
                <div className="relative aspect-square bg-[#FAFAF8] rounded-2xl border border-gray-200 overflow-hidden group">
                  {stylePreview ? (
                    <>
                      <img src={stylePreview} className="w-full h-full object-cover" alt="Style Preview" />
                      <button 
                        type="button"
                        onClick={() => {
                          setStylePreview(null)
                          setStyleFile(null)
                        }}
                        className="absolute top-3 right-3 p-1.5 bg-white/95 hover:bg-red-50 text-gray-900 rounded-full transition-all shadow-md"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all">
                      <Plus className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-xs font-bold text-gray-500">Upload Style</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setStyleFile(file)
                            setStylePreview(URL.createObjectURL(file))
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setStep(2)} className="flex-1">Back</Button>
                <Button type="submit" loading={isPending} className="flex-2 w-full text-base py-3.5">
                  Launch Order
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
