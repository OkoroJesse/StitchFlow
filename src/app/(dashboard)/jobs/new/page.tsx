'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createJob } from '@/actions/jobs'
import { getCustomers } from '@/actions/customers'
import { uploadImage } from '@/lib/supabase/storage'
import { 
  ArrowLeft, 
  Loader2, 
  ShoppingBag, 
  User, 
  DollarSign, 
  Calendar, 
  FileText, 
  Image as ImageIcon,
  CheckCircle2,
  X
} from 'lucide-react'
import Link from 'next/link'

interface Customer {
  id: string
  full_name: string
}

function NewJobForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preSelectedCustomerId = searchParams.get('customer')

  const [loading, setLoading] = useState(false)
  const [fetchingCustomers, setFetchingCustomers] = useState(true)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [error, setError] = useState<string | null>(null)

  // Image states
  const [fabricImage, setFabricImage] = useState<File | null>(null)
  const [styleImage, setStyleImage] = useState<File | null>(null)
  const [fabricPreview, setFabricPreview] = useState<string | null>(null)
  const [stylePreview, setStylePreview] = useState<string | null>(null)

  useEffect(() => {
    async function loadCustomers() {
      try {
        const data = await getCustomers()
        setCustomers(data)
      } catch (err) {
        console.error('Failed to load customers')
      } finally {
        setFetchingCustomers(false)
      }
    }
    loadCustomers()
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'fabric' | 'style') => {
    const file = e.target.files?.[0]
    if (file) {
      if (type === 'fabric') {
        setFabricImage(file)
        setFabricPreview(URL.createObjectURL(file))
      } else {
        setStyleImage(file)
        setStylePreview(URL.createObjectURL(file))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const customer_id = formData.get('customer_id') as string
    
    try {
      let fabric_url = ''
      let style_url = ''

      // 1. Upload Images if present
      if (fabricImage) {
        const path = `fabrics/${Date.now()}_${fabricImage.name}`
        fabric_url = await uploadImage(fabricImage, path)
      }
      if (styleImage) {
        const path = `styles/${Date.now()}_${styleImage.name}`
        style_url = await uploadImage(styleImage, path)
      }

      // 2. Create Job
      await createJob({
        customer_id,
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        agreed_price: Number(formData.get('agreed_price')),
        delivery_date: formData.get('delivery_date') as string,
        fabric_image_url: fabric_url,
        style_image_url: style_url,
      })

      router.push(`/dashboard/customers/${customer_id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700 pb-20 px-4 sm:px-0">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 sm:p-3 bg-white border border-gray-200 rounded-2xl text-gray-500 hover:text-gray-900 transition-all shadow-xl"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight">New Project</h1>
          <p className="text-sm sm:text-base text-gray-500">Initialize a new fabrication workflow.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Details (Left/Center) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-6 space-y-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 blur-[100px] -z-10" />
            
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm">
                {error}
              </div>
            )}

            {/* Customer Selection */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <User className="w-4 h-4 text-pink-600" />
                Select Client
              </label>
              <select
                name="customer_id"
                required
                defaultValue={preSelectedCustomerId || ''}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>Choose a customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.full_name}</option>
                ))}
              </select>
            </div>

            {/* Project Title */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-pink-600" />
                Project Title
              </label>
              <input
                name="title"
                required
                placeholder="e.g. Traditional Wedding Agbada"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-4 h-4 text-pink-600" />
                Description & Style Notes
              </label>
              <textarea
                name="description"
                rows={4}
                placeholder="Include details on embroidery style, sleeve length, etc..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all resize-none"
              />
            </div>

            {/* Price & Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-pink-600" />
                  Agreed Price (₦)
                </label>
                <input
                  name="agreed_price"
                  type="number"
                  required
                  placeholder="0.00"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-pink-600" />
                  Delivery Date
                </label>
                <input
                  name="delivery_date"
                  type="date"
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Visual References (Right Sidebar) */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-pink-600" />
              Fabric & Style
            </h3>
            
            {/* Fabric Upload */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Fabric Photo</p>
              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  onChange={(e) => handleImageChange(e, 'fabric')}
                />
                <div className={`h-32 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 overflow-hidden ${fabricPreview ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-gray-200 bg-gray-50/30 group-hover:border-gray-300'}`}>
                   {fabricPreview ? (
                     <img src={fabricPreview} className="w-full h-full object-cover" />
                   ) : (
                     <>
                      <ImageIcon className="w-6 h-6 text-slate-600" />
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Click to upload</span>
                     </>
                   )}
                </div>
              </div>
            </div>

            {/* Style Upload */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Style Inspiration</p>
              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  onChange={(e) => handleImageChange(e, 'style')}
                />
                <div className={`h-32 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 overflow-hidden ${stylePreview ? 'border-pink-500/50 bg-pink-500/5' : 'border-gray-200 bg-gray-50/30 group-hover:border-gray-300'}`}>
                   {stylePreview ? (
                     <img src={stylePreview} className="w-full h-full object-cover" />
                   ) : (
                     <>
                      <ImageIcon className="w-6 h-6 text-slate-600" />
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Click to upload</span>
                     </>
                   )}
                </div>
              </div>
            </div>

            <div className="pt-4">
               <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#1e1b2e] hover:bg-indigo-500 text-gray-900 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Create Project
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="px-4 text-[11px] text-gray-500 leading-relaxed text-center">
            By creating this project, you are initializing the sewing workflow. The client will be notified once you generate an invoice.
          </p>
        </div>
      </form>
    </div>
  )
}

export default function NewJobPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] text-gray-500 font-bold uppercase tracking-widest text-xs">
        Loading project creator...
      </div>
    }>
      <NewJobForm />
    </Suspense>
  )
}
