import { getReviews } from '@/actions/reviews'
import { Star, MessageSquare, TrendingUp, Award, Inbox } from 'lucide-react'

function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const sz = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${sz} ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200 fill-stone-200'}`}
        />
      ))}
    </div>
  )
}

function RatingBar({ label, value }: { label: string; value: number }) {
  const pct = (value / 5) * 100
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="font-medium text-stone-600 uppercase tracking-wider text-[11px]">{label}</span>
        <span className="font-serif font-bold text-stone-900">{value.toFixed(1)}</span>
      </div>
      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #4a1525, #d9467c)',
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
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#18131d] to-[#2c1b26] p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden space-y-1">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#4a1525]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2 text-xs font-semibold text-rose-300 uppercase tracking-widest">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>Client Craftsmanship Ratings</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-white">
          Client Feedback & Reviews
        </h1>
        <p className="text-stone-300 text-sm sm:text-base max-w-xl font-light">
          Review authentic client feedback on fitting precision, sewing neatness, and delivery turnaround.
        </p>
      </div>

      {totalReviews === 0 ? (
        <div className="py-24 text-center bg-white border border-dashed border-stone-200 rounded-3xl space-y-4">
          <div className="w-16 h-16 bg-[#FAF8F5] rounded-2xl flex items-center justify-center mx-auto text-amber-500">
            <Inbox className="w-8 h-8 text-amber-400" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <p className="font-serif font-bold text-stone-900 text-lg">No client reviews yet</p>
            <p className="text-stone-500 text-xs sm:text-sm">
              Share review links with your clients from the Projects tab on their workspace profile. Feedback will appear here once submitted.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Overall Score Card */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-6xl sm:text-7xl font-serif font-bold text-stone-900 tracking-tight leading-none">
                  {overallAvg.toFixed(1)}
                </p>
                <div className="flex justify-center mt-3 mb-2">
                  <StarDisplay rating={Math.round(overallAvg)} size="lg" />
                </div>
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Overall Rating</p>
                <p className="text-xs text-stone-400 mt-0.5">Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-5">
              <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#4a1525]" />
                Category Breakdown
              </h3>
              <div className="space-y-4">
                <RatingBar label="Fitting & Garment Cut" value={avgFitting} />
                <RatingBar label="Sewing Neatness & Finish" value={avgNeatness} />
                <RatingBar label="Delivery Timeline" value={avgDelivery} />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs text-center space-y-1">
                <p className="text-3xl font-serif font-bold text-[#4a1525]">{totalReviews}</p>
                <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">Total Reviews</p>
              </div>
              <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs text-center space-y-1">
                <p className="text-3xl font-serif font-bold text-amber-500">{fiveStarCount}</p>
                <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">5-Star Projects</p>
              </div>
              <div className="col-span-2 bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                <Award className="w-8 h-8 text-rose-800 flex-shrink-0" />
                <div>
                  <p className="font-serif font-bold text-stone-900">
                    {fiveStarCount > 0
                      ? `${Math.round((fiveStarCount / totalReviews) * 100)}% Excellent Rating`
                      : 'Build your collection!'}
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">of projects rated 4.5+</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            <h2 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#4a1525]" />
              All Client Reviews
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((review) => {
                const job = Array.isArray(review.jobs) ? review.jobs[0] : review.jobs
                const customer = Array.isArray(job?.customers) ? job?.customers[0] : job?.customers
                const avg = ((review.rating_fitting + review.rating_neatness + review.rating_delivery) / 3)

                return (
                  <div
                    key={review.id}
                    className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all relative overflow-hidden space-y-4"
                  >
                    {/* Top row */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#18131d] to-[#4a1525] flex items-center justify-center text-rose-200 font-serif font-bold text-base flex-shrink-0">
                          {(customer?.full_name || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-serif font-bold text-stone-900 text-base">{customer?.full_name || 'Anonymous Client'}</p>
                          <p className="text-xs text-stone-500 font-medium truncate max-w-[160px]">{job?.title || 'Fashion Project'}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center justify-end gap-1 mb-1">
                          <span className="text-xl font-serif font-bold text-stone-900">{avg.toFixed(1)}</span>
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        </div>
                        <p className="text-[10px] font-semibold text-stone-400">
                          {new Date(review.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    {/* Category Stars */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Fitting', value: review.rating_fitting },
                        { label: 'Neatness', value: review.rating_neatness },
                        { label: 'Delivery', value: review.rating_delivery },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-[#FAF8F5] rounded-xl p-2.5 border border-stone-200 text-center">
                          <p className="text-[9px] font-semibold text-stone-500 uppercase tracking-widest mb-1">{label}</p>
                          <div className="flex justify-center">
                            <StarDisplay rating={value} />
                          </div>
                          <p className="text-xs font-bold text-stone-900 mt-1">{value}.0</p>
                        </div>
                      ))}
                    </div>

                    {/* Comment */}
                    {review.comment && (
                      <div className="bg-[#FAF8F5] rounded-xl p-3.5 border border-stone-200">
                        <p className="text-xs text-stone-600 leading-relaxed font-medium italic">
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

