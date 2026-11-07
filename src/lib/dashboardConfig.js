// Status vocabulary lives in lib/statuses.js; re-exported here so existing
// `import { STATUS_META } from '../../lib/dashboardConfig'` call sites keep working.
import { ORDER_STATUS_META } from './statuses'

/** Dashboard-local extension: unsaved drafts still show as a Draft badge. */
export const STATUS_META = {
  draft: { label: 'Draft', tone: 'neutral' },
  ...ORDER_STATUS_META,
}
