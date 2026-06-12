import { getInvoices } from '@/actions/invoices'
import InvoicesListClient from './InvoicesListClient'

export default async function InvoicesPage() {
  const invoices = await getInvoices()
  return <InvoicesListClient initialInvoices={invoices as any} />
}
