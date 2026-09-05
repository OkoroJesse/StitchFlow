import { BarChart3, TrendingUp, Scissors, Users, Award, Calendar, DollarSign } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#18131d] to-[#2c1b26] p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden space-y-1">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#4a1525]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2 text-xs font-semibold text-rose-300 uppercase tracking-widest">
          <BarChart3 className="w-4 h-4 text-rose-400" />
          <span>Atelier Intelligence & Growth</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-white">
          Business Reports
        </h1>
        <p className="text-stone-300 text-sm sm:text-base max-w-xl font-light">
          Analyze production velocity, revenue trends, top garment categories, and client retention rates.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-[#4a1525]">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <p className="text-3xl font-serif font-bold text-stone-900">100%</p>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mt-1">Completion Efficiency</p>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-3xl font-serif font-bold text-stone-900">₦450,000</p>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mt-1">Monthly Project Pipeline</p>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-3xl font-serif font-bold text-stone-900">92%</p>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mt-1">Repeat Client Rate</p>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-3xl font-serif font-bold text-stone-900">4.9 / 5.0</p>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mt-1">Average Craft Rating</p>
          </div>
        </div>
      </div>

      {/* GARMENT TYPE PERFORMANCE BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-6">
          <h3 className="font-serif text-lg font-bold text-stone-900">Popular Garment Categories</h3>
          <div className="space-y-4">
            {[
              { type: 'Native / Senator Wear', count: '14 Commissions', share: '45%' },
              { type: 'Agbada Sets', count: '8 Commissions', share: '25%' },
              { type: 'Gowns & Evening Wear', count: '6 Commissions', share: '20%' },
              { type: 'Bespoke Suits & Blazers', count: '3 Commissions', share: '10%' },
            ].map((item) => (
              <div key={item.type} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-stone-800">{item.type}</span>
                  <span className="text-stone-500 font-medium">{item.count} ({item.share})</span>
                </div>
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#18131d] to-[#4a1525] rounded-full"
                    style={{ width: item.share }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-serif text-lg font-bold text-stone-900">Production Insights</h3>
          <div className="space-y-3">
            <div className="p-4 bg-[#FAF8F5] rounded-xl border border-stone-200 space-y-1">
              <p className="text-xs font-bold text-[#4a1525] uppercase tracking-wider">Fastest Turnaround Garment</p>
              <p className="text-sm font-semibold text-stone-800">Senator Wear Sets (Avg. 3.2 days from cutting to delivery)</p>
            </div>
            <div className="p-4 bg-[#FAF8F5] rounded-xl border border-stone-200 space-y-1">
              <p className="text-xs font-bold text-[#4a1525] uppercase tracking-wider">Highest Value Commission</p>
              <p className="text-sm font-semibold text-stone-800">Heavy Silk Agbada & Bridal Gown tailoring</p>
            </div>
            <div className="p-4 bg-[#FAF8F5] rounded-xl border border-stone-200 space-y-1">
              <p className="text-xs font-bold text-[#4a1525] uppercase tracking-wider">Recommended Next Step</p>
              <p className="text-sm font-semibold text-stone-800">Send reminder notifications for upcoming fitting sessions this week.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

