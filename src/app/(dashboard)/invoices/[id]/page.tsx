import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/shared/button'
import { Printer, Download, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select(`
      *,
      jobs (
        title,
        description,
        customers (
          full_name,
          phone_number,
          address
        ),
        profiles (
          business_name,
          logo_url,
          created_at
        )
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !invoice) {
    notFound()
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      {/* Action Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200 print:hidden">
        <Link href={`/dashboard/customers/${invoice.jobs.customers.id}`}>
          <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>Back to Client</Button>
        </Link>
        <div className="flex gap-4">
          <Button variant="secondary" icon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>Print Invoice</Button>
          <Button icon={<Download className="w-4 h-4" />}>Download PDF</Button>
        </div>
      </div>

      {/* THE INVOICE - Designed for Print */}
      <div className="bg-white text-slate-900 rounded-[2.5rem] p-6 sm:p-20 shadow-sm overflow-hidden relative">
        {/* Branding & Info */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-2 border-slate-100 pb-12">
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tighter uppercase">{invoice.jobs.profiles.business_name}</h1>
            <p className="text-gray-500 text-sm max-w-[200px]">Bespoke Tailoring & Fashion Fabrication Specialist.</p>
          </div>
          <div className="text-left sm:text-right space-y-1">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Invoice Number</p>
            <p className="text-xl font-bold">#INV-{new Date(invoice.created_at).getFullYear()}-{invoice.id.slice(0, 4).toUpperCase()}</p>
          </div>
        </div>

        {/* Billing Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-12">
          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Bill To</p>
            <div>
              <p className="text-xl font-bold">{invoice.jobs.customers.full_name}</p>
              <p className="text-gray-500">{invoice.jobs.customers.address}</p>
              <p className="text-gray-500">{invoice.jobs.customers.phone_number}</p>
            </div>
          </div>
          <div className="space-y-4 sm:text-right">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Date Issued</p>
            <p className="text-lg font-bold">{new Date(invoice.created_at).toLocaleDateString()}</p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest pt-4">Due Date</p>
            <p className="text-lg font-bold text-indigo-600">{new Date(invoice.due_date).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Item Table */}
        <div className="py-8">
           <table className="w-full">
             <thead>
               <tr className="border-b border-slate-100">
                 <th className="py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Description</th>
                 <th className="py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Amount</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
               <tr>
                 <td className="py-8">
                   <p className="font-bold text-xl">{invoice.jobs.title}</p>
                   <p className="text-gray-500 text-sm mt-1">{invoice.jobs.description}</p>
                 </td>
                 <td className="py-8 text-right align-top">
                   <p className="font-bold text-2xl">₦{invoice.total_amount.toLocaleString()}</p>
                 </td>
               </tr>
             </tbody>
           </table>
        </div>

        {/* Totals */}
        <div className="border-t-2 border-slate-100 pt-12 mt-8">
           <div className="flex justify-end">
              <div className="w-full sm:w-64 space-y-4">
                 <div className="flex justify-between items-center text-gray-500">
                   <span>Subtotal</span>
                   <span>₦{invoice.total_amount.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center text-gray-500">
                   <span>Tax (0%)</span>
                   <span>₦0.00</span>
                 </div>
                 <div className="flex justify-between items-center py-4 border-t border-slate-100">
                   <span className="font-black uppercase tracking-widest">Total Total</span>
                   <span className="text-3xl font-black">₦{invoice.total_amount.toLocaleString()}</span>
                 </div>
                 
                 <div className={`py-4 px-6 rounded-2xl text-center font-bold text-sm uppercase tracking-widest ${
                   invoice.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-pink-50 text-pink-600'
                 }`}>
                   Status: {invoice.status.replace('_', ' ')}
                 </div>
              </div>
           </div>
        </div>

        {/* Footer */}
        <div className="pt-20 text-center space-y-2">
           <p className="text-sm font-bold uppercase tracking-widest text-gray-600">Thank you for your business</p>
           <p className="text-xs text-gray-500 italic">&ldquo;Created with StitchFlow &mdash; The operating system for fashion.&rdquo;</p>
        </div>
      </div>
    </div>
  )
}
