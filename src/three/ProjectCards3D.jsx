import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import ProjectCard from '../ui/ProjectCard'
import { CARD_PX, DISTANCE_FACTOR, ORBIT, cardAngle, orbitPosition } from './layout'

const pxToWorld = (px) => (px * DISTANCE_FACTOR) / 400

const frameVertex = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`
const frameFragment = /* glsl */ `
  uniform vec3 uColor; uniform float uIntensity; uniform vec2 uSize; uniform float uTime;
  varying vec2 vUv;
  float sdRoundBox(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
  void main() {
    vec2 p = (vUv - 0.5) * uSize;
    vec2 inner = uSize * 0.5 - vec2(0.09);
    float d = sdRoundBox(p, inner, 0.07);
    float line = exp(-abs(d) * 60.0);
    float halo = exp(-max(d, 0.0) * 14.0) * step(0.0, d) * 0.22;
    // Esquinas tipo "bracket" más intensas.
    vec2 c = abs(p) - (inner - vec2(0.28));
    float corner = step(0.0, c.x) * step(0.0, c.y);
    float sweep = pow(0.5 + 0.5 * sin((p.x + p.y) * 2.0 - uTime * 2.2), 12.0);
    float a = line * (0.55 + corner * 0.9 + sweep * 0.6) + halo;
    gl_FragColor = vec4(uColor * uIntensity * (1.0 + corner), a);
  }
`

const W = pxToWorld(CARD_PX.w) + 0.18
const H = pxToWorld(CARD_PX.h) + 0.18

/**
 * Tarjeta en órbita. Cada frame:
 *   θ = orbit.angle + i·2π/n
 *   x = cx + sin(θ)·rx,  z = cz + cos(θ)·rz,  y = cy − cos(θ)·tilt
 * y se orienta hacia la cámara (billboard) para leerse siempre de frente.
 */
function OrbitingCard({ project, index, count, orbit, positions, hovered, focusedId, onHover, onOpen, portal }) {
  const group = useRef()
  const dom = useRef()
  const isHovered = hovered === project.id
  const isFocused = focusedId === project.id
  const dimmed = Boolean(focusedId) && !isFocused
  const pos = useMemo(() => (positions[project.id] = new THREE.Vector3()), [positions, project.id])

  const frame = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(project.color) },
          uIntensity: { value: 1.4 },
          uSize: { value: new THREE.Vector2(W, H) },
          uTime: { value: 0 },
        },
        vertexShader: frameVertex,
        fragmentShader: frameFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [project.color],
  )

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const theta = cardAngle(index, count, orbit.angle)
    orbitPosition(theta, pos)
    pos.y += Math.sin(t * 0.8 + index * 1.3) * 0.06 // flotación idle
    group.current.position.copy(pos)
    group.current.lookAt(state.camera.position)

    // Profundidad: 1 adelante, 0 atrás. Las traseras se desvanecen y no reciben clicks.
    const front = (Math.cos(theta) + 1) / 2
    const visible = dimmed ? 0.1 : 0.08 + 0.92 * THREE.MathUtils.smoothstep(front, 0.2, 0.75)
    if (dom.current) {
      dom.current.style.opacity = visible.toFixed(3)
      dom.current.style.pointerEvents = !dimmed && front > 0.4 ? 'auto' : 'none'
    }

    // Hover: escala + borde más intenso.
    const s = THREE.MathUtils.damp(group.current.scale.x, isHovered && !focusedId ? 1.15 : 1, 10, dt)
    group.current.scale.set(s, s, s)
    frame.uniforms.uTime.value = t
    const glow = (isHovered || isFocused ? 2.8 : 1.4) * visible
    frame.uniforms.uIntensity.value = THREE.MathUtils.damp(frame.uniforms.uIntensity.value, glow, 8, dt)

    // Matrices al día antes de que <Html> calcule su CSS (evita desfase DOM/WebGL).
    group.current.updateMatrixWorld(true)
  }, -1)

  return (
    <group ref={group}>
      <mesh material={frame} position={[0, 0, -0.02]}>
        <planeGeometry args={[W, H]} />
      </mesh>
      <Html transform portal={portal} distanceFactor={DISTANCE_FACTOR} zIndexRange={[30, 10]}>
        <div ref={dom} style={{ transition: 'opacity .35s' }}>
          <ProjectCard project={project} index={index} active={isHovered || isFocused} onHover={onHover} onOpen={onOpen} />
        </div>
      </Html>
    </group>
  )
}

/**
 * Avanza el ángulo global de la órbita. `orbit.speed` se amortigua a 0 en hover
 * (pausa suave) y queda en 0 mientras hay un proyecto abierto (GSAP controla el ángulo).
 */
function OrbitDriver({ orbit, hovered, focusedId }) {
  useFrame((_, dt) => {
    const target = hovered || focusedId ? 0 : 1
    orbit.speed = THREE.MathUtils.damp(orbit.speed, target, hovered ? 6 : 1.5, dt)
    if (!orbit.locked) orbit.angle += ORBIT.speed * orbit.speed * dt
  }, -3)
  return null
}

export default function ProjectCards3D({ projects, orbit, positions, hovered, focusedId, onHover, onOpen, portal }) {
  return (
    <>
      <OrbitDriver orbit={orbit} hovered={hovered} focusedId={focusedId} />
      {projects.map((p, i) => (
        <OrbitingCard
          key={p.id}
          project={p}
          index={i}
          count={projects.length}
          orbit={orbit}
          positions={positions}
          hovered={hovered}
          focusedId={focusedId}
          onHover={onHover}
          onOpen={onOpen}
          portal={portal}
        />
      ))}
    </>
  )
}
