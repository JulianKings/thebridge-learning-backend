import { useMemo, useSyncExternalStore } from 'react'

// The shop lives under `#tienda/...` so it shares the hash with the slides.
// Filters ride along as a query string: `#tienda/c/arriba?talla=M&orden=precio`.
const subscribe = (fn: () => void) => {
  window.addEventListener('hashchange', fn)
  return () => window.removeEventListener('hashchange', fn)
}

const rawHash = () => location.hash.slice(1)

export function useHashPath() {
  return useSyncExternalStore(subscribe, () => decodeURIComponent(rawHash().split('?')[0]))
}

export function useShopQuery() {
  const qs = useSyncExternalStore(subscribe, () => rawHash().split('?')[1] ?? '')
  return useMemo(() => new URLSearchParams(qs), [qs])
}

// Replaces the history entry, so dragging a slider doesn't flood the back button.
export function setShopQuery(params: URLSearchParams) {
  const [path] = rawHash().split('?')
  const qs = params.toString()
  location.replace(`#${path}${qs ? `?${qs}` : ''}`)
}

export const isShopPath = (path: string) => path === 'tienda' || path.startsWith('tienda/')

export const shopHref = (path = '') => `#tienda${path ? `/${path}` : ''}`

export const navigate = (path = '') => {
  location.hash = shopHref(path)
}

export function useShopRoute() {
  const path = useHashPath()
  return isShopPath(path) ? path.split('/').slice(1).filter(Boolean) : []
}
