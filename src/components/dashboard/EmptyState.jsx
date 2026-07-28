export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-[var(--color-border-subtle)] bg-white/[0.02] px-6 py-14 text-center">
      {Icon && (
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-[var(--color-paper-faint)]">
          <Icon size={20} aria-hidden="true" />
        </span>
      )}
      <p className="font-display text-sm font-semibold text-[var(--color-paper)]">{title}</p>
      {description && <p className="max-w-sm text-sm text-[var(--color-paper-faint)]">{description}</p>}
      {action}
    </div>
  )
}
