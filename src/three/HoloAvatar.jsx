import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'
import { createHologramMaterial } from './shaders/hologram'

// Colores HDR (> 1) sin tone mapping: el bloom los convierte en destellos.
const EYE_COLOR = new THREE.Color('#bff8ff').multiplyScalar(9)
const CORE_COLOR = new THREE.Color('#7fe9ff').multiplyScalar(6)
const ORB_COLOR = new THREE.Color('#62d8ff').multiplyScalar(5)

const tmpV = new THREE.Vector3()
const tmpHead = new THREE.Vector3()

function useTorsoGeometry() {
  return useMemo(() => {
    // Perfil (radio, altura) del torso: cintura que se disuelve abajo, pecho ancho arriba.
    const pts = [
      [0.0, -2.0], [0.38, -2.0], [0.42, -1.3], [0.4, -0.7], [0.44, -0.2], [0.55, 0.3],
      [0.68, 0.8], [0.74, 1.15], [0.7, 1.42], [0.5, 1.62], [0.22, 1.74], [0.0, 1.76],
    ].map(([r, y]) => new THREE.Vector2(r, y))
    const g = new THREE.LatheGeometry(pts, 48)
    g.scale(1, 1, 0.6)
    g.computeVertexNormals()
    return g
  }, [])
}

function Arm({ side, material, orbRef }) {
  // El brazo se modela del lado derecho (+x) y se espeja con scale.x = side.
  const fingers = [-0.075, -0.025, 0.025, 0.075]
  return (
    <group scale={[side, 1, 1]}>
      <group position={[0.76, 1.38, 0]} rotation={[0, -0.28, -0.4]}>
        <mesh material={material} position={[0, 0, 0]} userData={{ sample: 0.7 }}>
          <sphereGeometry args={[0.25, 24, 16]} />
        </mesh>
        <mesh material={material} position={[0.6, 0, 0]} rotation={[0, 0, Math.PI / 2]} userData={{ sample: 1 }}>
          <capsuleGeometry args={[0.15, 0.95, 8, 20]} />
        </mesh>
        <group position={[1.18, 0, 0]} rotation={[0, -0.22, 0.14]}>
          <mesh material={material}>
            <sphereGeometry args={[0.14, 16, 12]} />
          </mesh>
          <mesh material={material} position={[0.52, 0, 0]} rotation={[0, 0, Math.PI / 2]} userData={{ sample: 0.9 }}>
            <capsuleGeometry args={[0.12, 0.82, 8, 20]} />
          </mesh>
          {/* Mano abierta con la palma hacia adelante */}
          <group position={[1.04, 0, 0]} rotation={[0, -0.25, 0.1]}>
            <mesh material={material} position={[0.14, 0, 0]} scale={[0.17, 0.15, 0.055]}>
              <sphereGeometry args={[1, 20, 14]} />
            </mesh>
            {fingers.map((y, i) => (
              <mesh
                key={i}
                material={material}
                position={[0.37, y * 1.2, 0]}
                rotation={[0, 0, Math.PI / 2 + y * 2.2]}
              >
                <capsuleGeometry args={[0.022, 0.2 - Math.abs(y) * 0.5, 4, 8]} />
              </mesh>
            ))}
            <mesh material={material} position={[0.12, 0.17, 0.02]} rotation={[0, 0, 0.35]}>
              <capsuleGeometry args={[0.025, 0.14, 4, 8]} />
            </mesh>
            {/* Orbe de energía en la palma */}
            <group ref={orbRef} position={[0.2, 0, 0.18]}>
              <mesh>
                <sphereGeometry args={[0.07, 16, 12]} />
                <meshBasicMaterial color={ORB_COLOR} toneMapped={false} />
              </mesh>
              <mesh scale={2.6}>
                <sphereGeometry args={[0.07, 16, 12]} />
                <meshBasicMaterial color="#2bb8ff" transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
              </mesh>
              <pointLight color="#4fd8ff" intensity={6} distance={4} decay={2} />
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

function SurfaceSparkles({ root, count }) {
  const pointsRef = useRef()
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uSize: { value: 26 }, uPixelRatio: { value: 1 } },
        vertexShader: /* glsl */ `
          uniform float uTime; uniform float uSize; uniform float uPixelRatio;
          attribute float aSeed;
          varying float vA;
          void main() {
            vec3 p = position + normal * (0.02 + 0.05 * sin(uTime * 2.0 + aSeed * 40.0));
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            float tw = 0.5 + 0.5 * sin(uTime * (2.0 + aSeed * 5.0) + aSeed * 90.0);
            vA = tw * tw;
            gl_PointSize = uSize * uPixelRatio * (0.35 + tw) / -mv.z;
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          varying float vA;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.0, d);
            gl_FragColor = vec4(vec3(0.55, 0.95, 1.4) * 2.2, a * vA);
          }`,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )

  useLayoutEffect(() => {
    const group = root.current
    if (!group) return
    group.updateMatrixWorld(true)
    const inv = new THREE.Matrix4().copy(group.matrixWorld).invert()
    const meshes = []
    group.traverse((o) => o.isMesh && o.userData.sample && meshes.push(o))
    const total = meshes.reduce((s, m) => s + m.userData.sample, 0)
    const positions = []
    const normals = []
    const seeds = []
    const p = new THREE.Vector3()
    const n = new THREE.Vector3()
    meshes.forEach((m) => {
      const sampler = new MeshSurfaceSampler(m).build()
      const local = new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld)
      const nm = new THREE.Matrix3().getNormalMatrix(local)
      const k = Math.round((count * m.userData.sample) / total)
      for (let i = 0; i < k; i++) {
        sampler.sample(p, n)
        p.applyMatrix4(local)
        n.applyMatrix3(nm).normalize()
        positions.push(p.x, p.y, p.z)
        normals.push(n.x, n.y, n.z)
        seeds.push(Math.random())
      }
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    g.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
    g.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1))
    pointsRef.current.geometry.dispose()
    pointsRef.current.geometry = g
  }, [root, count])

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime
    material.uniforms.uPixelRatio.value = state.gl.getPixelRatio()
  })

  return <points ref={pointsRef} material={material} />
}

/**
 * Entidad IA holográfica procedural: torso lathe, cabeza articulada que mira la
 * tarjeta en hover, brazos extendidos con orbes de energía, núcleo neuronal en el pecho.
 */
export default function HoloAvatar({ lookAt, active, isMobile, position = [0, 0, 0], scale = 1 }) {
  const root = useRef()
  const body = useRef()
  const head = useRef()
  const core = useRef()
  const ringA = useRef()
  const ringB = useRef()
  const orbL = useRef()
  const orbR = useRef()
  const eyeLight = useRef()
  const torso = useTorsoGeometry()
  const material = useMemo(() => createHologramMaterial(), [])
  const headMaterial = useMemo(() => createHologramMaterial({ uCircuit: { value: 0.6 } }), [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    for (const m of [material, headMaterial]) {
      m.uniforms.uTime.value = t
      const targetI = active ? 1.65 : 1.25
      m.uniforms.uIntensity.value = THREE.MathUtils.damp(m.uniforms.uIntensity.value, targetI, 4, delta)
      m.uniforms.uChest.value.set(position[0], root.current.position.y + 1.0 * scale, 0.45 * scale)
      m.uniforms.uBaseY.value = position[1] - 1.9 * scale
    }

    // Levitación y respiración suaves.
    root.current.position.y = position[1] + Math.sin(t * 0.7) * 0.06
    body.current.scale.set(1 + Math.sin(t * 1.3) * 0.008, 1, 1 + Math.sin(t * 1.3) * 0.012)

    // Mirada: orienta la cabeza hacia la tarjeta en hover (o al puntero).
    const h = head.current
    h.getWorldPosition(tmpHead)
    let yaw = Math.sin(t * 0.35) * 0.08
    let pitch = Math.sin(t * 0.5) * 0.03
    if (lookAt) {
      tmpV.set(...lookAt).sub(tmpHead)
      yaw = Math.atan2(tmpV.x, Math.max(0.5, tmpV.z + 3))
      pitch = -Math.atan2(tmpV.y, Math.hypot(tmpV.x, tmpV.z + 3)) * 0.8
    } else if (!isMobile) {
      yaw += state.pointer.x * 0.25
      pitch -= state.pointer.y * 0.12
    }
    h.rotation.y = THREE.MathUtils.damp(h.rotation.y, THREE.MathUtils.clamp(yaw, -0.7, 0.7), 5, delta)
    h.rotation.x = THREE.MathUtils.damp(h.rotation.x, THREE.MathUtils.clamp(pitch, -0.35, 0.35), 5, delta)

    // Núcleo del pecho y orbes latiendo.
    const beat = 1 + Math.pow(Math.sin(t * 2.2) * 0.5 + 0.5, 6) * 0.35
    core.current.scale.setScalar(beat)
    ringA.current.rotation.z = t * 0.8
    ringB.current.rotation.z = -t * 0.5
    const orbPulse = 1 + Math.sin(t * 3.1) * 0.12
    orbL.current.scale.setScalar(orbPulse)
    orbR.current.scale.setScalar(2 - orbPulse)
    eyeLight.current.intensity = 3 + Math.sin(t * 5) * 0.4
  })

  return (
    <group ref={root} position={position} scale={scale}>
      <group ref={body}>
        <mesh geometry={torso} material={material} userData={{ sample: 3 }} />
        {/* Collar y núcleo */}
        <mesh material={material} position={[0, 1.72, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.2, 0.035, 10, 32]} />
        </mesh>
        <group position={[0, 1.0, 0.43]}>
          <mesh ref={core}>
            <sphereGeometry args={[0.075, 20, 16]} />
            <meshBasicMaterial color={CORE_COLOR} toneMapped={false} />
          </mesh>
          <mesh ref={ringA}>
            <torusGeometry args={[0.17, 0.012, 8, 48, Math.PI * 1.6]} />
            <meshBasicMaterial color={CORE_COLOR} toneMapped={false} />
          </mesh>
          <mesh ref={ringB}>
            <torusGeometry args={[0.27, 0.007, 8, 64, Math.PI * 1.2]} />
            <meshBasicMaterial color="#59d2ff" toneMapped={false} transparent opacity={0.8} />
          </mesh>
          <pointLight color="#5fe0ff" intensity={4} distance={3} />
        </group>
      </group>

      <mesh material={material} position={[0, 1.88, 0]}>
        <cylinderGeometry args={[0.12, 0.15, 0.36, 20, 1, true]} />
      </mesh>

      <group ref={head} position={[0, 2.02, 0]}>
        <mesh material={headMaterial} position={[0, 0.33, 0]} scale={[0.82, 1.1, 0.92]}>
          <sphereGeometry args={[0.31, 40, 32]} />
        </mesh>
        {/* Mandíbula / mentón */}
        <mesh material={headMaterial} position={[0, 0.14, 0.07]} scale={[0.6, 0.45, 0.62]}>
          <sphereGeometry args={[0.3, 24, 16]} />
        </mesh>
        {/* Receptores laterales */}
        {[-1, 1].map((s) => (
          <mesh key={s} material={headMaterial} position={[s * 0.25, 0.34, -0.02]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 0.05, 20]} />
          </mesh>
        ))}
        {/* Ojos con destello constante */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.1, 0.35, 0.265]}>
            <mesh scale={[1.5, 0.75, 0.6]}>
              <sphereGeometry args={[0.026, 16, 12]} />
              <meshBasicMaterial color={EYE_COLOR} toneMapped={false} />
            </mesh>
            <mesh scale={[3.2, 1.5, 1]}>
              <sphereGeometry args={[0.026, 12, 10]} />
              <meshBasicMaterial color="#6fe8ff" transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0.56, 0.24]}>
          <sphereGeometry args={[0.03, 12, 10]} />
          <meshBasicMaterial color={CORE_COLOR} toneMapped={false} />
        </mesh>
        <pointLight ref={eyeLight} position={[0, 0.35, 0.45]} color="#8ff0ff" intensity={3} distance={2.5} />
      </group>

      <Arm side={-1} material={material} orbRef={orbL} />
      <Arm side={1} material={material} orbRef={orbR} />

      <SurfaceSparkles root={root} count={isMobile ? 700 : 1600} />
    </group>
  )
}

