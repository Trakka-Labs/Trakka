import { useScrollReveal } from '../../hooks/useScrollReveal'

export default function Reveal({ children, delay = 0, className = '' }) {
  const [ref, isVisible] = useScrollReveal()

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.7s ease-out ${delay}ms, transform 0.7s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
