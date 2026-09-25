import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { glslHash } from './shaders/hologram'

export const GROUND_Y = -24
const FOG_COLOR = new THREE.Color('#050b16')

// Generador determinístico para que la ciudad sea siempre la misma.
function mulberry32(seed) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const buildingVertex = /* glsl */ `
  attribute float aSeed;
  varying vec3 vWorld;
  varying vec3 vNormalW;
  varying vec3 vLocal;
  varying vec3 vScale;
  varying float vSeed;
  varying float vDepth;
  void main() {
    mat4 im = modelMatrix * instanceMatrix;
    vec4 world = im * vec4(position, 1.0);
    vWorld = world.xyz;
    vLocal = position;
    vScale = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
    vNormalW = normalize(mat3(im) * normal);
    vSeed = aSeed;
    vec4 mv = viewMatrix * world;
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const buildingFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uFogColor;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform float uGroundY;
  varying vec3 vWorld;
  varying vec3 vNormalW;
  varying vec3 vLocal;
  varying vec3 vScale;
  varying float vSeed;
  varying float vDepth;
  ${glslHash}

  void main() {
    vec3 n = normalize(vNormalW);
    float h = vWorld.y - uGroundY;
    float topness = vLocal.y + 0.5; // 0 abajo, 1 arriba (geometría unitaria)

    // Metal oscuro con gradiente vertical y leve reflejo azulado.
    vec3 base = mix(vec3(0.004, 0.008, 0.015), vec3(0.012, 0.022, 0.04), topness);
    float rim = pow(1.0 - abs(n.z), 3.0) * 0.025;
    vec3 col = base + vec3(0.1, 0.25, 0.4) * rim;

    if (abs(n.y) < 0.5) {
      // Coordenadas de fachada en metros para que las ventanas no se estiren.
      float u = (abs(n.x) > 0.5 ? vLocal.z * vScale.z : vLocal.x * vScale.x);
      float v = vLocal.y * vScale.y;
      vec2 grid = vec2(u / 0.9, v / 1.25);
      vec2 cell = floor(grid);
      vec2 f = fract(grid);
      float win = step(0.18, f.x) * step(f.x, 0.82) * step(0.25, f.y) * step(f.y, 0.78);
      float r = hash21(cell + vSeed * 91.7 + n.x * 13.0);
      float lit = step(0.8 - vSeed * 0.1, r);
      // Algunas ventanas cambian lentamente de estado.
      lit *= step(0.04, hash21(cell + floor(uTime * 0.15 + r * 10.0)));
      vec3 warm = vec3(1.0, 0.72, 0.38);
      vec3 cool = vec3(0.45, 0.85, 1.0);
      vec3 wc = mix(warm, cool, step(0.55, hash11(r * 71.0 + vSeed)));
      col += wc * win * lit * (0.35 + 0.9 * pow(hash11(r * 33.0), 3.0));

      // Franjas de neón verticales / horizontales en algunas torres.
      float stripe = step(0.96, fract(u * 0.2 + vSeed * 3.0)) * step(0.8, vSeed);
      float ledge = step(0.99, fract(v * 0.04 + vSeed)) * step(0.6, vSeed);
      vec3 neon = mix(vec3(0.1, 0.9, 1.4), vec3(1.2, 0.25, 0.9), step(0.88, vSeed));
      col += neon * (stripe + ledge) * 0.9;
      // Borde superior iluminado
      col += vec3(0.2, 0.8, 1.2) * smoothstep(0.985, 1.0, topness) * step(0.5, vSeed) * 2.0;
    }

    // Niebla densa en la base (profundidad de ciudad) + niebla por distancia.
    float lowFog = 1.0 - smoothstep(0.0, 18.0, h);
    float fog = smoothstep(uFogNear, uFogFar, vDepth);
    col = mix(col, uFogColor * 1.4 + vec3(0.0, 0.02, 0.04) * lowFog, clamp(lowFog * 0.7, 0.0, 1.0));
    col = mix(col, uFogColor, fog);
    gl_FragColor = vec4(col, 1.0);
  }
`

function Buildings({ count, seed = 7 }) {
  const ref = useRef()
  const { geometry, material, beacons } = useMemo(() => {
    const rnd = mulberry32(seed)
    const g = new THREE.BoxGeometry(1, 1, 1)
    const m = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uFogColor: { value: FOG_COLOR },
        uFogNear: { value: 30 },
        uFogFar: { value: 150 },
        uGroundY: { value: GROUND_Y },
      },
      vertexShader: buildingVertex,
      fragmentShader: buildingFragment,
    })
    const mats = []
    const seeds = []
    const beacons = []
    const dummy = new THREE.Object3D()
    let placed = 0
    let guard = 0
    const place = (x, z, w, d, hgt) => {
      dummy.position.set(x, GROUND_Y + hgt / 2, z)
      dummy.scale.set(w, hgt, d)
      dummy.rotation.y = rnd() < 0.12 ? rnd() * 0.5 : 0
      dummy.updateMatrix()
      mats.push(dummy.matrix.clone())
      seeds.push(rnd())
      if (hgt > 30 && rnd() < 0.85) beacons.push([x, GROUND_Y + hgt + 0.6 + rnd() * 3, z, rnd()])
      placed++
    }
    // Torres de primer plano que enmarcan la escena a los costados.
    for (let i = 0; i < 10; i++) {
      const side = i % 2 ? 1 : -1
      place(side * (17 + rnd() * 16), 4 - rnd() * 22, 3 + rnd() * 3, 3 + rnd() * 3, 34 + rnd() * 18)
    }
    while (placed < count && guard++ < count * 20) {
      const x = (rnd() * 2 - 1) * 95
      const z = -12 - rnd() * 130
      // Plaza central libre bajo la entidad y avenida hacia el horizonte.
      if (Math.abs(x) < 14 && z > -34) continue
      if (Math.abs(x) < 5 && z > -95) continue
      const w = 2.5 + rnd() * 5
      const d = 2.5 + rnd() * 5
      const tall = rnd() < 0.14
      const hgt = tall ? 32 + rnd() * 22 : 7 + rnd() * 17 + Math.abs(x) * 0.08
      place(x, z, w, d, hgt)
    }
    g.setAttribute('aSeed', new THREE.InstancedBufferAttribute(new Float32Array(seeds), 1))
    g.userData.matrices = mats
    return { geometry: g, material: m, beacons }
  }, [count, seed])

  const setMatrices = (mesh) => {
    if (!mesh) return
    ref.current = mesh
    geometry.userData.matrices.forEach((mat, i) => mesh.setMatrixAt(i, mat))
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <>
      <instancedMesh ref={setMatrices} args={[geometry, material, geometry.userData.matrices.length]} frustumCulled={false} />
      <Beacons beacons={beacons} />
    </>
  )
}

// Luces rojas de antena que parpadean en los rascacielos más altos.
function Beacons({ beacons }) {
  const ref = useRef()
  const { geometry, material } = useMemo(() => {
    const g = new THREE.SphereGeometry(0.22, 8, 6)
    const seeds = new Float32Array(beacons.map((b) => b[3]))
    g.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1))
    const m = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: /* glsl */ `
        attribute float aSeed; varying float vSeed;
        void main() { vSeed = aSeed; gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform float uTime; varying float vSeed;
        void main() {
          float blink = step(0.55, fract(uTime * 0.6 + vSeed * 5.0));
          gl_FragColor = vec4(vec3(4.0, 0.25, 0.2) * (0.25 + blink * 1.2), 1.0);
        }`,
      toneMapped: false,
    })
    return { geometry: g, material: m }
  }, [beacons])

  const init = (mesh) => {
    if (!mesh) return
    ref.current = mesh
    const d = new THREE.Object3D()
    beacons.forEach(([x, y, z], i) => {
      d.position.set(x, y, z)
      d.updateMatrix()
      mesh.setMatrixAt(i, d.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }

  useFrame((s) => (material.uniforms.uTime.value = s.clock.elapsedTime))
  if (!beacons.length) return null
  return <instancedMesh ref={init} args={[geometry, material, beacons.length]} frustumCulled={false} />
}

// Suelo con avenidas y flujos de luz de tráfico terrestre.
function Ground() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uFogColor: { value: FOG_COLOR } },
        vertexShader: /* glsl */ `
          varying vec3 vWorld; varying float vDepth;
          void main() { vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; vec4 mv = viewMatrix * w; vDepth = -mv.z; gl_Position = projectionMatrix * mv; }`,
        fragmentShader: /* glsl */ `
          uniform float uTime; uniform vec3 uFogColor;
          varying vec3 vWorld; varying float vDepth;
          ${glslHash}
          void main() {
            vec2 p = vWorld.xz;
            vec3 col = vec3(0.01, 0.018, 0.03);
            // Calles cada 14 m
            vec2 g = abs(fract(p / 14.0) - 0.5) * 14.0;
            float road = step(g.x, 1.3) + step(g.y, 1.3);
            col += vec3(0.02, 0.05, 0.08) * clamp(road, 0.0, 1.0);
            // Luces de autos circulando por las avenidas (ejes x y z)
            float laneZ = step(g.x, 0.9);
            float laneX = step(g.y, 0.9);
            float carsZ = step(0.93, fract(p.y * 0.15 + uTime * 0.9 + hash11(floor(p.x / 14.0)) * 7.0));
            float carsX = step(0.93, fract(p.x * 0.15 - uTime * 0.7 + hash11(floor(p.y / 14.0)) * 5.0));
            col += vec3(1.6, 0.5, 0.25) * carsZ * laneZ + vec3(0.8, 1.1, 1.6) * carsX * laneX;
            // Avenida central brillante hacia la entidad
            float avenue = smoothstep(3.0, 0.0, abs(p.x));
            col += vec3(0.05, 0.25, 0.4) * avenue * (0.6 + 0.4 * sin(p.y * 0.8 + uTime * 3.0));
            float fog = smoothstep(20.0, 150.0, vDepth);
            gl_FragColor = vec4(mix(col, uFogColor, fog), 1.0);
          }`,
      }),
    [],
  )
  useFrame((s) => (material.uniforms.uTime.value = s.clock.elapsedTime))
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, GROUND_Y, -60]} material={material}>
      <planeGeometry args={[260, 200]} />
    </mesh>
  )
}

// Estructura central sobre la que levita la entidad, con haz de energía ascendente.
function Pedestal() {
  const ring = useRef()
  const beamMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: /* glsl */ `
          uniform float uTime; varying vec2 vUv;
          void main(){
            float a = pow(1.0 - vUv.y, 2.2);
            float streaks = 0.6 + 0.4 * sin(vUv.x * 60.0 + uTime * 2.0) * sin(vUv.y * 20.0 - uTime * 4.0);
            gl_FragColor = vec4(vec3(0.2, 0.75, 1.3) * 1.6, a * streaks * 0.55);
          }`,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )
  useFrame((s) => {
    beamMat.uniforms.uTime.value = s.clock.elapsedTime
    ring.current.rotation.z = s.clock.elapsedTime * 0.25
  })
  const baseY = -5.6
  return (
    <group>
      {/* Torre central */}
      <mesh position={[0, (baseY + GROUND_Y) / 2 - 0.4, -1]}>
        <cylinderGeometry args={[2.2, 3.8, baseY - GROUND_Y, 8]} />
        <meshStandardMaterial color="#070d18" metalness={0.9} roughness={0.35} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 3.8, (baseY + GROUND_Y) / 2 - 1.5, -1]}>
          <boxGeometry args={[1.2, baseY - GROUND_Y - 2, 3.2]} />
          <meshStandardMaterial color="#060b15" metalness={0.8} roughness={0.4} />
        </mesh>
      ))}
      <group position={[0, baseY, -1]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh ref={ring}>
          <ringGeometry args={[1.9, 2.05, 64, 1, 0, Math.PI * 1.7]} />
          <meshBasicMaterial color={new THREE.Color('#38d7ff').multiplyScalar(4)} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <ringGeometry args={[1.2, 1.26, 64]} />
          <meshBasicMaterial color={new THREE.Color('#38d7ff').multiplyScalar(2.5)} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <circleGeometry args={[1.15, 48]} />
          <meshBasicMaterial color="#0b3550" transparent opacity={0.7} toneMapped={false} />
        </mesh>
      </group>
      <mesh position={[0, baseY + 2.8, -1]} material={beamMat}>
        <cylinderGeometry args={[1.0, 1.9, 5.6, 48, 1, true]} />
      </mesh>
      <pointLight position={[0, baseY + 1.2, 0]} color="#3cc8ff" intensity={12} distance={12} />
    </group>
  )
}

export default function City({ isMobile }) {
  return (
    <group>
      <Ground />
      <Buildings count={isMobile ? 260 : 520} />
      <Pedestal />
    </group>
  )
}
