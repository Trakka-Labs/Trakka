import { Bike } from 'lucide-react'
import PreviewHeader from '../../components/dashboard/PreviewHeader'
import EmptyState from '../../components/dashboard/EmptyState'

export default function RiderDashboard() {
  return (
    <div className="min-h-screen bg-[var(--color-ink)]">
      <PreviewHeader current="rider" suffix="Rider workspace" />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center px-4 py-12 sm:px-6">
        <div className="w-full rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-8">
          <EmptyState
            icon={Bike}
            title="No rider assignment"
            description="Real route assignments will appear here after a rider account is connected and a business dispatches a route."
          />
        </div>
      </main>
    </div>
  )
}
