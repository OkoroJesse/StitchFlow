import { getJobs } from '@/actions/jobs'
import OrdersListClient from './OrdersListClient'

export default async function OrdersPage() {
  const jobs = await getJobs()

  return (
    <OrdersListClient initialJobs={jobs as any} />
  )
}
