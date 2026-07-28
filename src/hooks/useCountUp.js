import { useEffect, useState } from 'react'

export function useCountUp(target, isActive, duration = 1200) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!isActive) return
    let start = null
    let frame

    const step = (timestamp) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(eased * target))
      if (progress < 1) frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [isActive, target, duration])

  return value
}
