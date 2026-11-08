export const ROUTES = {
  home: '/',
  getStarted: '/get-started',
  businessSignup: '/business/signup',
  businessLogin: '/business/login',
  businessForgotPassword: '/business/forgot-password',
  businessVerifyOtp: '/business/verify-otp',
  businessResetPassword: '/business/reset-password',
  companySetup: '/business/company-setup',
  businessDashboard: '/business/dashboard',
  businessDeliveries: '/business/deliveries',
  businessDeliveryDetails: '/business/deliveries/:deliveryId',
  businessCreateDelivery: '/business/deliveries/new',
  businessDispatch: '/business/dispatch',
  businessRoutes: '/business/routes',
  businessRouteDetails: '/business/routes/:routeRunId',
  businessDeliveryFlow: '/business/delivery-flow',
  businessActivity: '/business/activity',
  businessDrivers: '/business/drivers',
  businessCommunications: '/business/communications',
  businessAnalytics: '/business/analytics',
  riderDashboard: '/rider/dashboard',
  riderRouteMessages: '/rider/routes/:routeRunId/messages',
  customerDashboard: '/customer/dashboard',
  customerOrderIntake: '/order/:token',
  customerTracking: '/track/:token',
  customerVerify: '/verify/:token',
  driverSignup: '/driver/signup',
  driverLogin: '/driver/login',
}

export function businessDeliveryDetailsRoute(deliveryId) {
  return ROUTES.businessDeliveryDetails.replace(':deliveryId', encodeURIComponent(deliveryId))
}

export function businessRouteRoute(routeRunId) {
  return ROUTES.businessRouteDetails.replace(
    ':routeRunId',
    encodeURIComponent(routeRunId),
  )
}

export function riderRouteMessagesRoute(routeRunId) {
  return ROUTES.riderRouteMessages.replace(':routeRunId', encodeURIComponent(routeRunId))
}
