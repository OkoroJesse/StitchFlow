import { getInvoiceById } from '@/actions/invoices'
import { notFound } from 'next/navigation'
import InvoiceDetailClient from './InvoiceDetailClient'

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const invoice = await getInvoiceById(params.id)

  if (!invoice) {
    notFound()
  }

  return (
    <InvoiceDetailClient invoice={invoice as any} />
  )
}
