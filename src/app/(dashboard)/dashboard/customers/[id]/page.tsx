import { getCustomerById } from '@/actions/customers'
import { notFound } from 'next/navigation'
import CustomerProfileClient from '../CustomerProfileClient'

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: customerId } = await params
  const customer = await getCustomerById(customerId)

  if (!customer) {
    notFound()
  }

  return (
    <CustomerProfileClient customer={customer as any} />
  )
}
