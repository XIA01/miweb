import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'
import { HOME } from './layout'

/**
 * Cámara cinemática controlada con GSAP.
 * - `base` y `look` son los objetos que GSAP interpola (posición y punto de mira).
 * - `rig.parallax` pondera el paralaje del puntero: 1 en la vista panorámica, 0 en plano detalle.
 */
export default function CameraRig({ isMobile, focus, reducedMotion }) {
  const camera = useThree((s) => s.camera)
  const base = useRef(new THREE.Vector3(0, 9, 38))
  const look = useRef(new THREE.Vector3(0, 3, 0))
  const rig = useRef({ parallax: 0, fov: 55 })
  const first = useRef(true)

  useEffect(() => {
    const home = isMobile ? HOME.mobile : HOME.desktop
    const dest = focus ?? home
    const duration = reducedMotion ? 0.01 : first.current ? 3.2 : 1.7
    const ease = first.current ? 'power2.out' : 'power3.inOut'
    first.current = false

    const tl = gsap.timeline({ defaults: { duration, ease } })
    tl.to(base.current, { x: dest.position[0], y: dest.position[1], z: dest.position[2] }, 0)
      .to(look.current, { x: dest.target[0], y: dest.target[1], z: dest.target[2] }, 0)
      .to(rig.current, { parallax: focus ? 0 : 1, fov: dest.fov ?? home.fov }, 0)
    return () => tl.kill()
  }, [focus, isMobile, reducedMotion])

  useFrame((state, delta) => {
    const r = rig.current
    const px = isMobile ? 0 : state.pointer.x
    const py = isMobile ? 0 : state.pointer.y
    const t = state.clock.elapsedTime
    camera.position.set(
      base.current.x + (px * 0.7 + Math.sin(t * 0.15) * 0.15) * r.parallax,
      base.current.y + (py * 0.35 + Math.sin(t * 0.21) * 0.08) * r.parallax,
      base.current.z,
    )
    camera.lookAt(look.current)
    if (Math.abs(camera.fov - r.fov) > 0.01) {
      camera.fov = THREE.MathUtils.damp(camera.fov, r.fov, 8, delta)
      camera.updateProjectionMatrix()
    }
    camera.updateMatrixWorld()
    // Prioridad -2: la cámara se resuelve antes que las tarjetas y que <Html>.
  }, -2)
  return null
}
