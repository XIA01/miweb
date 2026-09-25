import { useEffect, useState } from 'react'

export function useMediaQuery(query) {
  const get = () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false)
  const [matches, setMatches] = useState(get)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return matches
}

// Móvil = ancho reducido o retrato angosto (tablets en vertical incluidas).
export const useIsMobile = () => useMediaQuery('(max-width: 900px), (max-aspect-ratio: 4/5)')
export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')
