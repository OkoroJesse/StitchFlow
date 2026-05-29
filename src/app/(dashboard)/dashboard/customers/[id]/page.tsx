import { getCustomerById } from '@/actions/customers'
import { getMeasurements } from '@/actions/measurements'
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
  Star as StarIcon
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

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
  review_token?: string
  invoices?: Invoice[]
}

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customerId = params.id
  const customer = await getCustomerById(customerId)

  if (!customer) {
    notFound()
  }

  const measurements = await getMeasurements(customerId)
  const activeJobs = (customer.jobs as Job[]).filter((j) => j.status !== 'delivered')
  const completedJobs = (customer.jobs as Job[]).filter((j) => j.status === 'delivered')

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* 1. HEADER SECTION */}
      <div className="bg-white border border-gray-200 rounded-[2.5rem] p-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-50 blur-[120px] -z-10" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-28 h-28 bg-[#1e1b2e] rounded-[2rem] flex items-center justify-center text-gray-900 text-5xl font-black shadow-sm shadow-indigo-600/20">
              {customer.full_name.charAt(0)}
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">{customer.full_name}</h1>
              <div className="flex flex-wrap items-center gap-6 text-gray-500">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Phone className="w-4 h-4 text-pink-600" />
                  <span>{customer.phone_number}</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-sm">
                  <MapPin className="w-4 h-4 text-pink-600" />
                  <span>{customer.address}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-center px-8 py-5 bg-gray-50/50 rounded-[1.5rem] border border-gray-200/50 shadow-inner">
              <p className="text-3xl font-black text-gray-900 leading-none tracking-tighter">{customer.jobs.length}</p>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">Projects</p>
            </div>
            <div className="text-center px-8 py-5 bg-pink-50 rounded-[1.5rem] border border-pink-200 shadow-inner">
              <p className="text-3xl font-black text-pink-600 leading-none tracking-tighter">{activeJobs.length}</p>
              <p className="text-[10px] font-black text-pink-600/60 uppercase tracking-widest mt-2">Active</p>
            </div>
          </div>
        </div>

        {customer.notes && (
          <div className="mt-10 p-5 bg-[#FAFAF8]/50 rounded-[1.5rem] border border-gray-200 flex gap-4">
            <FileText className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-gray-500 leading-relaxed italic">&ldquo;{customer.notes}&rdquo;</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. LEFT COLUMN - FABRICATION STREAM */}
        <div className="lg:col-span-2 space-y-10">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
              <ShoppingBag className="w-7 h-7 text-pink-600" />
              Fabrication Stream
            </h2>
            <Link 
              href={`/dashboard/jobs/new?customer=${customerId}`} 
              className="px-6 py-2.5 bg-pink-50 text-pink-600 border border-pink-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-pink-50 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Project
            </Link>
          </div>

          {activeJobs.length === 0 ? (
            <div className="bg-white border border-gray-200 border-dashed rounded-[3rem] p-24 text-center space-y-4">
              <div className="w-16 h-16 bg-[#FAFAF8] rounded-full flex items-center justify-center mx-auto border border-gray-200">
                <ShoppingBag className="w-8 h-8 text-slate-800" />
              </div>
              <p className="text-gray-500 text-xs font-black uppercase tracking-widest">No active sewing projects found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {activeJobs.map((job) => (
                <div key={job.id} className="bg-white border border-gray-200 rounded-[2.5rem] p-6 hover:border-gray-300 transition-all group relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 blur-[100px] -z-10" />
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-40 h-40 bg-[#FAFAF8] rounded-3xl flex-shrink-0 overflow-hidden relative border border-gray-200 shadow-inner">
                       {job.fabric_image_url ? (
                         <img src={job.fabric_image_url} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="Fabric" />
                       ) : (
                         <div className="absolute inset-0 flex items-center justify-center text-slate-800">
                            <ShoppingBag className="w-12 h-12" />
                         </div>
                       )}
                    </div>

                    <div className="flex-1 space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter leading-none">{job.title}</h3>
                          <div className="flex items-center gap-4 mt-3">
                             <span className="text-lg font-black text-pink-600">₦{job.agreed_price.toLocaleString()}</span>
                             <span className="text-slate-700 font-black">•</span>
                             <span className="text-xs font-bold text-gray-500 flex items-center gap-1 uppercase tracking-widest">
                               <Clock className="w-3.5 h-3.5" />
                               Deadline: {new Date(job.delivery_date).toLocaleDateString()}
                             </span>
                          </div>
                        </div>
                        <div className="px-4 py-1.5 bg-[#FAFAF8] text-pink-600 text-[10px] font-black rounded-full border border-gray-200 uppercase tracking-widest">
                          {job.status}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
                          <span>Workflow Timeline</span>
                          <span>{job.status === 'sewing' ? '60%' : job.status === 'ready' ? '90%' : '20%'}</span>
                        </div>
                        <div className="h-2 w-full bg-[#FAFAF8] rounded-full overflow-hidden border border-gray-200 p-0.5">
                          <div 
                            className="h-full bg-[#1e1b2e] rounded-full transition-all duration-1000 shadow-lg shadow-indigo-600/20" 
                            style={{ width: job.status === 'sewing' ? '60%' : job.status === 'ready' ? '90%' : '20%' }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 pt-2">
                         <button 
                            onClick={async () => {
                              const url = `${window.location.origin}/review/${job.review_token}`
                              await navigator.clipboard.writeText(url)
                              alert('Review link copied to clipboard!')
                            }}
                            className="px-6 py-3 bg-[#1e1b2e]/10 text-pink-600 border border-pink-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1e1b2e]/20 transition-all"
                         >
                           Copy Review Link
                         </button>
                         {job.invoices && job.invoices.length > 0 ? (
                           <Link href={`/dashboard/invoices/${job.invoices[0].id}`}>
                             <button className="px-6 py-3 bg-[#FAFAF8] text-gray-500 border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2 shadow-inner">
                               <CreditCard className="w-3.5 h-3.5" />
                               View Receipt
                             </button>
                           </Link>
                         ) : (
                           <button className="px-6 py-3 bg-[#FAFAF8] text-slate-600 border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest italic opacity-50 cursor-not-allowed">
                             No Invoice Issued
                           </button>
                         )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. RIGHT COLUMN - MEASUREMENTS & FINANCE */}
        <div className="space-y-10">
          {/* Measurements Card */}
          <div className="bg-white border border-gray-200 rounded-[2.5rem] p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 blur-[40px] -z-10" />
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-3 uppercase">
                <Ruler className="w-6 h-6 text-emerald-400" />
                Dimensions
              </h3>
              <button className="text-[10px] font-black text-pink-600 uppercase tracking-widest border-b border-pink-200 pb-0.5 hover:text-pink-500">Update</button>
            </div>

            {measurements.length === 0 ? (
              <div className="py-12 text-center bg-[#FAFAF8]/30 rounded-3xl border border-dashed border-gray-200">
                 <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No dimensions logged</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-6 bg-[#FAFAF8]/50 rounded-[1.5rem] border border-gray-200 shadow-inner">
                   <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{measurements[0].label}</span>
                      <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 uppercase">Latest</span>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                     {Object.entries(measurements[0].measurements as Record<string, string | number | boolean | null>).slice(0, 4).map(([key, val]) => (
                       <div key={key}>
                         <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{key}</p>
                         <p className="text-xl font-black text-gray-900 italic">{val}&quot;</p>
                       </div>
                     ))}
                   </div>
                   <button className="w-full mt-6 py-3.5 text-[10px] font-black text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
                     Explore History
                     <ArrowUpRight className="w-3.5 h-3.5" />
                   </button>
                </div>
              </div>
            )}
          </div>

          {/* Finance Section */}
          <div className="bg-white border border-gray-200 rounded-[2.5rem] p-6 shadow-sm">
             <h3 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-3 uppercase mb-8">
                <CreditCard className="w-6 h-6 text-pink-600" />
                Ledger
             </h3>
             <div className="space-y-4">
               {(customer.jobs as Job[]).flatMap((j) => j.invoices || []).length > 0 ? (
                 ((customer.jobs as Job[]).flatMap((j) => j.invoices || []) as Invoice[]).map((inv) => (
                   <Link key={inv.id} href={`/dashboard/invoices/${inv.id}`} className="block group">
                      <div className="flex justify-between items-center p-4 bg-[#FAFAF8]/50 border border-gray-200 rounded-2xl group-hover:border-slate-600 transition-all shadow-inner">
                        <div>
                          <p className="text-[10px] font-black text-gray-900 uppercase tracking-tighter">#INV-{inv.id.slice(0,4)}</p>
                          <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">{inv.status}</p>
                        </div>
                        <span className="text-lg font-black text-gray-900 italic">₦{inv.total_amount.toLocaleString()}</span>
                      </div>
                   </Link>
                 ))
               ) : (
                 <div className="py-10 text-center bg-[#FAFAF8]/30 rounded-3xl border border-dashed border-gray-200">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No billing history</p>
                 </div>
               )}
               <button className="w-full py-4 text-[10px] font-black text-pink-600 bg-indigo-500/5 hover:bg-pink-50 border border-pink-200 rounded-2xl transition-all uppercase tracking-widest">
                 Open Full Ledger
               </button>
             </div>
          </div>

          {/* Feedback Stats */}
          <div className="bg-white border border-gray-200 rounded-[2.5rem] p-6 shadow-sm">
             <h3 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-3 uppercase mb-8">
                <MessageSquare className="w-6 h-6 text-pink-400" />
                Trust
             </h3>
             <div className="flex items-center gap-4">
               <div className="flex text-pink-400 gap-1">
                 {[1,2,3,4,5].map(i => <StarIcon key={i} className="w-5 h-5 fill-current" />)}
               </div>
               <span className="text-2xl font-black text-gray-900">5.0</span>
               <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">(Verified)</span>
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}
