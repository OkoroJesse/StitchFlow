'use client'

import React, { useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Printer, ArrowLeft, Check, CreditCard, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/shared/button'
import { updateInvoiceStatus } from '@/actions/invoices'

interface Profile {
  business_name: string | null
  logo_url: string | null
}

interface Customer {
  id: string
  full_name: string
  phone_number: string
  address: string
}

interface Job {
  id: string
  title: string
  description: string | null
  agreed_price: number
  delivery_date: string
  customers: Customer
  profiles: Profile
}

interface Invoice {
  id: string
  status: string
  created_at: string
  due_date: string
  total_amount: number
  jobs: Job
}

interface Props {
  invoice: Invoice
}

export default function InvoiceDetailClient({ invoice }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleMarkPaid = () => {
    startTransition(async () => {
      try {
        await updateInvoiceStatus(invoice.id, 'paid', invoice.jobs.customers.id)
        router.refresh()
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to update status')
      }
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const businessName = invoice.jobs.profiles?.business_name || 'StitchFlow Bespoke'
  const isPaid = invoice.status === 'paid'

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20 animate-in fade-in duration-500">
      {/* ACTION BAR (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm gap-4 print:hidden">
        <Link href={`/dashboard/customers/${invoice.jobs.customers.id}`}>
          <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />} className="h-10 text-sm">
            Back to Client Profile
          </Button>
        </Link>
        
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            icon={<Printer className="w-4 h-4" />} 
            onClick={handlePrint}
            className="h-10 text-sm"
          >
            Print Invoice
          </Button>
          
          {!isPaid && (
            <Button
              onClick={handleMarkPaid}
              loading={isPending}
              className="h-10 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              icon={<Check className="w-4 h-4" />}
            >
              Mark as Paid
            </Button>
          )}
        </div>
      </div>

      {/* THE INVOICE CARD */}
      <div className="bg-white text-slate-800 rounded-[2.5rem] p-8 sm:p-20 shadow-xl border border-gray-100 relative overflow-hidden">
        {/* Decorative Badge */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#e91e8c]/3 blur-[80px] rounded-full -z-10" />

        {/* Header: Business Branding */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-2 border-gray-50 pb-10">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1e1b2e] uppercase">
              {businessName}
            </h1>
            <p className="text-gray-400 text-sm font-semibold tracking-wider">
              Bespoke Tailoring & Haute Couture
            </p>
          </div>
          <div className="text-left sm:text-right space-y-1 shrink-0">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Invoice Ref</p>
            <p className="text-xl font-black text-[#1e1b2e]">
              #INV-{invoice.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Client & Date Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-10 border-b border-gray-50">
          <div className="space-y-3.5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bill To</p>
            <div>
              <p className="text-xl font-black text-[#1e1b2e]">{invoice.jobs.customers.full_name}</p>
              <p className="text-gray-500 font-medium mt-1 leading-relaxed">{invoice.jobs.customers.address}</p>
              <p className="text-gray-500 font-semibold mt-1">{invoice.jobs.customers.phone_number}</p>
            </div>
          </div>
          
          <div className="space-y-3 sm:text-right shrink-0">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date Issued</p>
              <p className="text-base font-extrabold text-[#1e1b2e] mt-0.5">{new Date(invoice.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-4">Due Date</p>
              <p className="text-base font-extrabold text-purple-600 mt-0.5">{new Date(invoice.due_date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
            </div>
          </div>
        </div>

        {/* Order Details Table */}
        <div className="py-8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wider">Item / Description</th>
                <th className="py-4 text-right text-xs font-black text-gray-400 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr>
                <td className="py-8 pr-4">
                  <p className="font-extrabold text-[#1e1b2e] text-lg">{invoice.jobs.title}</p>
                  {invoice.jobs.description && (
                    <p className="text-gray-500 text-sm mt-1.5 leading-relaxed font-medium italic">
                      {invoice.jobs.description}
                    </p>
                  )}
                </td>
                <td className="py-8 text-right align-top shrink-0">
                  <p className="font-black text-[#1e1b2e] text-xl">₦{invoice.total_amount.toLocaleString()}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Ledger Breakdown */}
        <div className="border-t-2 border-gray-50 pt-10 mt-6">
          <div className="flex justify-end">
            <div className="w-full sm:w-80 space-y-4">
              <div className="flex justify-between items-center text-gray-500 font-semibold text-sm">
                <span>Subtotal</span>
                <span>₦{invoice.total_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-gray-500 font-semibold text-sm">
                <span>VAT (0%)</span>
                <span>₦0.00</span>
              </div>
              <div className="flex justify-between items-center py-4 border-t border-gray-100">
                <span className="font-black uppercase tracking-wider text-[#1e1b2e] text-sm">Total Due</span>
                <span className="text-3xl font-black text-[#e91e8c]">₦{invoice.total_amount.toLocaleString()}</span>
              </div>
              
              <div className={`py-4 px-6 rounded-2xl text-center font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 border ${
                isPaid 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                  : 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse'
              }`}>
                {isPaid ? (
                  <>
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>Payment Received</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 text-amber-600" />
                    <span>Payment Outstanding</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Print Footer */}
        <div className="pt-16 mt-8 border-t border-gray-50 text-center space-y-2.5">
          <p className="text-sm font-bold uppercase tracking-wider text-[#1e1b2e]/60">
            Thank you for selecting us to design for you
          </p>
          <p className="text-xs text-gray-400 italic">
            Invoice generated automatically by StitchFlow &mdash; The operating system for bespoke fashion.
          </p>
        </div>
      </div>
    </div>
  )
}
