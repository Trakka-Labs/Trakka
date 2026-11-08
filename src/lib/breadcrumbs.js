import { ROUTES } from './routes'

/**
 * Client mirror of the server breadcrumb map (`GET /navigation/breadcrumbs`).
 * Used for instant first paint and as the offline fallback when the navigation
 * endpoint is unavailable. Dynamic segments stay generic here — the server
 * resolves real labels (e.g. a tracking id) when it responds.
 */
const STATIC_TRAILS = {
  [ROUTES.businessDashboard]: [{ label: 'Dashboard' }],
  [ROUTES.businessDeliveries]: [
    { label: 'Dashboard', href: ROUTES.businessDashboard },
    { label: 'Deliveries' },
  ],
  [ROUTES.businessCreateDelivery]: [
    { label: 'Dashboard', href: ROUTES.businessDashboard },
    { label: 'Deliveries', href: ROUTES.businessDeliveries },
    { label: 'New delivery' },
  ],
  [ROUTES.businessDispatch]: [
    { label: 'Dashboard', href: ROUTES.businessDashboard },
    { label: 'Dispatch' },
  ],
  [ROUTES.businessRoutes]: [
    { label: 'Dashboard', href: ROUTES.businessDashboard },
    { label: 'Routes' },
  ],
  [ROUTES.businessDeliveryFlow]: [
    { label: 'Dashboard', href: ROUTES.businessDashboard },
    { label: 'Delivery flow' },
  ],
  [ROUTES.businessActivity]: [
    { label: 'Dashboard', href: ROUTES.businessDashboard },
    { label: 'Activity' },
  ],
  [ROUTES.businessDrivers]: [
    { label: 'Dashboard', href: ROUTES.businessDashboard },
    { label: 'Drivers' },
  ],
  [ROUTES.businessCommunications]: [
    { label: 'Dashboard', href: ROUTES.businessDashboard },
    { label: 'Communications' },
  ],
  [ROUTES.businessAnalytics]: [
    { label: 'Dashboard', href: ROUTES.businessDashboard },
    { label: 'Analytics' },
  ],
  [ROUTES.companySetup]: [
    { label: 'Dashboard', href: ROUTES.businessDashboard },
    { label: 'Company setup' },
  ],
  [ROUTES.riderDashboard]: [{ label: 'Rider dashboard' }],
}

export function clientBreadcrumbs(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (STATIC_TRAILS[path]) return STATIC_TRAILS[path]

  if (path.startsWith('/business/routes/')) {
    return [
      { label: 'Dashboard', href: ROUTES.businessDashboard },
      { label: 'Routes', href: ROUTES.businessRoutes },
      { label: 'Route monitor' },
    ]
  }
  if (path.startsWith('/business/deliveries/')) {
    return [
      { label: 'Dashboard', href: ROUTES.businessDashboard },
      { label: 'Deliveries', href: ROUTES.businessDeliveries },
      { label: 'Delivery' },
    ]
  }
  if (path.startsWith('/rider/routes/')) {
    return [
      { label: 'Rider dashboard', href: ROUTES.riderDashboard },
      { label: 'Route workspace' },
    ]
  }
  return []
}
