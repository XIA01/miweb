import { Suspense, useMemo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'
import City from './City'
import Traffic from './Traffic'
import HoloAvatar from './HoloAvatar'
import AmbientParticles from './AmbientParticles'
import ProjectCards3D from './ProjectCards3D'
import CameraRig from './CameraRig'
import PostFX from './PostFX'
import { HOME, computeCardLayout } from './layout'

// Calcula el plano detalle de cámara frente a una tarjeta (desktop) o al avatar (mobile).
function focusFor(project, layout, isMobile) {
  if (!project) return null
  if (isMobile) return { position: [0, 2.35, 6.2], target: [0, 1.75, 0], fov: 50 }
  const slot = layout[project.id]
  const [x, y, z] = slot.position
  const ry = slot.rotation[1]
  const normal = new THREE.Vector3(Math.sin(ry), 0, Math.cos(ry))
  const right = new THREE.Vector3(Math.cos(ry), 0, -Math.sin(ry))
  // Desplaza el encuadre para que la tarjeta quede a la izquierda y el panel a la derecha.
  const shift = slot.featured ? 1.9 : 1.55
  const dist = slot.featured ? 6.6 : 4.6
  const card = new THREE.Vector3(x, y, z)
  const target = card.clone().addScaledVector(right, shift)
  const position = target.clone().addScaledVector(normal, dist)
  return { position: position.toArray(), target: target.toArray(), fov: HOME.desktop.fov }
}

export default function Experience({ projects, isMobile, hovered, selected, onHover, onOpen, reducedMotion }) {
  const layout = useMemo(() => computeCardLayout(projects), [projects])
  const selectedProject = projects.find((p) => p.id === selected) ?? null
  const focus = useMemo(() => focusFor(selectedProject, layout, isMobile), [selectedProject, layout, isMobile])
  const lookAt = hovered && !isMobile ? layout[hovered]?.position : null
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
        <HoloAvatar
          lookAt={lookAt}
          active={Boolean(hovered || selected)}
          isMobile={isMobile}
          position={isMobile ? [0, 0.1, 0] : [0, -0.55, 0]}
          scale={isMobile ? 1.15 : 1.3}
        />
        <AmbientParticles count={isMobile ? 400 : 900} />
        {!isMobile && (
          <ProjectCards3D
            projects={projects}
            layout={layout}
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
