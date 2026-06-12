import { getInvoices } from '@/actions/invoices'
import { FileText, Inbox, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function InvoicesPage() {
  const invoices = await getInvoices()

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FileText className="w-8 h-8 text-pink-600" />
          Financial Ledger
        </h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-[#FAFAF8]/50 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-200">
            <tr>
              <th className="px-10 py-5">Invoice ID</th>
              <th className="px-10 py-5">Customer</th>
              <th className="px-10 py-5">Amount</th>
              <th className="px-10 py-5">Status</th>
              <th className="px-10 py-5 text-right pr-16">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices && invoices.length > 0 ? (
              invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-10 py-6 font-bold text-gray-500 text-xs uppercase tracking-tighter">#INV-{inv.id.slice(0,8)}</td>
                  <td className="px-10 py-6 font-bold text-gray-900 tracking-tight uppercase text-sm">{inv.jobs?.customers?.full_name || 'Unknown'}</td>
                  <td className="px-10 py-6 text-pink-600 font-bold">₦{inv.total_amount.toLocaleString()}</td>
                  <td className="px-10 py-6">
                    <span className={`px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest border ${
                      inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-pink-500/10 text-pink-400 border-pink-500/20'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right pr-16">
                    <Link href={`/dashboard/invoices/${inv.id}`}>
                      <button className="text-xs font-bold text-pink-600 hover:text-gray-900 transition-colors flex items-center gap-2 ml-auto uppercase tracking-widest">
                        View Receipt
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-10 py-20 text-center text-slate-600 uppercase tracking-widest text-[10px] font-bold">
                  <Inbox className="w-8 h-8 mx-auto mb-4 opacity-20" />
                  No invoice records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
