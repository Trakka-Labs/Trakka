import Badge from './Badge'

export default function SectionHeading({ eyebrow, title, description, align = 'left', tone = 'emerald' }) {
  return (
    <div className={`max-w-2xl ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      {eyebrow && (
        <Badge tone={tone} className="mb-4">
          {eyebrow}
        </Badge>
      )}
      <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-[var(--color-paper)] leading-[1.1]">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base sm:text-lg text-[var(--color-paper-dim)] leading-relaxed">
          {description}
        </p>
      )}
    </div>
  )
}
