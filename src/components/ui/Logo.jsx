export default function Logo({ className = '', size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Trakka logo"
    >
      <defs>
        <linearGradient id="trakka-grad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2AA37A" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
      </defs>

      {/* Route path forming a stylized T / pin shape */}
      <path
        d="M6 12C6 8.68629 8.68629 6 12 6H28C31.3137 6 34 8.68629 34 12V22C34 25.3137 31.3137 28 28 28H21L15 35V28H12C8.68629 28 6 25.3137 6 22V12Z"
        fill="url(#trakka-grad)"
        fillOpacity="0.12"
        stroke="url(#trakka-grad)"
        strokeWidth="1.5"
      />

      {/* Dotted route line */}
      <path
        d="M11 17.5H29"
        stroke="url(#trakka-grad)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeDasharray="1 4.5"
      />

      {/* Static pin */}
      <circle cx="11" cy="17.5" r="2.25" fill="#F3F1EA" />

      {/* Moving dot with pulse animation */}
      <circle cx="29" cy="17.5" r="2.75" fill="#FF6B35">
        <animate attributeName="cx" values="11;29;11" dur="4.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="29" cy="17.5" r="5" fill="#FF6B35" fillOpacity="0.25">
        <animate attributeName="cx" values="11;29;11" dur="4.5s" repeatCount="indefinite" />
        <animate attributeName="r" values="3;6;3" dur="1.6s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}
