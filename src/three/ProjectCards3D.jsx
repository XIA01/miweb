import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import ProjectCard from '../ui/ProjectCard'
import { DISTANCE_FACTOR, HANDS, pxToWorld } from './layout'

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

function NeonFrame({ w, h, color, hovered, focused, dimmed }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(color) },
          uIntensity: { value: 1.6 },
          uSize: { value: new THREE.Vector2(w, h) },
          uTime: { value: 0 },
        },
        vertexShader: frameVertex,
        fragmentShader: frameFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [w, h, color],
  )
  useFrame((s, dt) => {
    mat.uniforms.uTime.value = s.clock.elapsedTime
    const target = dimmed ? 0.15 : hovered || focused ? 2.8 : 1.4
    mat.uniforms.uIntensity.value = THREE.MathUtils.damp(mat.uniforms.uIntensity.value, target, 8, dt)
  })
  return (
    <mesh material={mat} position={[0, 0, -0.02]}>
      <planeGeometry args={[w, h]} />
    </mesh>
  )
}

function FloatingCard({ project, slot, index, hovered, focusedId, onHover, onOpen, portal }) {
  const group = useRef()
  const inner = useRef()
  const w = pxToWorld(slot.size.w) + 0.18
  const h = pxToWorld(slot.size.h) + 0.18
  const isHovered = hovered === project.id
  const isFocused = focusedId === project.id
  const dimmed = focusedId && !isFocused

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const [x, y, z] = slot.position
    group.current.position.set(x, y + Math.sin(t * 0.8 + index * 1.3) * 0.07, z)
    group.current.rotation.set(
      slot.rotation[0] + Math.sin(t * 0.5 + index) * 0.015,
      slot.rotation[1] + Math.cos(t * 0.4 + index) * 0.02,
      0,
    )
    const s = isHovered && !focusedId ? 1.07 : 1
    inner.current.scale.setScalar(THREE.MathUtils.damp(inner.current.scale.x, s, 10, dt))
    inner.current.position.z = THREE.MathUtils.damp(inner.current.position.z, isHovered ? 0.25 : 0, 10, dt)
    // Actualiza matrices antes de que <Html> calcule su CSS (evita desfase DOM/WebGL).
    group.current.updateMatrixWorld(true)
  }, -1)

  // Línea de energía desde el borde interno de la tarjeta hasta la mano correspondiente.
  const hand = slot.side < 0 ? HANDS.left : slot.side > 0 ? HANDS.right : null
  const linePoints = useMemo(() => {
    if (!hand) return null
    const edge = [slot.position[0] - slot.side * (w / 2), slot.position[1], slot.position[2]]
    const mid = [(edge[0] + hand[0]) / 2, edge[1], (edge[2] + hand[2]) / 2]
    return [edge, mid, hand]
  }, [hand, slot, w])

  return (
    <>
      {linePoints && (
        <Line
          points={linePoints}
          color={isHovered ? project.color : '#1fb6d9'}
          lineWidth={isHovered ? 1.6 : 0.8}
          transparent
          opacity={dimmed ? 0.08 : isHovered ? 0.9 : 0.35}
          dashed={!isHovered}
          dashSize={0.12}
          gapSize={0.08}
        />
      )}
      <group ref={group}>
        <group ref={inner}>
          <NeonFrame w={w} h={h} color={project.color} hovered={isHovered} focused={isFocused} dimmed={dimmed} />
          <Html
            transform
            portal={portal}
            distanceFactor={DISTANCE_FACTOR}
            zIndexRange={[30, 10]}
            style={{ transition: 'opacity .5s', opacity: dimmed ? 0.12 : 1, pointerEvents: dimmed ? 'none' : 'auto' }}
          >
            <ProjectCard
              project={project}
              variant={slot.featured ? 'featured' : 'side'}
              index={index}
              active={isHovered || isFocused}
              onHover={onHover}
              onOpen={onOpen}
            />
          </Html>
        </group>
      </group>
    </>
  )
}

export default function ProjectCards3D({ projects, layout, hovered, focusedId, onHover, onOpen, portal }) {
  return projects.map((p, i) => (
    <FloatingCard
      key={p.id}
      project={p}
      slot={layout[p.id]}
      index={i}
      hovered={hovered}
      focusedId={focusedId}
      onHover={onHover}
      onOpen={onOpen}
      portal={portal}
    />
  ))
}
