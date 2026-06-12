import { getReviews } from '@/actions/reviews'
import { Star, MessageSquare, TrendingUp, Award, Inbox } from 'lucide-react'

function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const sz = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${sz} ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
        />
      ))}
    </div>
  )
}

function RatingBar({ label, value }: { label: string; value: number }) {
  const pct = (value / 5) * 100
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</span>
        <span className="text-sm font-black text-[#1e1b2e]">{value.toFixed(1)}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #e91e8c, #7c3aed)',
          }}
        />
      </div>
    </div>
  )
}

export default async function ReviewsPage() {
  const reviews = await getReviews()

  const totalReviews = reviews.length
  const avgFitting   = totalReviews ? reviews.reduce((s, r) => s + (r.rating_fitting  || 0), 0) / totalReviews : 0
  const avgNeatness  = totalReviews ? reviews.reduce((s, r) => s + (r.rating_neatness || 0), 0) / totalReviews : 0
  const avgDelivery  = totalReviews ? reviews.reduce((s, r) => s + (r.rating_delivery || 0), 0) / totalReviews : 0
  const overallAvg   = totalReviews ? (avgFitting + avgNeatness + avgDelivery) / 3 : 0

  const fiveStarCount = reviews.filter(r => ((r.rating_fitting + r.rating_neatness + r.rating_delivery) / 3) >= 4.5).length

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1e1b2e] tracking-tight flex items-center gap-3">
            <span className="p-2 rounded-2xl" style={{ background: 'rgba(245,158,11,0.1)' }}>
              <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
            </span>
            Customer Reviews
          </h1>
          <p className="text-gray-500 mt-2 text-base font-medium">
            See what your clients say about your craftsmanship.
          </p>
        </div>
      </div>

      {totalReviews === 0 ? (
        <div className="py-32 text-center bg-white border-2 border-dashed border-gray-100 rounded-[3rem] space-y-6">
          <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto">
            <Inbox className="w-10 h-10 text-amber-300" />
          </div>
          <div className="space-y-2 max-w-sm mx-auto">
            <p className="text-[#1e1b2e] font-extrabold text-xl">No reviews yet</p>
            <p className="text-gray-500 text-base">
              Share review links with your clients from the Orders tab on their profile. Reviews will appear here once submitted.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Overall Score Card */}
            <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 shadow-lg flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(233,30,140,0.05), transparent 70%)' }} />
              <div className="relative z-10">
                <p className="text-8xl font-black text-[#1e1b2e] tracking-tight leading-none">
                  {overallAvg.toFixed(1)}
                </p>
                <div className="flex justify-center mt-3 mb-2">
                  <StarDisplay rating={Math.round(overallAvg)} size="lg" />
                </div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Overall Rating</p>
                <p className="text-xs text-gray-400 mt-1">Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 shadow-lg space-y-6">
              <h3 className="text-lg font-extrabold text-[#1e1b2e] uppercase tracking-tight flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#e91e8c]" />
                Category Breakdown
              </h3>
              <div className="space-y-5">
                <RatingBar label="Fitting & Fit Quality" value={avgFitting} />
                <RatingBar label="Neatness & Finish" value={avgNeatness} />
                <RatingBar label="Delivery & Timeline" value={avgDelivery} />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border-2 border-gray-100 rounded-[2rem] p-6 shadow-sm text-center space-y-2">
                <p className="text-4xl font-black text-[#e91e8c]">{totalReviews}</p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Reviews</p>
              </div>
              <div className="bg-white border-2 border-gray-100 rounded-[2rem] p-6 shadow-sm text-center space-y-2">
                <p className="text-4xl font-black text-amber-500">{fiveStarCount}</p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">5-Star Orders</p>
              </div>
              <div className="col-span-2 bg-white border-2 border-gray-100 rounded-[2rem] p-6 shadow-sm flex items-center gap-4">
                <Award className="w-10 h-10 text-[#7c3aed] flex-shrink-0" />
                <div>
                  <p className="font-extrabold text-[#1e1b2e]">
                    {fiveStarCount > 0
                      ? `${Math.round((fiveStarCount / totalReviews) * 100)}% excellent`
                      : 'Keep going!'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">of orders rated 4.5+</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div>
            <h2 className="text-xl font-extrabold text-[#1e1b2e] mb-5 uppercase tracking-tight flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#e91e8c]" />
              All Reviews
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {reviews.map((review) => {
                const job = Array.isArray(review.jobs) ? review.jobs[0] : review.jobs
                const customer = Array.isArray(job?.customers) ? job?.customers[0] : job?.customers
                const avg = ((review.rating_fitting + review.rating_neatness + review.rating_delivery) / 3)

                return (
                  <div
                    key={review.id}
                    className="bg-white border-2 border-gray-100 rounded-[2rem] p-7 shadow-md hover:shadow-xl hover:border-gray-200 transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] pointer-events-none" style={{ background: 'rgba(233,30,140,0.05)' }} />

                    {/* Top row */}
                    <div className="flex justify-between items-start gap-4 mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-[#1e1b2e] flex items-center justify-center text-[#e91e8c] font-black text-lg flex-shrink-0">
                          {(customer?.full_name || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-extrabold text-[#1e1b2e] text-base">{customer?.full_name || 'Anonymous'}</p>
                          <p className="text-xs text-gray-400 font-semibold mt-0.5 truncate max-w-[160px]">{job?.title || 'Unknown Order'}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center justify-end gap-1 mb-1">
                          <span className="text-2xl font-black text-[#1e1b2e]">{avg.toFixed(1)}</span>
                          <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {new Date(review.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    {/* Category Stars */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      {[
                        { label: 'Fitting', value: review.rating_fitting },
                        { label: 'Neatness', value: review.rating_neatness },
                        { label: 'Delivery', value: review.rating_delivery },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-[#FAFAF8] rounded-xl p-3 border border-gray-100 text-center">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{label}</p>
                          <div className="flex justify-center">
                            <StarDisplay rating={value} />
                          </div>
                          <p className="text-sm font-black text-[#1e1b2e] mt-1">{value}.0</p>
                        </div>
                      ))}
                    </div>

                    {/* Comment */}
                    {review.comment && (
                      <div className="bg-[#FAFAF8] rounded-2xl p-4 border border-gray-100">
                        <p className="text-sm text-gray-600 leading-relaxed font-medium italic">
                          &ldquo;{review.comment}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
