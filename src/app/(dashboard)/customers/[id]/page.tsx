import { getCustomerById } from '@/actions/customers'
import { getJobs } from '@/actions/jobs'
import { getMeasurements } from '@/actions/measurements'
import { getSignedUrl } from '@/lib/supabase/storage'
import { 
  Phone, 
  MapPin, 
  Mail, 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Calendar,
  Ruler,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  ArrowUpRight
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
      <div className="bg-white border border-gray-200 rounded-3xl p-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-50 blur-[120px] -z-10" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-[#1e1b2e] rounded-3xl flex items-center justify-center text-gray-900 text-4xl font-black shadow-xl shadow-indigo-600/20">
              {customer.full_name.charAt(0)}
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{customer.full_name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-500">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-pink-600" />
                  <span>{customer.phone_number}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-pink-600" />
                  <span>{customer.address}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-center px-6 py-3 bg-gray-50/50 rounded-2xl border border-gray-200/50">
              <p className="text-2xl font-bold text-gray-900 leading-none">{customer.jobs.length}</p>
              <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Total Jobs</p>
            </div>
            <div className="text-center px-6 py-3 bg-pink-50 rounded-2xl border border-pink-200">
              <p className="text-2xl font-bold text-pink-600 leading-none">{activeJobs.length}</p>
              <p className="text-xs text-pink-600/60 uppercase tracking-widest mt-1">Active</p>
            </div>
          </div>
        </div>

        {customer.notes && (
          <div className="mt-8 p-4 bg-gray-50/30 rounded-2xl border border-gray-200 flex gap-3">
            <FileText className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600 italic">&ldquo;{customer.notes}&rdquo;</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. LEFT COLUMN - JOBS & WORKFLOW */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <ShoppingBag className="w-6 h-6 text-pink-600" />
              Active Fabrication
            </h2>
            <Link 
              href={`/dashboard/jobs/new?customer=${customerId}`} 
              className="text-sm font-semibold text-pink-600 hover:text-pink-500 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Project
            </Link>
          </div>

          {activeJobs.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6 text-gray-500" />
              </div>
              <p className="text-gray-500 font-medium">No active sewing projects for this client.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {activeJobs.map((job) => (
                <div key={job.id} className="bg-white border border-gray-200 rounded-3xl p-6 hover:border-gray-300 transition-all group overflow-hidden relative">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Fabric/Style Preview */}
                    <div className="w-full md:w-32 h-32 bg-gray-50 rounded-2xl flex-shrink-0 overflow-hidden relative">
                       {job.fabric_image_url ? (
                         <div className="absolute inset-0 bg-[#1e1b2e]/10 flex items-center justify-center text-[10px] text-gray-500">
                           Image Loaded
                         </div>
                       ) : (
                         <div className="absolute inset-0 flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-slate-700" />
                         </div>
                       )}
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">{job.title}</h3>
                          <div className="flex items-center gap-3 mt-1">
                             <span className="text-sm font-bold text-pink-600">₦{job.agreed_price.toLocaleString()}</span>
                             <span className="text-slate-600">•</span>
                             <span className="text-sm text-gray-500 flex items-center gap-1">
                               <Clock className="w-3.5 h-3.5" />
                               Delivery: {new Date(job.delivery_date).toLocaleDateString()}
                             </span>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-pink-50 text-pink-600 text-xs font-bold rounded-full border border-pink-200 uppercase">
                          {job.status}
                        </div>
                      </div>

                      {/* Progress Bar & Actions */}
                      <div className="flex flex-col sm:flex-row items-end gap-6 pt-2">
                        <div className="flex-1 w-full space-y-2">
                          <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            <span>Workflow Progress</span>
                            <span>{job.status === 'sewing' ? '60%' : job.status === 'ready' ? '90%' : '20%'}</span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#1e1b2e] rounded-full transition-all duration-1000" 
                              style={{ width: job.status === 'sewing' ? '60%' : job.status === 'ready' ? '90%' : '20%' }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex gap-2 shrink-0">
                          {job.invoices && job.invoices.length > 0 ? (
                            <Link href={`/dashboard/invoices/${job.invoices[0].id}`}>
                              <button className="px-4 py-2 text-xs font-bold bg-gray-50 text-gray-600 border border-gray-200 rounded-xl hover:bg-slate-700 transition-all flex items-center gap-2">
                                <CreditCard className="w-3.5 h-3.5" />
                                View Invoice
                              </button>
                            </Link>
                          ) : (
                            <button 
                              onClick={async () => {
                                if (confirm('Generate invoice for this project?')) {
                                   // We would call createInvoice action here
                                   alert('Visit Jobs to generate full invoice (MVP Action Required)')
                                }
                              }}
                              className="px-4 py-2 text-xs font-bold bg-gray-50 text-gray-600 border border-gray-200 rounded-xl hover:bg-slate-700 transition-all"
                            >
                              Create Invoice
                            </button>
                          )}
                          <button 
                            onClick={async () => {
                              const url = `${window.location.origin}/review/${job.review_token}`
                              await navigator.clipboard.writeText(url)
                              alert('Review link copied to clipboard!')
                            }}
                            className="px-4 py-2 text-xs font-bold bg-[#1e1b2e]/10 text-pink-600 border border-pink-200 rounded-xl hover:bg-[#1e1b2e]/20 transition-all"
                          >
                            Send Review Link
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Past History */}
          {completedJobs.length > 0 && (
            <div className="pt-8 opacity-60 hover:opacity-100 transition-opacity">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Completed History</h3>
              <div className="space-y-3">
                {completedJobs.map((job) => (
                  <div key={job.id} className="bg-white border border-gray-200/50 p-4 rounded-2xl flex justify-between items-center">
                    <span className="text-gray-900 font-medium">{job.title}</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-gray-500">{new Date(job.delivery_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. RIGHT COLUMN - MEASUREMENTS & FINANCE */}
        <div className="space-y-8">
          {/* Measurements Card */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 blur-[40px] -z-10" />
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Ruler className="w-5 h-5 text-emerald-400" />
                Measurements
              </h3>
              <button className="text-xs font-bold text-pink-600 uppercase tracking-wider hover:text-pink-500">Update</button>
            </div>

            {measurements.length === 0 ? (
              <div className="py-8 text-center bg-gray-50/20 rounded-2xl border border-dashed border-gray-200">
                 <p className="text-xs text-gray-500">No measurements recorded.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-200/50">
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{measurements[0].label}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md">CURRENT</span>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     {Object.entries(measurements[0].measurements as Record<string, string | number | boolean | null>).slice(0, 4).map(([key, val]) => (
                       <div key={key}>
                         <p className="text-[10px] text-gray-500 uppercase">{key}</p>
                         <p className="text-lg font-bold text-gray-900">{val}&quot;</p>
                       </div>
                     ))}
                   </div>
                   <button className="w-full mt-4 py-2 text-xs font-bold text-gray-500 bg-gray-50 rounded-xl hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                     View All Details
                     <ArrowUpRight className="w-3.5 h-3.5" />
                   </button>
                </div>
              </div>
            )}
          </div>

          {/* Appointments / Reminders */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xl">
             <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-pink-400" />
                Schedule
             </h3>
             <div className="space-y-4 text-center py-6 bg-gray-50/10 rounded-2xl border border-dashed border-gray-200">
                <p className="text-xs text-gray-500">No upcoming fittings or pickups.</p>
                <button className="text-xs font-bold text-pink-600 hover:underline">Schedule Fitting</button>
             </div>
          </div>

          {/* Finance / Invoices Quick View */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xl">
             <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                <CreditCard className="w-5 h-5 text-pink-600" />
                Invoices
             </h3>
             <div className="space-y-3">
                {(customer.jobs as Job[]).flatMap((j) => j.invoices || []).length > 0 ? (
                  ((customer.jobs as Job[]).flatMap((j) => j.invoices || []) as Invoice[]).map((inv) => (
                   <Link key={inv.id} href={`/dashboard/invoices/${inv.id}`} className="flex justify-between items-center p-3 rounded-xl bg-gray-50/30 border border-gray-200 hover:border-gray-300 transition-all">
                      <div>
                        <p className="text-xs font-bold text-gray-900 uppercase tracking-tighter">#INV-{inv.id.slice(0,4)}</p>
                        <p className="text-[10px] text-gray-500">{inv.status} &bull; {new Date(inv.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className="text-sm font-bold text-pink-600">₦{inv.total_amount.toLocaleString()}</span>
                   </Link>
                 ))
               ) : (
                 <div className="py-6 text-center bg-gray-50/10 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-xs text-gray-500 uppercase tracking-widest">No invoices issued</p>
                 </div>
               )}
               <button className="w-full py-3 text-xs font-bold text-pink-600 bg-indigo-500/5 hover:bg-pink-50 rounded-xl transition-all border border-indigo-500/10">
                 View Full Billing Ledger
               </button>
             </div>
          </div>

          {/* Feedback Stats */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xl">
             <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                <MessageSquare className="w-5 h-5 text-pink-400" />
                Client Satisfaction
             </h3>
             <div className="flex items-center gap-3">
               <div className="flex text-pink-500">
                 {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
               </div>
               <span className="text-sm font-bold text-gray-900">5.0</span>
               <span className="text-xs text-gray-500">(Verified)</span>
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function Star(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
