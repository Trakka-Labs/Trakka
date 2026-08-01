# Trakka MVP — Remaining Frontend Implementations

This document lists the frontend work still required by the Phase 1 PRD. Implement the sections in the numbered order below because each stage depends on the routes, data contracts, or state introduced by earlier stages.

## 1. Establish the frontend application foundation

- Define typed request and response models for businesses, public order links, orders, zones, batches, riders, routes, tracking sessions, location updates, and delivery statuses.
- Add a shared API client with authentication headers, consistent error handling, request cancellation, timeouts, and retry rules for safe read operations.
- Replace mock session assumptions with an authenticated-session bootstrap against the backend.
- Add route guards for business-owner and rider-only screens.
- Add standard loading, empty, offline, expired-link, forbidden, and server-error states.
- Create an environment configuration layer for the API base URL, map provider, WebSocket endpoint, and WhatsApp integration settings.

**Completion check:** The frontend can authenticate against a real API, recover an existing session, protect role-specific routes, and render consistent API error states.

## 2. Connect business onboarding to the backend

- Replace `mockAuthApi` and `mockPaymentApi` usage with real authentication, password recovery, company setup, logo upload, and payment-account endpoints.
- Persist company name, logo, contact details, operating area, pricing floor, and payment-account details.
- Restore an incomplete onboarding session at the correct step.
- Redirect a fully onboarded business owner to the dashboard.

**Completion check:** A new business owner can register, verify their account, complete onboarding, sign out, and sign back in without losing data.

## 3. Build reusable customer order-link management

- Add a dashboard screen for creating, viewing, copying, sharing, disabling, and regenerating secure reusable order-intake links.
- Display the link status, creation date, last submission time, and number of orders received.
- Add a WhatsApp share action with a prefilled message containing the order link.
- Clearly distinguish an active link from a disabled or expired link.

**Completion check:** A business owner can generate an active intake link and share it through WhatsApp from the dashboard.

## 4. Build the public customer order-intake flow

- Add a public route that does not require an account or login.
- Load and display the fleet owner's business name, logo, and support contact from the secure link.
- Collect all PRD-required information:
  - Pickup address and neighborhood.
  - Drop-off address and neighborhood.
  - Package description.
  - Recipient name.
  - Recipient phone number.
  - Item photograph.
- Provide clear field labels, mobile-friendly controls, inline errors, and a submission summary.
- Prevent submission while any core location or recipient-contact field is blank or invalid.
- Handle invalid, disabled, or expired intake links.
- Show an unambiguous success receipt after submission without exposing private dashboard data.

**Completion check:** A customer can open the link in a mobile browser, submit a valid order without creating an account, and cannot submit an incomplete order.

## 5. Add mobile camera capture and image compression

- Use a file input configured for direct rear-camera capture where supported.
- Validate image type, file size, dimensions, and corrupted files.
- Correct image orientation before preview or upload.
- Compress and resize the photo in the browser before upload.
- Show the compressed preview, upload progress, retry action, and remove/replace controls.
- Preserve form fields if the upload fails or the browser temporarily goes offline.

**Completion check:** A customer can capture a photo from a supported mobile browser, and the uploaded payload is measurably smaller than the original while remaining legible.

## 6. Replace the mock business dashboard with live orders

- Replace all data from `mockDashboardData` with backend queries.
- Show incoming, unassigned, batched, active, delayed, completed, and failed orders.
- Add order detail views containing addresses, zones, package photo, recipient contact, timestamps, rider assignment, and tracking state.
- Add live dashboard updates when a public intake form creates a new order.
- Add pagination or incremental loading for longer order lists.
- Keep the existing responsive table/card behavior for desktop and mobile layouts.

**Completion check:** A submitted customer order appears on the correct business dashboard without a manual refresh.

## 7. Build zone filtering and order selection

- Add Benin City neighborhood and zone filters for unassigned orders.
- Allow operators to combine status, neighborhood, zone, and date filters.
- Add single-select, multi-select, select-all-visible, and clear-selection controls.
- Prevent orders from different businesses or invalid statuses from being selected together.
- Display selected-order count and a clear action to start a batch.

**Completion check:** An operator can isolate unassigned orders for a specific neighborhood or zone and select the orders to batch.

## 8. Build the route-batch editor

- Display the backend-proposed sequence for selected orders.
- Show pickup/drop-off summaries, zone information, approximate distance, and sequence number for each task.
- Support accessible drag-and-drop reordering.
- Provide keyboard and button-based move-up/move-down alternatives.
- Persist manual ordering changes before dispatch.
- Warn about removed, cancelled, already assigned, or conflicting orders.
- Require rider selection and final confirmation before dispatch.

**Completion check:** An operator can review and manually reorder a batch, and the saved sequence exactly matches the displayed order.

## 9. Build rider authentication and route queue

- Register and implement the existing driver signup and login routes.
- Add rider-only navigation and session handling.
- Display pending assignments, accepted routes, active routes, and completed routes.
- Show each assigned batch as one route run with tasks in the exact owner-defined sequence.
- Allow a rider to accept or reject an assignment with a reason.
- Optimize the interface for low-end phones by limiting animation, map work, large images, and unnecessary background requests.

**Completion check:** A rider can sign in on a mobile browser and see the dispatched tasks in the exact sequence set by the fleet owner.

## 10. Build the rider active-route workflow

- Add actions for starting the route, arriving at pickup, confirming pickup, starting delivery, reporting a delay, arriving at drop-off, and completing delivery.
- Request location permission only when needed and explain why it is required.
- Publish foreground location updates while a route is active.
- Show connection and location-permission status without blocking access to task details.
- Allow the rider to select or enter a road-delay reason and estimated delay.
- Require delivery verification before marking a task complete.
- Advance to the next task without changing the owner-defined order.

**Completion check:** Rider status, location, and delay updates reach the backend throughout an active route, and tasks remain in their dispatched sequence.

## 11. Build the public customer tracking page

- Add a secure public tracking route that requires no customer account.
- Display business branding, rider identity, delivery status, and relative ETA.
- Render the rider's latest valid position on a responsive map.
- Subscribe to live location and status updates without requiring a page refresh.
- Recalculate the displayed ETA when the backend reports a rider delay.
- Show stale-location, temporarily offline, cancelled, completed, and expired states.
- Remove live location access and show an inactive state after delivery verification completes.

**Completion check:** A customer can follow a moving rider and updated ETA in real time, and the same link stops exposing live tracking after delivery completion.

## 12. Complete WhatsApp-facing frontend actions

- Add WhatsApp share controls for order-intake links and permitted tracking links.
- Use backend-generated message templates and links rather than assembling security-sensitive tokens in the browser.
- Provide a copy-link fallback when WhatsApp cannot be opened.
- Display delivery state for messages where the backend makes that information available.

**Completion check:** Business owners can initiate the required WhatsApp share flows, while secure tokens remain backend-controlled.

## 13. Restore progressive web app delivery

- Add a valid web app manifest with final Trakka branding, icons, start URL, display mode, theme colors, and scope.
- Register a maintained service worker without reintroducing vulnerable dependencies.
- Cache only safe static assets and an offline shell; do not cache sensitive API responses or live tracking data.
- Provide offline and reconnection states for business and rider screens.
- Verify installability on supported Android browsers and acceptable browser behavior on iOS.

**Completion check:** Browser PWA audits recognize the app as installable, and sensitive operational data is not exposed through unsafe caching.

## 14. Performance, accessibility, and mobile-browser hardening

- Ensure the public intake form reaches usable state in under three seconds on the agreed standard mobile-network profile.
- Lazy-load maps and other heavy modules only on routes that need them.
- Minimize rider-route JavaScript, animation, image memory, and network usage.
- Test the public order and tracking flows at common small-screen widths.
- Support keyboard navigation, visible focus, accessible names, error announcements, and reduced motion.
- Test camera capture, geolocation, maps, and reconnection behavior on major Android and iOS browsers.

**Completion check:** Performance measurements satisfy the PRD threshold, required flows have no critical accessibility violations, and layouts do not distort on supported mobile browsers.

## 15. Add frontend automated tests

- Add unit tests for validation, image compression, status transitions, ETA presentation, and API error mapping.
- Add component tests for order intake, zone filters, batch reordering, rider queue, and expired links.
- Add end-to-end tests covering:
  1. Owner creates and shares an intake link.
  2. Customer submits a complete order.
  3. Order appears on the dashboard.
  4. Owner filters, batches, reorders, and dispatches it.
  5. Rider receives and executes the ordered route.
  6. Customer receives live tracking updates.
  7. Tracking deactivates after verified completion.
- Add mobile viewport and slow-network coverage for the customer intake and tracking flows.

**Completion check:** The complete MVP journey passes automatically in CI across desktop and representative mobile viewports.
