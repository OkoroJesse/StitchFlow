import Link from 'next/link';
import { MessageSquare, Star, ArrowRight } from 'lucide-react';

export default function FeedbackPage() {
  return (
    <div className="animate-in fade-in duration-500 min-h-screen bg-[#FAF8F5]">

      {/* ── Header Banner ── */}
      <div className="bg-gradient-to-br from-[#18131d] to-[#2c1b26] px-8 py-10">
        <div className="max-w-5xl mx-auto">

          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-[#d9467c]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#d9467c]">
              Studio Feedback
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
            Client Satisfaction Hub
          </h1>

          {/* Subtitle */}
          <p className="text-sm text-white/60 max-w-xl leading-relaxed">
            All client feedback and satisfaction scores collected through your review links.
          </p>

        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-5xl mx-auto px-8 py-10 space-y-8">

        {/* ── Info Callout ── */}
        <div className="bg-white border border-stone-200/80 rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#fbf0f3] flex items-center justify-center">
            <Star className="w-5 h-5 text-[#d9467c]" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#1C1917] leading-relaxed">
              Client reviews are collected through unique{' '}
              <span className="font-bold text-[#1C1917]">review links</span>{' '}
              you share with clients after project delivery. Manage and generate
              review links from the{' '}
              <span className="font-bold text-[#1C1917]">Reviews</span> section.
            </p>
          </div>

          <Link
            href="/dashboard/reviews"
            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4a1525] hover:bg-[#5c1d30] text-white text-xs font-bold transition-colors"
          >
            Go to Reviews
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* ── Empty State ── */}
        <div className="bg-white border-2 border-dashed border-stone-200 rounded-3xl shadow-sm py-20 px-8 flex flex-col items-center text-center">

          {/* Icon container */}
          <div className="w-16 h-16 rounded-2xl bg-[#fbf0f3] flex items-center justify-center mb-5 shadow-sm">
            <MessageSquare className="w-8 h-8 text-[#d9467c]" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-extrabold text-[#1C1917] mb-2">
            No feedback collected yet
          </h2>

          {/* Body */}
          <p className="text-sm text-[#78716C] max-w-sm leading-relaxed mb-8">
            Share review links with your clients after delivering projects to
            start collecting feedback.
          </p>

          {/* CTA */}
          <Link
            href="/dashboard/reviews"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-br from-[#4a1525] to-[#5c1d30] hover:from-[#5c1d30] hover:to-[#6e2438] text-white text-sm font-bold transition-all shadow-md hover:shadow-lg"
          >
            Go to Reviews &amp; Ratings
            <ArrowRight className="w-4 h-4" />
          </Link>

        </div>

      </div>
    </div>
  );
}
