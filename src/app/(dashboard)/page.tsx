import { Users, ShoppingBag, Clock, Star } from 'lucide-react'

const stats = [
  { label: 'Total Customers', value: '124', icon: Users, color: 'text-blue-400' },
  { label: 'Active Jobs', value: '12', icon: ShoppingBag, color: 'text-pink-600' },
  { label: 'Upcoming Deliveries', value: '5', icon: Clock, color: 'text-pink-400' },
  { label: 'Recent Feedback', value: '4.9', icon: Star, color: 'text-emerald-400' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 p-6 rounded-2xl space-y-3 shadow-sm hover:shadow-indigo-500/5 transition-shadow">
            <div className="flex justify-between items-start">
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
              <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded">Last 30 days</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Active Jobs</h3>
            <button className="text-sm text-pink-600 hover:text-pink-500 font-medium">View all</button>
          </div>
          <div className="p-0">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3 font-semibold">Customer</th>
                  <th className="px-6 py-3 font-semibold">Job</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { name: 'Sarah Johnson', job: 'Evening Gown', status: 'In Sewing' },
                  { name: 'Michael Chen', job: 'Custom Suit', status: 'Cutting' },
                  { name: 'Elena Rodriguez', job: 'Wedding Dress', status: 'Fitting' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{row.name}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{row.job}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-pink-50 text-pink-600 rounded-full border border-pink-200">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Deliveries */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Deliveries</h3>
          </div>
          <div className="p-6 space-y-4">
            {[
              { name: 'David Smith', date: 'Tomorrow', time: '10:00 AM' },
              { name: 'Lisa Wong', date: 'May 23', time: '2:00 PM' },
              { name: 'Robert Blake', date: 'May 25', time: '11:30 AM' },
            ].map((delivery, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/50 border border-gray-200/50">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{delivery.name}</p>
                  <p className="text-sm text-gray-500">{delivery.date} • {delivery.time}</p>
                </div>
                <button className="px-4 py-2 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-gray-900 rounded-lg transition-colors">
                  Remind
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
