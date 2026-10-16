import { useSyncExternalStore } from 'react'

// The shop lives under `#tienda/...` so it shares the hash with the slides.
const subscribe = (fn: () => void) => {
  window.addEventListener('hashchange', fn)
  return () => window.removeEventListener('hashchange', fn)
}

export function useHashPath() {
  return useSyncExternalStore(subscribe, () => decodeURIComponent(location.hash.slice(1)))
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
