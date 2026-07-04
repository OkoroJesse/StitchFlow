'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LocalNotificationManager() {
  const supabase = createClient()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window)) return

    // 1. Request notification permission if not yet decided
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }

    async function checkAndNotify() {
      if (Notification.permission !== 'granted') return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch profile and jobs to calculate metrics & deadlines
      const [profileRes, jobsRes, invoicesRes] = await Promise.all([
        supabase.from('profiles').select('business_name').eq('id', user.id).maybeSingle(),
        supabase.from('jobs').select('title, delivery_date, status, customers(id, full_name)').eq('business_id', user.id),
        supabase.from('invoices').select('id, total_amount').eq('business_id', user.id).eq('status', 'unpaid'),
      ])

      const businessName = profileRes.data?.business_name || 'My Studio'
      const jobs = jobsRes.data || []
      const unpaidInvoices = invoicesRes.data || []
      const activeJobs = jobs.filter(j => j.status !== 'delivered')

      const today = new Date()
      // Normalize today to start of day for accurate diff checks
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

      const dueToday: any[] = []
      const dueTomorrow: any[] = []
      const dueSoon: any[] = [] // within 3 days

      activeJobs.forEach(job => {
        if (!job.delivery_date) return
        const deliveryDate = new Date(job.delivery_date)
        const deliveryStart = new Date(deliveryDate.getFullYear(), deliveryDate.getMonth(), deliveryDate.getDate())
        
        const diffTime = deliveryStart.getTime() - todayStart.getTime()
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 0) {
          dueToday.push(job)
        } else if (diffDays === 1) {
          dueTomorrow.push(job)
        } else if (diffDays > 1 && diffDays <= 3) {
          dueSoon.push(job)
        }
      })

      // Get the service worker registration for native PWA system notifications
      const reg = await navigator.serviceWorker.ready.catch(() => null)

      const triggerNativeNotification = (title: string, options: NotificationOptions) => {
        const defaultOptions: any = {
          icon: '/icon-192x192.png',
          badge: '/favicon.ico',
          vibrate: [200, 100, 200],
          ...options,
        }
        if (reg) {
          reg.showNotification(title, defaultOptions)
        } else {
          new Notification(title, defaultOptions)
        }
      }

      const nowStr = new Date().toDateString()

      // A. Good morning/welcome notifications
      const lastWelcomeTime = localStorage.getItem('sf_last_welcome_time')
      if (lastWelcomeTime !== nowStr) {
        const hr = new Date().getHours()
        let greeting = ''
        if (hr >= 5 && hr < 12) greeting = 'Good morning'
        else if (hr >= 12 && hr < 17) greeting = 'Good afternoon'
        else if (hr >= 17 && hr < 22) greeting = 'Good evening'

        if (greeting) {
          triggerNativeNotification(`${greeting}, ${businessName}! 🪡`, {
            body: `You have ${activeJobs.length} active orders and ${unpaidInvoices.length} unpaid invoices. Let's make today awesome!`,
            tag: 'welcome-greeting',
          })
          localStorage.setItem('sf_last_welcome_time', nowStr)
        }
      }

      // B. Precision deadline alerts
      const lastDeadlineCheck = localStorage.getItem('sf_last_deadline_check')
      if (lastDeadlineCheck !== nowStr) {
        if (dueToday.length > 0) {
          const first = dueToday[0]
          const customerName = (Array.isArray(first.customers) ? first.customers[0] : first.customers)?.full_name || 'Client'
          triggerNativeNotification('Order Due Today! 🚨', {
            body: `"${first.title}" for ${customerName} is due today! Double check fitting & final delivery.`,
            tag: 'deadline-today',
          })
        } else if (dueTomorrow.length > 0) {
          const first = dueTomorrow[0]
          const customerName = (Array.isArray(first.customers) ? first.customers[0] : first.customers)?.full_name || 'Client'
          triggerNativeNotification('Order Due Tomorrow! ⏳', {
            body: `"${first.title}" for ${customerName} is due tomorrow. Complete sewing and prepare for pick up.`,
            tag: 'deadline-tomorrow',
          })
        } else if (dueSoon.length > 0) {
          const first = dueSoon[0]
          const customerName = (Array.isArray(first.customers) ? first.customers[0] : first.customers)?.full_name || 'Client'
          triggerNativeNotification('Upcoming Deadline 📅', {
            body: `"${first.title}" for ${customerName} is due in 3 days.`,
            tag: 'deadline-soon',
          })
        }
        localStorage.setItem('sf_last_deadline_check', nowStr)
      }
    }

    // Trigger local push checks after a short load delay
    const timer = setTimeout(checkAndNotify, 4000)
    return () => clearTimeout(timer)
  }, [supabase])

  return null
}
