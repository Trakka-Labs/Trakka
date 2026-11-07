/**
 * Trakka logo mark: a green location pin whose letter-T crossbar ends in an
 * amber dot. Ported from the brand "Trakka Logo Mark" artwork (viewBox
 * 0 0 120 140). `size` is the rendered height; width follows the aspect ratio.
 */
export default function Logo({ className = '', size = 32 }) {
  const width = (size * 120) / 140

  return (
    <svg
      width={width}
      height={size}
      viewBox="0 0 120 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Trakka logo"
    >
      {/* Pin */}
      <path
        d="M60 0C27 0 0 27 0 60C0 95 40 125 60 140C80 125 120 95 120 60C120 27 93 0 60 0Z"
        fill="#12A05A"
      />
      {/* Letter T */}
      <path
        d="M36 44H84M60 44V92"
        stroke="#0E1A14"
        strokeWidth="15"
        strokeLinecap="round"
      />
      {/* Amber dot at the crossbar tip */}
      <circle cx="84" cy="44" r="11" fill="#F5A623" />
    </svg>
  )
}
