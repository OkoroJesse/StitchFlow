'use client'

import { useState } from 'react'
import { addCustomer } from '@/actions/customers'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/shared/button'
import { User, Phone, MapPin, FileText, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewCustomerPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    try {
      await addCustomer(formData)
      router.push('/dashboard/customers')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-6">
        <Link href="/dashboard/customers">
          <button className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-all">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </Link>
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Register Client</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">Onboard a new designer workspace</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-[3rem] p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-50 blur-[120px]" />
        
        <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Full Name
              </label>
              <input
                name="full_name"
                required
                className="w-full bg-[#FAFAF8] border border-gray-200 rounded-2xl p-5 text-gray-900 focus:border-pink-500 focus:outline-none transition-all font-bold placeholder:text-slate-800"
                placeholder="Phavour Okoro"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" /> Phone Number
              </label>
              <input
                name="phone_number"
                required
                className="w-full bg-[#FAFAF8] border border-gray-200 rounded-2xl p-5 text-gray-900 focus:border-pink-500 focus:outline-none transition-all font-bold placeholder:text-slate-800 text-lg"
                placeholder="+234 ..."
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" /> Studio/Home Address
            </label>
            <input
              name="address"
              required
              className="w-full bg-[#FAFAF8] border border-gray-200 rounded-2xl p-5 text-gray-900 focus:border-pink-500 focus:outline-none transition-all font-bold placeholder:text-slate-800"
              placeholder="12 Fashion Lane, Lagos"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" /> Designer Notes (Internal)
            </label>
            <textarea
              name="notes"
              rows={4}
              className="w-full bg-[#FAFAF8] border border-gray-200 rounded-3xl p-6 text-gray-900 focus:border-pink-500 focus:outline-none transition-all font-medium placeholder:text-slate-800 resize-none italic"
              placeholder="Prefers high-waisted cuts, sensitive skin..."
            />
          </div>

          <div className="pt-6">
            <Button
              type="submit"
              loading={loading}
              className="w-full py-8 text-xl tracking-tighter"
            >
              Complete Registration
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
