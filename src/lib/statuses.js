// Single source of truth for status vocabulary on the frontend. Pages import
// from here instead of re-declaring inline status arrays and label maps, so a
// backend rename only needs one edit to reach every screen.

/** Order lifecycle, in the order progress accrues. */
export const ORDER_STATUSES = [
  'ready_for_dispatch',
  'assigned',
  'accepted',
  'pickup_in_progress',
  'picked_up',
  'in_transit',
  'arriving',
  'delivered',
]

/** Statuses an order can end on and never leave. */
export const TERMINAL_ORDER_STATUSES = ['delivered', 'cancelled', 'failed', 'returned']

/** Label + tone per status. Tone keys map to Badge/CSS-var styling. */
export const ORDER_STATUS_META = {
  ready_for_dispatch: { label: 'Ready for dispatch', tone: 'neutral' },
  assigned: { label: 'Assigned', tone: 'cyan' },
  accepted: { label: 'Accepted', tone: 'cyan' },
  pickup_in_progress: { label: 'Pickup in progress', tone: 'orange' },
  picked_up: { label: 'Picked up', tone: 'cyan' },
  in_transit: { label: 'In transit', tone: 'cyan' },
  arriving: { label: 'Arriving', tone: 'orange' },
  delivered: { label: 'Delivered', tone: 'emerald' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
  failed: { label: 'Failed', tone: 'orange' },
  returned: { label: 'Returned', tone: 'neutral' },
}

/** Route task (per-stop) statuses used across rider screens. */
export const ROUTE_TASK_STATUSES = [
  'pending',
  'pickup_in_progress',
  'in_transit',
  'delivered',
  'completed',
  'failed',
  'skipped',
]

/** Batch/assignment lifecycle statuses (dispatch ↔ rider handoff). */
export const ASSIGNMENT_STATUSES = ['pending', 'assigned', 'accepted', 'rejected', 'declined']

/** Route-run lifecycle statuses. */
export const ROUTE_RUN_STATUSES = ['draft', 'dispatched', 'active', 'paused', 'completed', 'cancelled']

/** Workspace notification event types the UI renders. */
export const NOTIFICATION_TYPES = Object.freeze({
  assignmentAccepted: 'assignment_accepted',
  assignmentRejected: 'assignment_rejected',
  routeDelayReported: 'route_delay_reported',
  routeOffRoute: 'route_off_route',
  orderReadyForDispatch: 'order_ready_for_dispatch',
})

/** Ordered index of an order status; -1 when unknown or terminal-non-progress. */
export function orderStatusIndex(status) {
  return ORDER_STATUSES.indexOf(status)
}
