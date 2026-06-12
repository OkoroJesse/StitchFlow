import { getInvoiceById } from '@/actions/invoices'
import { notFound } from 'next/navigation'
import InvoiceDetailClient from './InvoiceDetailClient'

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const invoice = await getInvoiceById(id)

  if (!invoice) {
    notFound()
  }

  return (
    <InvoiceDetailClient invoice={invoice as any} />
  )
}
