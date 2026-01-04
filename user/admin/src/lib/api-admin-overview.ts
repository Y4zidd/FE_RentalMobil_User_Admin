import apiClient from './api-client'

export type OverviewMetrics = {
  pending_bookings?: number
  confirmed_bookings?: number
  cancelled_bookings?: number
  completed_bookings?: number
}

export type RevenueByMonthItem = {
  month: string
  online: number
  pay_at_location: number
}

export type OverviewResponse = {
  metrics: OverviewMetrics
  revenue_by_month?: RevenueByMonthItem[]
}

export async function fetchAdminOverview(): Promise<OverviewResponse> {
  const res = await apiClient.get('/api/admin/overview')
  const data = res.data || {}
  const metrics = data.metrics || {}
  const revenueItems = Array.isArray(data.revenue_by_month) ? data.revenue_by_month : []

  const revenue_by_month: RevenueByMonthItem[] = revenueItems.map((item: any) => ({
    month: String(item.month),
    online: Number(item.online ?? 0),
    pay_at_location: Number(item.pay_at_location ?? 0),
  }))

  return {
    metrics,
    revenue_by_month,
  }
}

