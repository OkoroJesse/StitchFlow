'use client'

import React, { useState, useEffect } from 'react'
import { getJobByToken, submitReview } from '@/actions/reviews'
import { getSignedUrl } from '@/lib/supabase/storage'
import { Button } from '@/components/shared/button'
import { Star, CheckCircle2, ShoppingBag, ImageIcon, Loader2 } from 'lucide-react'

interface JobReviewData {
  id: string
  title: string
  description?: string
  fabric_image_url?: string
  style_image_url?: string
  profiles: {
    business_name: string
  } | {
    business_name: string
  }[]
}

export default function PublicReviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = React.use(params)
  const [job, setJob] = useState<JobReviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const profile = Array.isArray(job?.profiles) ? job.profiles[0] : job?.profiles
  const businessName = profile?.business_name || 'Designer Studio'

  // Form State
  const [ratings, setRatings] = useState({
    fitting: 0,
    neatness: 0,
    delivery: 0
  })
  const [comment, setComment] = useState('')

  useEffect(() => {
    async function loadJob() {
      const data = await getJobByToken(token)
      if (data) {
        // Get signed URLs for images
        if (data.fabric_image_url) {
           data.fabric_image_url = await getSignedUrl(data.fabric_image_url)
        }
        if (data.style_image_url) {
           data.style_image_url = await getSignedUrl(data.style_image_url)
        }
        setJob(data)
      } else {
        setError('Review link is invalid or has expired.')
      }
      setLoading(false)
    }
    loadJob()
  }, [token])

  const handleRating = (key: keyof typeof ratings, value: number) => {
    setRatings(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!job) return
    if (ratings.fitting === 0 || ratings.neatness === 0 || ratings.delivery === 0) {
      alert('Please provide ratings for all categories.')
      return
    }

    setSubmitting(true)
    try {
      await submitReview({
        job_id: job.id,
        rating_fitting: ratings.fitting,
        rating_neatness: ratings.neatness,
        rating_delivery: ratings.delivery,
        comment
      })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-4">
           <h1 className="text-2xl font-bold text-white">Oops!</h1>
           <p className="text-slate-400">{error || 'Link invalid'}</p>
           <Button variant="secondary" onClick={() => window.location.reload()} className="w-full">Try Again</Button>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 animate-in fade-in zoom-in duration-500">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-12 rounded-[2.5rem] text-center space-y-6 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] -z-10" />
           <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
             <CheckCircle2 className="w-10 h-10 text-emerald-500" />
           </div>
           <h1 className="text-3xl font-bold text-white">Thank You!</h1>
           <p className="text-slate-400">Your feedback has been sent to <span className="text-white font-bold">{businessName}</span>. It helps them serve you better!</p>
           <div className="pt-4">
            <Button variant="secondary" onClick={() => window.close()} className="w-full">Close Page</Button>
           </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-12">
        {/* Business Brand */}
        <div className="text-center space-y-3">
           <div className="w-16 h-16 bg-[#e91e8c] rounded-2xl flex items-center justify-center mx-auto text-2xl font-black text-white shadow-xl shadow-[#e91e8c]/20">
             {businessName.charAt(0)}
           </div>
           <h2 className="text-xl font-bold text-white tracking-tight uppercase tracking-widest">{businessName}</h2>
           <div className="h-px w-12 bg-slate-800 mx-auto" />
           <p className="text-slate-500 text-sm">Review your custom fabrication</p>
        </div>

        {/* Job Summary Card (Restricted View) */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#e91e8c]/5 blur-[100px] -z-10" />
          
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-white tracking-tight">{job.title}</h1>
            <p className="text-slate-400 leading-relaxed italic">&ldquo;{job.description || 'Custom tailored project'}&rdquo;</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Fabric Used</p>
                <div className="aspect-square bg-slate-800 rounded-2xl overflow-hidden border border-slate-700">
                  {job.fabric_image_url ? (
                    <img src={job.fabric_image_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-slate-700" /></div>
                  )}
                </div>
             </div>
             <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Style Reference</p>
                <div className="aspect-square bg-slate-800 rounded-2xl overflow-hidden border border-slate-700">
                  {job.style_image_url ? (
                    <img src={job.style_image_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-6 h-6 text-slate-700" /></div>
                  )}
                </div>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="pt-8 border-t border-slate-800 space-y-10">
             {/* Rating Categories */}
             <div className="space-y-8">
               {[
                 { id: 'fitting', label: 'Outfit Fitting', desc: 'How well does it fit you?' },
                 { id: 'neatness', label: 'Finish & Neatness', desc: 'Consistency and quality of sewing.' },
                 { id: 'delivery', label: 'Delivery Timeliness', desc: 'Was it delivered when promised?' }
               ].map((cat) => (
                 <div key={cat.id} className="space-y-4">
                   <div>
                     <p className="text-sm font-bold text-white">{cat.label}</p>
                     <p className="text-xs text-slate-500">{cat.desc}</p>
                   </div>
                   <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRating(cat.id as keyof typeof ratings, star)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            ratings[cat.id as keyof typeof ratings] >= star 
                            ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' 
                            : 'bg-slate-800 text-slate-600 hover:text-slate-400'
                          }`}
                        >
                          <Star className={`w-5 h-5 ${ratings[cat.id as keyof typeof ratings] >= star ? 'fill-current' : ''}`} />
                        </button>
                      ))}
                   </div>
                 </div>
               ))}
             </div>

             <div className="space-y-3">
                <p className="text-sm font-bold text-white">Your Testimonial</p>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience wearing this outfit..."
                  rows={4}
                  className="w-full bg-slate-800 border border-slate-700 rounded-[1.5rem] p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all resize-none"
                />
             </div>

             <Button 
               type="submit" 
               loading={submitting} 
               className="w-full py-4 text-lg"
             >
               Submit Review
             </Button>
          </form>
        </div>

        <p className="text-center text-[11px] text-slate-600 uppercase tracking-widest pb-8">
          Powered by StitchFlow for Professionals
        </p>
      </div>
    </div>
  )
}
