# Trakka Live Operations Implementation Progress

This document tracks the staged implementation of business-to-rider communication, live rider location, route-deviation detection, and operational notifications. Complete the remaining phases in order because each phase depends on identity, route state, or location data introduced earlier.

## Current status

### Phase 1 — Route-specific business and rider messaging: COMPLETE

Implemented:

- Added a business **Communications** tab at `/business/communications`.
- Lists persisted dispatched route runs and their assigned riders.
- Stores messages against a business, route run, sender, and idempotent client message ID.
- Supports business-to-rider and rider-to-business replies.
- Added rider quick replies for traffic, road blockage, wrong addresses, and assistance requests.
- Added expiring, revocable, route-scoped rider access links for the current pre-authentication rider prototype.
- Enforces business isolation on every owner conversation request.
- Limits rider links to one assigned route and validates the token on every rider request.
- Supports SQLite locally and PostgreSQL in production through repository adapters.
- Uses four-second polling so messages appear without a manual refresh.

Important current limitation:

- Polling is an interim transport. Authenticated WebSocket delivery, connection presence, message delivery receipts, and missed-event recovery are part of Phase 4.
- Route access links are a safe local bridge until complete rider accounts and sessions replace them in Phase 2.

Completion check:

- A business owner can open a dispatched route conversation, generate a rider link, exchange persisted messages in both directions, reload both pages without losing history, and cannot access another business's route.

## Remaining implementation

### Phase 2 — Rider identity, authentication, and active-route lifecycle: NOT STARTED

- Connect each rider record to a user identity.
- Implement rider signup/invitation, login, session refresh, logout, and revocation.
- Replace route access links with authenticated rider authorization.
- Add pending, accepted, rejected, active, completed, and cancelled route views.
- Require the rider to accept an assignment before starting its route.
- Record route and task transitions with actor, device, timestamp, and idempotency keys.
- Keep the owner-approved stop sequence authoritative.

Completion check:

- An authenticated rider can see only their own assignments, accept one, start it, and continue using the same route conversation without a scoped URL token.

### Phase 3 — Foreground GPS ingestion and business live map: NOT STARTED

- Request rider location permission only when an accepted route starts.
- Publish moving locations every 10–15 seconds and stationary locations every 30–60 seconds.
- Buffer a small number of unsent events and retry with original event IDs.
- Validate coordinates, timestamp freshness, accuracy, route ownership, speed, and impossible jumps.
- Persist accepted points to `rider_locations` and update `latest_rider_locations`.
- Add Redis as the latest-position and fan-out projection.
- Add a business live map showing rider position, route, remaining stops, freshness, and connection state.
- Stop collection when the route completes, is cancelled, expires, or the rider logs out.

Completion check:

- A rider on an active route appears on the correct business map with an honest fresh, stale, permission-denied, or offline state.

### Phase 4 — Authenticated real-time transport: NOT STARTED

- Add a NestJS Socket.IO gateway with polling fallback.
- Authorize business, rider, route, and public rooms server-side.
- Publish message, location, route status, delay, ETA, and assignment events.
- Add heartbeat, reconnection, event sequence numbers, and missed-event recovery.
- Replace four-second message polling with socket events while retaining read polling as fallback.
- Add message delivered/read state and rider/business connection presence.
- Prevent private rider, customer, and business data from crossing tenant rooms.

Completion check:

- Connected clients receive ordered updates without refresh and recover events missed during a temporary disconnection.

### Phase 5 — Approved route geometry and automatic deviation detection: NOT STARTED

- Geocode pickup and drop-off addresses and store validated coordinates.
- Request the approved route polyline from Google Maps Routes API or the selected map provider.
- Store route geometry and a configurable PostGIS corridor.
- Compare accepted rider points with the approved corridor asynchronously.
- Require repeated qualifying points or sustained deviation to suppress GPS spikes.
- Create only one active deviation event per route until acknowledged or resolved.
- Resolve an event automatically when the rider returns to the route.
- Allow the rider to report traffic, road closure, checkpoint, incorrect address, or another reason.

Completion check:

- Sustained off-route movement creates one traceable alert for the correct business and route, while isolated inaccurate GPS samples do not.

### Phase 6 — Business alerts and guidance workflow: NOT STARTED

- Add route-deviation, stale-location, assistance, delay, and reconnecting notifications to Live Operations.
- Add acknowledge, assign-to-operator, resolve, call-rider, open-conversation, and open-route actions.
- Link every alert directly to its route conversation.
- Record acknowledgement, owner guidance, resolution reason, actors, and timestamps.
- Add dashboard unread counts and notification preference controls.

Completion check:

- A deviation or rider-assistance event alerts the correct owner, opens the correct route conversation, and can be acknowledged and resolved with a complete audit history.

### Phase 7 — Offline and external notification fallback: NOT STARTED

- Add Web Push for installed rider and owner PWAs where supported.
- Add WhatsApp fallback for critical assignment, assistance, and route-deviation alerts.
- Queue external sends durably with deterministic idempotency keys and retries.
- Store provider message IDs, attempts, delivery states, and failures.
- Avoid including precise coordinates, customer data, or reusable credentials in notification bodies.

Completion check:

- A critical operational alert reaches an offline recipient through an authorized fallback and is not duplicated by retries.

### Phase 8 — Hardening, privacy, and pilot validation: NOT STARTED

- Add authorization tests covering cross-business routes, forged rider tokens, expired sessions, and completed routes.
- Add concurrency and idempotency tests for duplicated messages and location events.
- Add mobile tests for geolocation permission, app suspension, reconnection, and weak networks.
- Tune location frequency, stale thresholds, route corridor width, and sustained-deviation duration with pilot data.
- Apply location and message retention rules and expose required consent/privacy notices.
- Add metrics for socket health, message latency, location freshness, rejected points, and false deviation alerts.
- Verify that location stops immediately after route completion or cancellation.

Completion check:

- The pilot meets agreed reliability, privacy, battery, data-usage, message-latency, and false-alert thresholds on supported rider devices.

## Recommended next task

Implement **Phase 2 — Rider identity, authentication, and active-route lifecycle** before adding GPS. Reliable location and route messaging must be authorized against a real rider session and an active assignment.
