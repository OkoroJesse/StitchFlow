import { getCustomers } from '@/actions/customers'
import CustomerListClient from './CustomerListClient'

export default async function CustomersPage() {
  const customers = await getCustomers()

  return (
    <CustomerListClient initialCustomers={customers} />
  )
}

