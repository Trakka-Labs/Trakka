import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router'
import { DesktopSidebar, MobileDrawer } from './Sidebar'
import Topbar from './Topbar'
import Loader from '../ui/Loader'
import { getCurrentAccount } from '../../lib/api'
import { ROUTES } from '../../lib/routes'

export default function DashboardLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [session, setSession] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    getCurrentAccount()
      .then((account) => {
        if (cancelled) return
        if (!account.setupComplete) {
          navigate(ROUTES.companySetup, { replace: true })
          return
        }
        setSession(account)
      })
      .catch(() => navigate(ROUTES.businessLogin, { replace: true }))
    return () => {
      cancelled = true
    }
  }, [navigate])

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-ink)]">
        <Loader size={28} />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-ink)]">
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <DesktopSidebar />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:ml-64">
        <Topbar companyName={session.companyName} onMenuClick={() => setDrawerOpen(true)} />
        <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
          <Outlet context={{ session }} />
        </main>
      </div>
    </div>
  )
}
