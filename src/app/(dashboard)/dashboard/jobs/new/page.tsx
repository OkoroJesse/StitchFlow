'use client'

import { useState, useEffect } from 'react'
import { getCustomers } from '@/actions/customers'
import { createJob } from '@/actions/jobs'
import { uploadImage } from '@/lib/supabase/storage'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/shared/button'
import { 
  ShoppingBag, 
  User, 
  Calendar, 
  Coins, 
  ImageIcon, 
  ArrowLeft,
  X,
  Plus
} from 'lucide-react'
import Link from 'next/link'

interface Customer {
  id: string
  full_name: string
}

export default function NewJobPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Image Previews
  const [fabricPreview, setFabricPreview] = useState<string | null>(null)
  const [stylePreview, setStylePreview] = useState<string | null>(null)
  
  const router = useRouter()

  useEffect(() => {
    async function loadCustomers() {
      const data = await getCustomers()
      setCustomers(data)
    }
    loadCustomers()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)
    
    try {
      // 1. Upload Images if present
      const fabricFile = formData.get('fabric_image_file') as File
      const styleFile = formData.get('style_image_file') as File
      
      let fabricUrl = ''
      let styleUrl = ''

      if (fabricFile && fabricFile.size > 0) {
        fabricUrl = await uploadImage(fabricFile, 'fabrics')
      }
      if (styleFile && styleFile.size > 0) {
        styleUrl = await uploadImage(styleFile, 'styles')
      }

      // 2. Create Job
      await createJob({
        customer_id: formData.get('customer_id') as string,
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        delivery_date: formData.get('delivery_date') as string,
        agreed_price: Number(formData.get('agreed_price')),
        fabric_image_url: fabricUrl,
        style_image_url: styleUrl
      })

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex items-center gap-6">
        <Link href="/dashboard">
          <button className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-all">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </Link>
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">New Fabrication</h1>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Initialize a custom designer project</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
        {error && (
          <div className="lg:col-span-3 p-5 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-500 text-sm font-bold shadow-sm">
            {error}
          </div>
        )}

        {/* 1. PROJECT DETAILS */}
        <div className="lg:col-span-2 space-y-8">
           <section className="bg-white border border-gray-200 rounded-[3rem] p-6 space-y-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 blur-[100px]" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 px-1">
                    <User className="w-3.5 h-3.5 text-pink-600" /> Linked Client
                  </label>
                  <select 
                    name="customer_id" 
                    required 
                    className="w-full bg-[#FAFAF8] border border-gray-200 rounded-2xl p-5 text-gray-900 focus:border-pink-500 focus:outline-none transition-all font-bold appearance-none cursor-pointer"
                  >
                    <option value="">Select Customer</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.full_name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 px-1">
                    <ShoppingBag className="w-3.5 h-3.5 text-pink-600" /> Project Title
                  </label>
                  <input
                    name="title"
                    required
                    placeholder="e.g. Traditional Wedding Aso-Ebi"
                    className="w-full bg-[#FAFAF8] border border-gray-200 rounded-2xl p-5 text-gray-900 focus:border-pink-500 focus:outline-none transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 px-1">
                  Description & Specifics
                </label>
                <textarea
                  name="description"
                  rows={4}
                  placeholder="Details about style, fit, and requirements..."
                  className="w-full bg-[#FAFAF8] border border-gray-200 rounded-3xl p-6 text-gray-900 focus:border-pink-500 focus:outline-none transition-all font-medium resize-none italic"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 px-1">
                    <Calendar className="w-3.5 h-3.5 text-pink-600" /> Target Delivery
                  </label>
                  <input
                    type="date"
                    name="delivery_date"
                    required
                    className="w-full bg-[#FAFAF8] border border-gray-200 rounded-2xl p-5 text-gray-900 focus:border-pink-500 focus:outline-none transition-all font-bold"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 px-1">
                    <Coins className="w-3.5 h-3.5 text-pink-600" /> Agreed Price (₦)
                  </label>
                  <input
                    type="number"
                    name="agreed_price"
                    required
                    placeholder="0.00"
                    className="w-full bg-[#FAFAF8] border border-gray-200 rounded-2xl p-5 text-gray-900 focus:border-pink-500 focus:outline-none transition-all font-black text-xl placeholder:text-slate-900"
                  />
                </div>
              </div>
           </section>
        </div>

        {/* 2. MEDIA UPLOADS (STYLING) */}
        <div className="space-y-8">
           {/* Fabric Upload */}
           <div className="bg-white border border-gray-200 rounded-[2.5rem] p-6 shadow-sm space-y-6">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-400" /> Fabric Photo
              </h3>
              
              <div className="relative aspect-square bg-[#FAFAF8] rounded-3xl border border-gray-200 overflow-hidden group">
                {fabricPreview ? (
                  <>
                    <img src={fabricPreview} className="w-full h-full object-cover opacity-80" />
                    <button 
                      type="button"
                      onClick={() => setFabricPreview(null)}
                      className="absolute top-4 right-4 p-2 bg-white/80 rounded-full text-gray-900 hover:bg-red-500 transition-all shadow-xl"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-white transition-all">
                    <Plus className="w-8 h-8 text-slate-700 mb-2" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Select Fabric</span>
                    <input 
                      type="file" 
                      name="fabric_image_file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) setFabricPreview(URL.createObjectURL(file))
                      }}
                    />
                  </label>
                )}
              </div>
           </div>

           {/* Style Reference */}
           <div className="bg-white border border-gray-200 rounded-[2.5rem] p-6 shadow-sm space-y-6">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-4 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-pink-400" /> Style Reference
              </h3>
              
              <div className="relative aspect-square bg-[#FAFAF8] rounded-3xl border border-gray-200 overflow-hidden group">
                {stylePreview ? (
                  <>
                    <img src={stylePreview} className="w-full h-full object-cover opacity-80" />
                    <button 
                      type="button"
                      onClick={() => setStylePreview(null)}
                      className="absolute top-4 right-4 p-2 bg-white/80 rounded-full text-gray-900 hover:bg-red-500 transition-all shadow-xl"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-white transition-all">
                    <Plus className="w-8 h-8 text-slate-700 mb-2" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Select Style</span>
                    <input 
                      type="file" 
                      name="style_image_file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) setStylePreview(URL.createObjectURL(file))
                      }}
                    />
                  </label>
                )}
              </div>
           </div>

           <Button 
             type="submit" 
             loading={loading} 
             className="w-full py-10 text-xl font-black uppercase tracking-tighter italic"
           >
             Launch Project
           </Button>
        </div>
      </form>
    </div>
  )
}
