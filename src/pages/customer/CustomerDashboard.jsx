import { MapPinned } from 'lucide-react'
import PreviewHeader from '../../components/dashboard/PreviewHeader'
import EmptyState from '../../components/dashboard/EmptyState'

export default function CustomerDashboard() {
  return (
    <div className="min-h-screen bg-[var(--color-ink)]">
      <PreviewHeader current="customer" suffix="Customer tracking" />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center px-4 py-12 sm:px-6">
        <div className="w-full rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-8">
          <EmptyState
            icon={MapPinned}
            title="Tracking is not active"
            description="A real tracking session will appear here after a dispatched delivery receives a secure tracking token."
          />
        </div>
      </main>
    </div>
  )
}
