import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COLORS = ['#7ff3ff', '#ff4a5a', '#ffb347', '#e8f4ff', '#38bdf8'].map((c) => new THREE.Color(c))

/**
 * Tráfico aéreo: vehículos instanciados que recorren carriles entre las torres,
 * cada uno con una estela de luz (plano estirado con degradé) orientada según su velocidad.
 */
function FlyingTraffic({ count }) {
  const heads = useRef()
  const trails = useRef()
  const lanes = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const alongX = Math.random() < 0.7
      const dir = Math.random() < 0.5 ? 1 : -1
      return {
        alongX,
        dir,
        speed: 5 + Math.random() * 11,
        offset: Math.random() * 240,
        y: -14 + Math.random() * 22 + (i % 3) * 1.5,
        lane: alongX ? -12 - Math.random() * 90 : (Math.random() < 0.5 ? -1 : 1) * (10 + Math.random() * 60),
        color: COLORS[i % COLORS.length],
        len: 2 + Math.random() * 5,
      }
    })
  }, [count])

  const trailMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: /* glsl */ `
          attribute vec3 aColor;
          varying vec2 vUv; varying vec3 vColor;
          void main() {
            vUv = uv;
            vColor = aColor;
            gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          varying vec2 vUv; varying vec3 vColor;
          void main() {
            float a = pow(vUv.x, 2.0) * (1.0 - abs(vUv.y - 0.5) * 2.0);
            gl_FragColor = vec4(vColor * 3.0, a);
          }`,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )

  const trailGeometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1)
    const c = new Float32Array(lanes.flatMap((l) => [l.color.r, l.color.g, l.color.b]))
    g.setAttribute('aColor', new THREE.InstancedBufferAttribute(c, 3))
    return g
  }, [lanes])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    lanes.forEach((l, i) => {
      const s = ((l.offset + t * l.speed) % 240) - 120
      const x = l.alongX ? s * l.dir : l.lane
      const z = l.alongX ? l.lane : -70 + (s * 0.55) * l.dir
      const y = l.y + Math.sin(t * 0.6 + i) * 0.3
      dummy.position.set(x, y, z)
      dummy.rotation.set(0, l.alongX ? (l.dir > 0 ? 0 : Math.PI) : l.dir > 0 ? -Math.PI / 2 : Math.PI / 2, 0)
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      heads.current.setMatrixAt(i, dummy.matrix)
      // La estela queda detrás del vehículo (eje -x local).
      dummy.translateX(-l.len / 2)
      dummy.scale.set(l.len, 0.18, 1)
      dummy.updateMatrix()
      trails.current.setMatrixAt(i, dummy.matrix)
    })
    heads.current.instanceMatrix.needsUpdate = true
    trails.current.instanceMatrix.needsUpdate = true
  })

  const initColors = (mesh, mult) => {
    if (!mesh || mesh.instanceColor) return
    lanes.forEach((l, i) => mesh.setColorAt(i, l.color.clone().multiplyScalar(mult)))
    mesh.instanceColor.needsUpdate = true
  }

  return (
    <>
      <instancedMesh
        ref={(m) => {
          heads.current = m
          initColors(m, 4)
        }}
        args={[undefined, undefined, count]}
        frustumCulled={false}
      >
        <boxGeometry args={[0.5, 0.14, 0.24]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={trails} args={[trailGeometry, trailMaterial, count]} frustumCulled={false} />
    </>
  )
}

// Dron de vigilancia con rotores, luces parpadeantes y cono de luz volumétrico.
function Drone({ path, speed = 0.12, phase = 0 }) {
  const ref = useRef()
  const blink = useRef()
  const coneMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: /* glsl */ `varying vec2 vUv; void main(){ float a = pow(vUv.y, 1.6) * 0.22; gl_FragColor = vec4(vec3(0.75, 0.92, 1.0) * 1.4, a); }`,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + phase
    const [cx, cy, cz, rx, rz] = path
    ref.current.position.set(cx + Math.cos(t) * rx, cy + Math.sin(t * 2.3) * 0.4, cz + Math.sin(t) * rz)
    ref.current.rotation.y = -t + Math.PI / 2
    ref.current.rotation.z = Math.sin(t * 3) * 0.05
    blink.current.visible = Math.sin(state.clock.elapsedTime * 6 + phase * 10) > 0.6
  })
  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[0.5, 0.14, 0.34]} />
        <meshStandardMaterial color="#1a2433" metalness={0.8} roughness={0.35} />
      </mesh>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => (
        <group key={i} position={[x * 0.36, 0.05, z * 0.28]}>
          <mesh>
            <boxGeometry args={[0.28, 0.03, 0.04]} />
            <meshStandardMaterial color="#223044" metalness={0.7} roughness={0.4} />
          </mesh>
          <mesh position={[x * 0.1, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.13, 16]} />
            <meshBasicMaterial color="#8fbfdc" transparent opacity={0.18} />
          </mesh>
        </group>
      ))}
      <mesh ref={blink} position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.04, 8, 6]} />
        <meshBasicMaterial color={new THREE.Color('#ff3040').multiplyScalar(6)} toneMapped={false} />
      </mesh>
      <mesh position={[0.2, -0.05, 0]}>
        <sphereGeometry args={[0.05, 8, 6]} />
        <meshBasicMaterial color={new THREE.Color('#dff6ff').multiplyScalar(6)} toneMapped={false} />
      </mesh>
      <mesh position={[0.2, -2.1, 0]} material={coneMat}>
        <coneGeometry args={[1.1, 4, 24, 1, true]} />
      </mesh>
    </group>
  )
}

export default function Traffic({ isMobile }) {
  return (
    <group>
      <FlyingTraffic count={isMobile ? 26 : 60} />
      <Drone path={[-9.5, 4.2, -2, 2.2, 1.5]} speed={0.22} />
      <Drone path={[9.5, 3.6, -3, 2.0, 1.8]} speed={0.18} phase={2} />
      {!isMobile && <Drone path={[-12, -1.5, -6, 3, 2]} speed={0.15} phase={4} />}
      {!isMobile && <Drone path={[13, -0.5, -8, 3, 2.5]} speed={0.2} phase={1} />}
    </group>
  )
}
