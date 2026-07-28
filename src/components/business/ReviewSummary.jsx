import { Building2, CreditCard, Pencil, Wallet } from 'lucide-react'
import Badge from '../ui/Badge'

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <span className="text-[var(--color-paper-faint)]">{label}</span>
      <span className="text-right text-[var(--color-paper)]">{value || '—'}</span>
    </div>
  )
}

function EditButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-mint)] hover:underline"
    >
      <Pencil size={12} /> Edit
    </button>
  )
}

export default function ReviewSummary({ companyInfo, paymentAccount, priceFloor, onEditStep }) {
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-[var(--color-border-subtle)] bg-white/[0.02] p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building2 size={17} className="text-[var(--color-mint)]" aria-hidden="true" />
            <h3 className="font-display text-base font-semibold text-[var(--color-paper)]">Company information</h3>
          </div>
          <EditButton onClick={() => onEditStep(1)} />
        </div>
        <div className="mt-3 divide-y divide-[var(--color-border-subtle)]">
          <Row label="Company name" value={companyInfo?.companyName} />
          <Row label="Phone" value={companyInfo?.phone} />
          <Row label="Email" value={companyInfo?.email} />
          <Row label="Address" value={companyInfo?.address} />
          <Row label="City" value={companyInfo?.city} />
          <Row label="State" value={companyInfo?.state} />
          <Row label="Country" value={companyInfo?.country} />
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border-subtle)] bg-white/[0.02] p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CreditCard size={17} className="text-[var(--color-route-cyan)]" aria-hidden="true" />
            <h3 className="font-display text-base font-semibold text-[var(--color-paper)]">Payment account</h3>
          </div>
          <EditButton onClick={() => onEditStep(2)} />
        </div>
        <div className="mt-3 divide-y divide-[var(--color-border-subtle)]">
          {paymentAccount ? (
            <>
              <Row label="Bank" value={paymentAccount.bankName} />
              <Row label="Account number" value={paymentAccount.accountNumber} />
              <Row label="Account name" value={paymentAccount.accountHolderName} />
              <div className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-[var(--color-paper-faint)]">Verification status</span>
                <Badge tone="emerald">Verified</Badge>
              </div>
            </>
          ) : (
            <p className="py-2.5 text-sm text-[var(--color-paper-faint)]">Not connected yet.</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border-subtle)] bg-white/[0.02] p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Wallet size={17} className="text-[var(--color-dispatch-orange-bright)]" aria-hidden="true" />
            <h3 className="font-display text-base font-semibold text-[var(--color-paper)]">Price floor</h3>
          </div>
          <EditButton onClick={() => onEditStep(3)} />
        </div>
        <div className="mt-3 divide-y divide-[var(--color-border-subtle)]">
          <Row
            label="Minimum delivery price"
            value={
              typeof priceFloor === 'number'
                ? new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(
                    priceFloor
                  )
                : null
            }
          />
        </div>
      </section>
    </div>
  )
}
