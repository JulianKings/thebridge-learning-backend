import { BookOpen, ShoppingBag } from 'lucide-react'

// Floating tab on the left edge: from the shop back to the API progress, and
// (once everything is unlocked) from the progress view into the shop.
export function ViewSwitch({ to }: { to: 'progress' | 'shop' }) {
  const toShop = to === 'shop'
  const Icon = toShop ? ShoppingBag : BookOpen
  return (
    <a
      href={toShop ? '#tienda' : '#inicio'}
      className={`group fixed left-0 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-3 px-2.5 py-4 shadow-xl transition-[padding] hover:pl-4 ${
        toShop ? 'fx-gradient-bg rounded-r-2xl font-fx font-bold text-white shadow-[0_0_40px_-6px_#ec4899]' : 'bg-ink text-paper'
      }`}
      aria-label={toShop ? 'Ir a la tienda' : 'Ver el progreso de la API'}
      title={toShop ? 'Ir a la tienda' : 'Ver el progreso de la API'}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[10px] uppercase tracking-[0.25em] [writing-mode:vertical-rl] rotate-180">
        {toShop ? 'Tienda' : 'Progreso API'}
      </span>
    </a>
  )
}
