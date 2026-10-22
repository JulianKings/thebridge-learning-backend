import { useState } from 'react'
import { Garment } from '../components/Garment'
import type { GarmentKind } from '../data/mock'
import type { Tipo } from './types'

const KIND: Partial<Record<Tipo, GarmentKind>> = {
  camiseta: 'tee', polo: 'tee', 'ropa deportiva': 'tee', 'ropa interior': 'tee',
  camisa: 'shirt', pijama: 'shirt',
  sudadera: 'knit', jersey: 'knit', chándal: 'knit',
  chaqueta: 'coat', abrigo: 'coat', chaleco: 'coat',
  blazer: 'blazer', traje: 'blazer',
  pantalón: 'trousers', vaqueros: 'trousers', 'pantalón corto': 'trousers', bermudas: 'trousers', leggings: 'trousers', mallas_deportivas: 'trousers',
  falda: 'skirt',
  vestido: 'dress', mono: 'dress', bañador: 'dress', bikini: 'dress',
  zapatillas: 'shoe', zapatos: 'shoe', botas: 'shoe', sandalias: 'shoe', chanclas: 'shoe',
  gorra: 'hat', sombrero: 'hat',
}

const TONES: [string, string][] = [
  ['#d9cfc1', '#6b5a45'],
  ['#e6e8ea', '#5c6670'],
  ['#2f2f2d', '#8c8a84'],
  ['#c9c4b8', '#5f5a50'],
  ['#b6533b', '#f1d9cf'],
  ['#e9dcc9', '#9b8466'],
  ['#1f2a36', '#7d8a99'],
  ['#dfe3d6', '#6c7560'],
]

const toneFor = (seed: string) => TONES[[...seed].reduce((h, c) => h + c.charCodeAt(0), 0) % TONES.length]

// The line drawing is always there; `foto` fades in over it only once it has loaded, so an
// empty, slow or broken URL never leaves a blank box.
export function ProductoImage({ tipo, foto, seed, className = '' }: { tipo: Tipo; foto?: string; seed: string; className?: string }) {
  const [loaded, setLoaded] = useState<string | null>(null)
  const [tone, ink] = toneFor(seed)
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0">
        <Garment kind={KIND[tipo] ?? 'accessory'} tone={tone} ink={ink} className="h-full w-full" />
      </div>
      {foto && (
        <img
          key={foto}
          src={foto}
          alt=""
          loading="lazy"
          onLoad={() => setLoaded(foto)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${loaded === foto ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  )
}
