import { Calendar, Inbox } from 'lucide-react'

export default function AppointmentsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
        <Calendar className="w-8 h-8 text-pink-400" />
        Schedule
      </h1>
      <div className="bg-white border border-gray-200 rounded-[2.5rem] p-20 text-center space-y-4">
        <div className="w-16 h-16 bg-[#FAFAF8] rounded-full flex items-center justify-center mx-auto border border-gray-200">
          <Calendar className="w-8 h-8 text-slate-700" />
        </div>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No appointments scheduled for today</p>
      </div>
    </div>
  )
}
