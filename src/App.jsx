import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
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
const Deliveries = lazy(() => import('./pages/business/dashboard/Deliveries'))
const DeliveryDetails = lazy(() => import('./pages/business/dashboard/DeliveryDetails'))
const CreateDelivery = lazy(() => import('./pages/business/dashboard/CreateDelivery'))
const Dispatch = lazy(() => import('./pages/business/dashboard/Dispatch'))
const Drivers = lazy(() => import('./pages/business/dashboard/Drivers'))
const Communications = lazy(() => import('./pages/business/dashboard/Communications'))
const RiderDashboard = lazy(() => import('./pages/rider/RiderDashboard'))
const RiderRouteMessages = lazy(() => import('./pages/rider/RiderRouteMessages'))
const CustomerDashboard = lazy(() => import('./pages/customer/CustomerDashboard'))
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
        <Route path={ROUTES.businessDeliveries} element={<DashboardLayout />}>
          <Route index element={<Deliveries />} />
        </Route>
        <Route path={ROUTES.businessDeliveryDetails} element={<DashboardLayout />}>
          <Route index element={<DeliveryDetails />} />
        </Route>
        <Route path={ROUTES.businessCreateDelivery} element={<DashboardLayout />}>
          <Route index element={<CreateDelivery />} />
        </Route>
        <Route path={ROUTES.businessDispatch} element={<DashboardLayout />}>
          <Route index element={<Dispatch />} />
        </Route>
        <Route path={ROUTES.businessDrivers} element={<DashboardLayout />}>
          <Route index element={<Drivers />} />
        </Route>
        <Route path={ROUTES.businessCommunications} element={<DashboardLayout />}>
          <Route index element={<Communications />} />
        </Route>
        <Route path={ROUTES.riderDashboard} element={<RiderDashboard />} />
        <Route path={ROUTES.riderRouteMessages} element={<RiderRouteMessages />} />
        <Route path={ROUTES.customerDashboard} element={<CustomerDashboard />} />
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
