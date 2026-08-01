const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

async function request(path, options = {}) {
  const { headers = {}, ...requestOptions } = options
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    ...requestOptions,
  })

  const payload = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) {
    const message = payload?.error?.message
    if (response.status === 404 && path === '/auth/google/config') {
      throw new Error('Google authentication route is unavailable. Rebuild and restart the backend.')
    }
    if (response.status === 404 && path.startsWith('/communications/')) {
      throw new Error('Communications routes are unavailable. Restart the backend with "npm run dev:backend".')
    }
    throw new Error(
      Array.isArray(message) ? message.join(' ') : message || 'The backend could not complete this request.',
    )
  }
  return payload
}

const json = (body) => JSON.stringify(body)

export async function registerBusiness(values) {
  const { account } = await request('/auth/register', {
    method: 'POST',
    body: json(values),
  })
  return account
}

export async function loginBusiness(values) {
  const { account } = await request('/auth/login', {
    method: 'POST',
    body: json(values),
  })
  return account
}

export function getGoogleAuthenticationConfig() {
  return request('/auth/google/config')
}

export async function authenticateWithGoogle({ credential, intent }) {
  const { account } = await request('/auth/google', {
    method: 'POST',
    body: json({ credential, intent }),
  })
  return account
}

export async function getCurrentAccount() {
  const { account } = await request('/auth/me')
  return account
}

export async function logoutBusiness() {
  await request('/auth/logout', { method: 'POST', body: '{}' })
}

export async function requestPasswordReset({ email }) {
  return request('/auth/password/forgot', {
    method: 'POST',
    body: json({ email }),
  })
}

export async function verifyOtp({ email, code }) {
  return request('/auth/password/verify', {
    method: 'POST',
    body: json({ email, code }),
  })
}

export async function resetPassword({ email, password, resetToken }) {
  return request('/auth/password/reset', {
    method: 'POST',
    body: json({ email, password, resetToken }),
  })
}

export async function getBusinessProfile() {
  const { business } = await request('/businesses/current')
  return business
}

export async function completeCompanySetup(payload) {
  const { business } = await request('/businesses/current/onboarding', {
    method: 'PATCH',
    body: json(payload),
  })
  return business
}

export async function createDelivery(payload) {
  const { order } = await request('/orders', {
    method: 'POST',
    body: json(payload),
  })
  return order
}

export async function getDeliveries() {
  const { deliveries } = await request('/orders')
  return deliveries
}

export async function getDelivery(deliveryId) {
  const { delivery } = await request(`/orders/${encodeURIComponent(deliveryId)}`)
  return delivery
}

export function getDashboard() {
  return request('/dashboard')
}

export function getDispatchWorkspace() {
  return request('/dispatch')
}

export function getDrivers() {
  return request('/drivers')
}

export function createDriver(payload) {
  return request('/drivers', {
    method: 'POST',
    body: json(payload),
  })
}

export function updateDriverCapacity(driverId, capacity) {
  return request(`/drivers/${driverId}/capacity`, {
    method: 'PATCH',
    body: json({ capacity }),
  })
}

export function getCommunicationRoutes() {
  return request('/communications/routes')
}

export function getBusinessRouteMessages(routeRunId) {
  return request(`/communications/routes/${encodeURIComponent(routeRunId)}/messages`)
}

export function sendBusinessRouteMessage(routeRunId, body, clientMessageId) {
  return request(`/communications/routes/${encodeURIComponent(routeRunId)}/messages`, {
    method: 'POST',
    body: json({ body, clientMessageId }),
  })
}

export function createRiderRouteAccess(routeRunId) {
  return request(`/communications/routes/${encodeURIComponent(routeRunId)}/rider-access`, {
    method: 'POST',
    body: '{}',
  })
}

export function getRiderRouteMessages(routeRunId, token) {
  return request(`/rider/communications/routes/${encodeURIComponent(routeRunId)}/messages`, {
    headers: { 'x-rider-route-token': token },
  })
}

export function sendRiderRouteMessage(routeRunId, token, body, clientMessageId) {
  return request(`/rider/communications/routes/${encodeURIComponent(routeRunId)}/messages`, {
    method: 'POST',
    headers: { 'x-rider-route-token': token },
    body: json({ body, clientMessageId }),
  })
}

export function createDispatchBatches(orderIds) {
  return request('/dispatch/batches', {
    method: 'POST',
    body: json({ orderIds }),
  })
}

export function saveDispatchSequence(batchId, taskIds) {
  return request(`/dispatch/batches/${batchId}/sequence`, {
    method: 'PUT',
    body: json({ taskIds }),
  })
}

export function assignDispatchBatch(batchId, riderId) {
  return request(`/dispatch/batches/${batchId}/assign`, {
    method: 'POST',
    body: json({ riderId }),
  })
}

export function maskEmail(email) {
  const [user, domain] = email.split('@')
  if (!domain) return email
  return `${user.slice(0, 2)}${'*'.repeat(Math.max(user.length - 2, 2))}@${domain}`
}
