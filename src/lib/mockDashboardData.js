import { Package, Truck, CheckCircle2, Clock, Wallet, UserPlus, Route as RouteIcon, BarChart3 } from 'lucide-react'

export const KPI_DATA = [
  {
    id: 'total',
    label: 'Total Deliveries',
    value: '1,284',
    trend: 8.2,
    trendDirection: 'up',
    helper: 'vs last 30 days',
    tone: 'cyan',
    icon: Package,
  },
  {
    id: 'active',
    label: 'Active Deliveries',
    value: 42,
    trend: 3.1,
    trendDirection: 'up',
    helper: 'currently in transit',
    tone: 'orange',
    icon: Truck,
  },
  {
    id: 'completed',
    label: 'Completed',
    value: '1,189',
    trend: 6.4,
    trendDirection: 'up',
    helper: 'this month',
    tone: 'emerald',
    icon: CheckCircle2,
  },
  {
    id: 'pending',
    label: 'Pending Pickup',
    value: 17,
    trend: -2.5,
    trendDirection: 'down',
    helper: 'awaiting driver',
    tone: 'neutral',
    icon: Clock,
  },
  {
    id: 'revenue',
    label: 'Revenue',
    value: '₦4,820,300',
    trend: 12.7,
    trendDirection: 'up',
    helper: 'this month',
    tone: 'mint',
    icon: Wallet,
  },
]

export const QUICK_ACTIONS = [
  { id: 'create-delivery', label: 'Create Delivery', description: 'Start a new delivery request', icon: Package },
  { id: 'add-driver', label: 'Add Driver', description: 'Onboard a new driver to your fleet', icon: UserPlus },
  { id: 'assign-trip', label: 'Assign Trip', description: 'Match a delivery to a driver', icon: RouteIcon },
  { id: 'view-analytics', label: 'View Analytics', description: 'See performance across your fleet', icon: BarChart3 },
]

export const STATUS_META = {
  pending: { label: 'Pending', tone: 'neutral' },
  in_transit: { label: 'In Transit', tone: 'cyan' },
  delivered: { label: 'Delivered', tone: 'emerald' },
  delayed: { label: 'Delayed', tone: 'orange' },
}

export const TODAYS_TRIPS = [
  { id: 'TRK-2026-8F4A92', receiver: 'Aisha Bello', driver: 'Tunde Bakare', status: 'in_transit', eta: '12:45 PM' },
  { id: 'TRK-2026-3D71C4', receiver: 'Chinedu Eze', driver: 'Ngozi Umeh', status: 'pending', eta: '1:30 PM' },
  { id: 'TRK-2026-9B2E17', receiver: 'Femi Adegoke', driver: 'Blessing Nwosu', status: 'delivered', eta: 'Delivered 11:02 AM' },
  { id: 'TRK-2026-5A66D0', receiver: 'Grace Etim', driver: 'Ibrahim Sule', status: 'delayed', eta: '2:15 PM' },
  { id: 'TRK-2026-7C90F3', receiver: 'Samuel Okon', driver: 'Tunde Bakare', status: 'in_transit', eta: '3:00 PM' },
]

export const RECENT_ACTIVITY = [
  { id: 1, type: 'trip_assigned', message: 'Trip TRK-2026-7C90F3 assigned to Tunde Bakare', time: '2 minutes ago' },
  { id: 2, type: 'delivery_completed', message: 'Delivery to Femi Adegoke marked complete', time: '18 minutes ago' },
  { id: 3, type: 'payment_received', message: 'Payment of ₦12,500 received for TRK-2026-9B2E17', time: '32 minutes ago' },
  { id: 4, type: 'driver_accepted', message: 'Ngozi Umeh accepted trip TRK-2026-3D71C4', time: '1 hour ago' },
  { id: 5, type: 'delivery_completed', message: 'Delivery to Grace Etim marked complete', time: '3 hours ago' },
]
