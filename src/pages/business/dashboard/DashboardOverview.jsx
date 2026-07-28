import { useOutletContext } from 'react-router-dom'
import WelcomeHeader from '../../../components/dashboard/WelcomeHeader'
import KpiCard from '../../../components/dashboard/KpiCard'
import QuickActions from '../../../components/dashboard/QuickActions'
import TodaysTrips from '../../../components/dashboard/TodaysTrips'
import RecentActivity from '../../../components/dashboard/RecentActivity'
import { KPI_DATA, QUICK_ACTIONS, TODAYS_TRIPS, RECENT_ACTIVITY } from '../../../lib/mockDashboardData'

export default function DashboardOverview() {
  const { session } = useOutletContext()

  return (
    <div className="flex flex-col gap-10">
      <WelcomeHeader companyName={session?.companyName} />

      <section>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {KPI_DATA.map((kpi, i) => (
            <KpiCard key={kpi.id} {...kpi} index={i} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold text-[var(--color-paper)]">Quick actions</h2>
        <QuickActions actions={QUICK_ACTIONS} />
      </section>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <h2 className="mb-4 font-display text-lg font-semibold text-[var(--color-paper)]">Today&apos;s trips</h2>
          <TodaysTrips trips={TODAYS_TRIPS} />
        </div>
        <div>
          <h2 className="mb-4 font-display text-lg font-semibold text-[var(--color-paper)]">Recent activity</h2>
          <RecentActivity activity={RECENT_ACTIVITY} />
        </div>
      </section>
    </div>
  )
}
