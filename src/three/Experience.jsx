import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import gsap from 'gsap'
import * as THREE from 'three'
import City from './City'
import Traffic from './Traffic'
import HoloAvatar from './HoloAvatar'
import AmbientParticles from './AmbientParticles'
import ProjectCards3D from './ProjectCards3D'
import CameraRig from './CameraRig'
import PostFX from './PostFX'
import { FOCUS_ANGLE, HOME, focusBaseAngle, orbitPosition } from './layout'

// Plano detalle frontal de la tarjeta estacionada en FOCUS_ANGLE (desktop) o del avatar (mobile).
function focusFor(selectedIndex, isMobile) {
  if (selectedIndex < 0) return null
  if (isMobile) return { position: [0, 2.6, 7.4], target: [0, 1.0, 0], fov: 50 }
  const card = orbitPosition(FOCUS_ANGLE)
  // Desplaza el encuadre para que la tarjeta quede a la izquierda y el panel a la derecha.
  const target = card.clone().add(new THREE.Vector3(1.55, 0, 0))
  const position = target.clone().add(new THREE.Vector3(0, 0.15, 4.6))
  return { position: position.toArray(), target: target.toArray(), fov: HOME.desktop.fov }
}

export default function Experience({ projects, isMobile, hovered, selected, onHover, onOpen, reducedMotion }) {
  const selectedIndex = projects.findIndex((p) => p.id === selected)
  const focus = useMemo(() => focusFor(selectedIndex, isMobile), [selectedIndex, isMobile])

  // Estado orbital compartido (mutable, fuera de React): ángulo base y factor de velocidad.
  const orbit = useMemo(() => ({ angle: 0, speed: 1, locked: false }), [])
  const cardPositions = useMemo(() => ({}), [])
  const lookAt = hovered && !isMobile ? (cardPositions[hovered] ?? null) : null

  // Click: detiene la órbita y la gira con GSAP hasta dejar la tarjeta en FOCUS_ANGLE,
  // en paralelo al vuelo de cámara. Al cerrar, se libera y la velocidad vuelve a 1 suavemente.
  useEffect(() => {
    if (selectedIndex < 0 || isMobile) {
      orbit.locked = false
      return
    }
    orbit.locked = true
    orbit.speed = 0
    const tween = gsap.to(orbit, {
      angle: focusBaseAngle(selectedIndex, projects.length, orbit.angle),
      duration: reducedMotion ? 0.01 : 1.6,
      ease: 'power3.inOut',
    })
    return () => tween.kill()
  }, [selectedIndex, isMobile, orbit, projects.length, reducedMotion])
  // Contenedor DOM estable para las tarjetas <Html>: evita que drei re-monte sus raíces.
  const cardLayer = useRef()

  return (
    <>
    <Canvas
      dpr={[1, isMobile ? 1.5 : 1.75]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 9, 38], fov: 55, near: 0.1, far: 400 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
      }}
    >
      <color attach="background" args={['#040811']} />
      <fog attach="fog" args={['#050b16', 30, 150]} />
      <ambientLight intensity={0.25} color="#5fa8ff" />
      <directionalLight position={[-10, 20, 10]} intensity={0.6} color="#8fc8ff" />
      <Stars radius={180} depth={60} count={isMobile ? 1500 : 3500} factor={4} saturation={0} fade speed={0.4} />

      <Suspense fallback={null}>
        <City isMobile={isMobile} />
        <Traffic isMobile={isMobile} />
        <Suspense fallback={null}>
          <HoloAvatar
            lookAt={lookAt}
            active={Boolean(hovered || selected)}
            isMobile={isMobile}
            position={isMobile ? [0, -3.7, 0] : [0, -3.75, 0]}
            scale={isMobile ? 6.4 : 6.6}
          />
        </Suspense>
        <AmbientParticles count={isMobile ? 400 : 900} />
        {!isMobile && (
          <ProjectCards3D
            projects={projects}
            orbit={orbit}
            positions={cardPositions}
            hovered={hovered}
            focusedId={selected}
            onHover={onHover}
            onOpen={onOpen}
            portal={cardLayer}
          />
        )}
      </Suspense>

      <CameraRig isMobile={isMobile} focus={focus} reducedMotion={reducedMotion} />
      <PostFX strength={isMobile ? 0.8 : 0.9} />
    </Canvas>
    <div ref={cardLayer} className="pointer-events-none absolute inset-0 z-10 overflow-hidden" />
    </>
  )
}
