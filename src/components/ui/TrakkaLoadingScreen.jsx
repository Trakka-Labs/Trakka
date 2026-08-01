import Logo from './Logo'

export default function TrakkaLoadingScreen({ message = 'Preparing your workspace', className = '' }) {
  return (
    <div className={`trakka-loader ${className}`} role="status" aria-live="polite">
      <div className="trakka-loader__content">
        <div className="trakka-loader__brand">
          <span className="trakka-loader__mark">
            <Logo size={36} />
          </span>
          <span className="trakka-loader__wordmark">Trakka</span>
        </div>

        <div className="trakka-loader__route" aria-hidden="true">
          <span className="trakka-loader__origin" />
          <span className="trakka-loader__line">
            <span className="trakka-loader__rider" />
          </span>
          <span className="trakka-loader__destination" />
        </div>

        <p className="trakka-loader__message">{message}</p>
      </div>
      <span className="sr-only">{message}</span>
    </div>
  )
}
