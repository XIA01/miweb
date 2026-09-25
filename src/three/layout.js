import * as THREE from 'three'

// Tamaño de tarjeta en píxeles CSS y factor de drei <Html transform>:
// 400px CSS == DISTANCE_FACTOR unidades de mundo.
export const CARD_PX = { w: 250, h: 214 }
export const DISTANCE_FACTOR = 3.2

// Cámara panorámica (home) según el viewport.
export const HOME = {
  desktop: { position: [0, 1.7, 13.2], target: [0, 1.15, 0], fov: 42 },
  mobile: { position: [0, 1.2, 17], target: [0, -0.6, 0], fov: 54 },
}

/**
 * Anillo orbital alrededor de la entidad (eje Y).
 * Elipse rx/rz y leve inclinación: las tarjetas de adelante pasan más abajo que las de atrás,
 * así las traseras asoman por encima de los hombros en lugar de taparse con el avatar.
 */
export const ORBIT = {
  center: new THREE.Vector3(0, 0.95, 0),
  rx: 6.2,
  rz: 3.6,
  tilt: 2.4,
  speed: 0.14, // rad/s
}

// Ángulo donde se "estaciona" la tarjeta seleccionada (adelante a la izquierda: el panel va a la derecha).
export const FOCUS_ANGLE = -0.62

export const cardAngle = (index, count, base) => base + (index / count) * Math.PI * 2

/** Posición sobre la órbita: θ = 0 es el frente (hacia la cámara). */
export function orbitPosition(angle, out = new THREE.Vector3()) {
  const c = Math.cos(angle)
  return out.set(
    ORBIT.center.x + Math.sin(angle) * ORBIT.rx,
    ORBIT.center.y - c * ORBIT.tilt,
    ORBIT.center.z + c * ORBIT.rz,
  )
}

/** Ángulo base de la órbita que lleva la tarjeta `index` a FOCUS_ANGLE por el camino más corto. */
export function focusBaseAngle(index, count, current) {
  const target = FOCUS_ANGLE - (index / count) * Math.PI * 2
  const turns = Math.round((current - target) / (Math.PI * 2))
  return target + turns * Math.PI * 2
}
