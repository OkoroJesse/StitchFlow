import { BarChart3, Inbox } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
        <BarChart3 className="w-8 h-8 text-blue-400" />
        Business Reports
      </h1>
      <div className="bg-white border border-gray-200 rounded-[2.5rem] p-20 text-center space-y-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px]" />
        <div className="w-16 h-16 bg-[#FAFAF8] rounded-full flex items-center justify-center mx-auto border border-gray-200">
          <BarChart3 className="w-8 h-8 text-slate-700" />
        </div>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Analytics will appear as you process more jobs</p>
      </div>
    </div>
  )
}
