import { projects } from '../data/projects'

// Tamaño de tarjeta en píxeles CSS y factor de drei <Html transform>:
// 400px CSS == DISTANCE_FACTOR unidades de mundo.
export const CARD_PX = { w: 250, h: 214 }
export const FEATURED_PX = { w: 400, h: 232 }
export const DISTANCE_FACTOR = 3.2
export const pxToWorld = (px) => (px * DISTANCE_FACTOR) / 400

// Posiciones de las manos del avatar (espacio mundo) para las líneas de conexión.
export const HANDS = { left: [-3.85, 0.45, 0.75], right: [3.85, 0.45, 0.75] }

// Cámara panorámica (home) según el viewport.
export const HOME = {
  desktop: { position: [0, 1.7, 12.6], target: [0, 1.25, 0], fov: 42 },
  mobile: { position: [0, 1.2, 17], target: [0, -0.6, 0], fov: 54 },
}

/**
 * Distribuye las tarjetas simétricamente: la destacada abajo al centro y el resto
 * en dos arcos (izquierda / derecha) alrededor de las manos. Funciona con cualquier
 * cantidad de proyectos reales.
 */
export function computeCardLayout(list = projects) {
  const featured = list.find((p) => p.featured) ?? list[0]
  const others = list.filter((p) => p !== featured)
  const left = others.filter((_, i) => i % 2 === 0)
  const right = others.filter((_, i) => i % 2 === 1)
  const layout = {}

  const placeColumn = (items, side) => {
    const n = items.length
    items.forEach((p, i) => {
      // t en [-1, 1] de arriba hacia abajo
      const t = n === 1 ? 0 : (i / (n - 1)) * 2 - 1
      const spread = Math.min(1, n / 3)
      const y = 1.45 - t * 2.3 * spread
      // arco: las del medio se abren más hacia afuera
      const x = side * (5.75 + (1 - Math.abs(t)) * 0.45)
      const z = 0.4 + Math.abs(t) * 0.5
      layout[p.id] = {
        position: [x, y, z],
        rotation: [0, -side * 0.22, 0],
        side,
        size: CARD_PX,
      }
    })
  }
  placeColumn(left, -1)
  placeColumn(right, 1)
  layout[featured.id] = {
    position: [0, -1.35, 2.6],
    rotation: [-0.06, 0, 0],
    side: 0,
    size: FEATURED_PX,
    featured: true,
  }
  return layout
}
