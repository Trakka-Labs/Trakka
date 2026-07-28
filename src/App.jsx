import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Loader from './components/ui/Loader'
import { ROUTES } from './lib/routes'

const Landing = lazy(() => import('./pages/Landing'))
const GetStarted = lazy(() => import('./pages/GetStarted'))
const BusinessAuth = lazy(() => import('./pages/business/BusinessAuth'))
const ForgotPassword = lazy(() => import('./pages/business/ForgotPassword'))
const VerifyOtp = lazy(() => import('./pages/business/VerifyOtp'))
const ResetPassword = lazy(() => import('./pages/business/ResetPassword'))
const CompanySetup = lazy(() => import('./pages/business/CompanySetup'))
const DashboardLayout = lazy(() => import('./components/dashboard/DashboardLayout'))
const DashboardOverview = lazy(() => import('./pages/business/dashboard/DashboardOverview'))
const NotFound = lazy(() => import('./pages/NotFound'))

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-ink)]">
      <Loader size={28} className="text-[var(--color-paper-faint)]" />
    </div>
  )
}

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path={ROUTES.home} element={<Landing />} />
        <Route path={ROUTES.getStarted} element={<GetStarted />} />
        <Route path={ROUTES.businessSignup} element={<BusinessAuth />} />
        <Route path={ROUTES.businessLogin} element={<BusinessAuth />} />
        <Route path={ROUTES.businessForgotPassword} element={<ForgotPassword />} />
        <Route path={ROUTES.businessVerifyOtp} element={<VerifyOtp />} />
        <Route path={ROUTES.businessResetPassword} element={<ResetPassword />} />
        <Route path={ROUTES.companySetup} element={<CompanySetup />} />
        <Route path={ROUTES.businessDashboard} element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
