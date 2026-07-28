import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { DesktopSidebar, MobileDrawer } from './Sidebar'
import Topbar from './Topbar'
import Loader from '../ui/Loader'
import { getSession } from '../../lib/session'
import { ROUTES } from '../../lib/routes'

export default function DashboardLayout() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const current = getSession()
    if (!current?.email) {
      navigate(ROUTES.businessLogin, { replace: true })
      return
    }
    if (!current.setupComplete) {
      navigate(ROUTES.companySetup, { replace: true })
      return
    }
    setSession(current)
  }, [navigate])

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-ink)]">
        <Loader size={28} className="text-[var(--color-paper-faint)]" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-ink)]">
      <DesktopSidebar />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar companyName={session.companyName} onMenuClick={() => setDrawerOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet context={{ session }} />
        </main>
      </div>
    </div>
  )
}
