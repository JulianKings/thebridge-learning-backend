import { useEffect, useRef, useState } from 'react'
import { LEVELS } from '../levels/levels'

// Slide 0 is the overview; slide N is level N. The URL hash is the source of
// truth, so plain `href="#catalogo"` links and the back button just work.
export const SLIDE_KEYS = ['inicio', ...LEVELS.map((l) => l.key)]

const indexFromHash = () => Math.max(0, SLIDE_KEYS.indexOf(location.hash.slice(1)))

export function goToSlide(index: number) {
  const i = (index + SLIDE_KEYS.length) % SLIDE_KEYS.length
  location.hash = SLIDE_KEYS[i]
}

export function useSlide() {
  const [state, setState] = useState({ index: indexFromHash(), dir: 1 })
  const current = useRef(state.index)

  useEffect(() => {
    const onHash = () => {
      const next = indexFromHash()
      setState({ index: next, dir: next >= current.current ? 1 : -1 })
      current.current = next
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return state
}
