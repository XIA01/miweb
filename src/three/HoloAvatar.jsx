import { useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { createHologramMaterial } from './shaders/hologram'

// "X Bot" de Mixamo (el mismo que usan los ejemplos oficiales de three.js), sin animaciones
// y comprimido con meshopt. Se sirve desde /public.
export const AVATAR_URL = '/models/xbot.glb'

// Colores HDR (> 1) sin tone mapping: el bloom los convierte en destellos.
const EYE_COLOR = new THREE.Color('#bff8ff').multiplyScalar(7)
const CORE_COLOR = new THREE.Color('#7fe9ff').multiplyScalar(3.5)
const ORB_COLOR = new THREE.Color('#62d8ff').multiplyScalar(5)

// Pose "sagrada": rotaciones (radianes, ejes locales del hueso Mixamo) sumadas a la pose de reposo (T-pose).
const POSE = {
  'mixamorigLeftArm': [0, 0.35, -0.45],
  'mixamorigRightArm': [0, -0.35, 0.45],
  'mixamorigLeftForeArm': [0, 0.25, 0.12],
  'mixamorigRightForeArm': [0, -0.25, -0.12],
  'mixamorigLeftHand': [0.9, 0, 0.1],
  'mixamorigRightHand': [0.9, 0, -0.1],
  'mixamorigSpine2': [-0.06, 0, 0],
}

const tmpV = new THREE.Vector3()
const tmpHead = new THREE.Vector3()
const tmpQ = new THREE.Quaternion()
const tmpE = new THREE.Euler()

function glow(color, radius, opacity) {
  const g = new THREE.Group()
  const core = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 12), new THREE.MeshBasicMaterial({ color, toneMapped: false }))
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 2.6, 16, 12),
    new THREE.MeshBasicMaterial({ color: '#39c6ff', transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
  )
  g.add(core, halo)
  return g
}

/** Adjunta `obj` al hueso conservando su transform de mundo (compensa la escala 0.01 del rig). */
function attachAtWorld(bone, obj, worldPos) {
  obj.position.copy(worldPos)
  bone.parent.updateMatrixWorld(true)
  bone.attach(obj)
}

function SurfaceSparkles({ points }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uSize: { value: 26 }, uPixelRatio: { value: 1 } },
        vertexShader: /* glsl */ `
          uniform float uTime; uniform float uSize; uniform float uPixelRatio;
          attribute float aSeed;
          varying float vA;
          void main() {
            vec3 p = position + vec3(sin(aSeed * 91.0), cos(aSeed * 57.0), sin(aSeed * 13.0)) * 0.04 * sin(uTime * 2.0 + aSeed * 40.0);
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
            gl_FragColor = vec4(vec3(0.55, 0.95, 1.4) * 2.2, smoothstep(0.5, 0.0, d) * vA);
          }`,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )
  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime
    material.uniforms.uPixelRatio.value = state.gl.getPixelRatio()
  })
  if (!points) return null
  return <points geometry={points} material={material} />
}

/**
 * Entidad IA: modelo GLTF humanoide con material holográfico, pose de brazos abiertos,
 * ojos emisivos + PointLights en los huesos de los ojos, núcleo en el pecho y orbes en las palmas.
 */
export default function HoloAvatar({ lookAt, active, isMobile, position = [0, 0, 0], scale = 1 }) {
  const gltf = useLoader(GLTFLoader, AVATAR_URL, (loader) => loader.setMeshoptDecoder(MeshoptDecoder))
  const root = useRef()
  const material = useMemo(() => createHologramMaterial(), [])

  // Prepara el modelo una sola vez: materiales holográficos, pose, ojos, orbes y chispas.
  const rig = useMemo(() => {
    const model = gltf.scene
    // useLoader cachea el GLTF: si ya se preparó (remontaje), se reutiliza tal cual.
    if (model.userData.rig) return model.userData.rig
    const bones = {}
    const meshes = []
    model.traverse((o) => {
      if (o.isBone) bones[o.name] = o
      if (o.isSkinnedMesh || o.isMesh) {
        o.material = material
        o.frustumCulled = false
        meshes.push(o)
      }
    })

    // Normaliza el tamaño: el X Bot mide ~1.8 u; lo llevamos a 1 u de alto con los pies en y=0.
    model.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(model)
    const h = box.max.y - box.min.y
    model.scale.multiplyScalar(1 / h)
    model.position.y -= box.min.y / h

    for (const [name, [x, y, z]] of Object.entries(POSE)) {
      const b = bones[name]
      if (!b) continue
      b.quaternion.multiply(tmpQ.setFromEuler(tmpE.set(x, y, z)))
    }
    const head = bones['mixamorigHead']
    const spine = bones['mixamorigSpine2']
    const rest = { head: head.quaternion.clone(), spine: spine.quaternion.clone() }
    model.updateMatrixWorld(true)

    // Escala de los circuitos en unidades locales de la malla (cm del rig Mixamo).
    const meshScale = meshes[0].getWorldScale(new THREE.Vector3()).x

    // Ojos: esferas HDR + PointLight adjuntas a los huesos LeftEye / RightEye del modelo.
    const eyes = ['mixamorigLeftEye', 'mixamorigRightEye'].map((name) => {
      const bone = bones[name]
      const p = bone.getWorldPosition(new THREE.Vector3())
      p.z += 0.008
      const eye = glow(EYE_COLOR, 0.0065, 0.22)
      eye.scale.set(1.5, 0.8, 0.6)
      const light = new THREE.PointLight('#8ff0ff', 0.6, 0.5, 2)
      light.position.set(0, 0, 0.05)
      eye.add(light)
      attachAtWorld(bone, eye, p)
      return eye
    })

    // Orbes de energía en las palmas.
    const orbs = ['mixamorigLeftHand', 'mixamorigRightHand'].map((name, i) => {
      const bone = bones[name]
      const p = bone.getWorldPosition(new THREE.Vector3())
      p.x += (i === 0 ? 1 : -1) * 0.05
      p.z += 0.05
      const orb = glow(ORB_COLOR, 0.016, 0.16)
      orb.add(new THREE.PointLight('#4fd8ff', 1.2, 1.2, 2))
      attachAtWorld(bone, orb, p)
      return orb
    })

    // Núcleo del pecho con anillos.
    const chest = spine.getWorldPosition(new THREE.Vector3())
    chest.y += 0.04
    chest.z += 0.1
    const core = glow(CORE_COLOR, 0.012, 0.12)
    const ringMat = new THREE.MeshBasicMaterial({ color: CORE_COLOR, toneMapped: false })
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.003, 8, 48, Math.PI * 1.6), ringMat)
    const ringB = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.002, 8, 64, Math.PI * 1.2), ringMat)
    core.add(ringA, ringB, new THREE.PointLight('#5fe0ff', 0.8, 0.8, 2))
    attachAtWorld(spine, core, chest)

    // Chispas sobre la superficie ya posada (skinning aplicado con getVertexPosition).
    const surface = meshes.find((m) => m.name.includes('Surface')) ?? meshes[0]
    const neckY = bones['mixamorigNeck'].getWorldPosition(new THREE.Vector3()).y
    const hipsY = bones['mixamorigHips'].getWorldPosition(new THREE.Vector3()).y
    const count = surface.geometry.attributes.position.count
    const pos = []
    const seeds = []
    const v = new THREE.Vector3()
    for (let tries = 0; pos.length / 3 < 1400 && tries < 20000; tries++) {
      surface.getVertexPosition(Math.floor(Math.random() * count), v)
      v.applyMatrix4(surface.matrixWorld)
      if (v.y > neckY || v.y < hipsY - 0.15) continue
      pos.push(v.x, v.y, v.z)
      seeds.push(Math.random())
    }
    const sparkles = new THREE.BufferGeometry()
    sparkles.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    sparkles.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1))

    model.userData.rig = { model, head, spine, rest, eyes, orbs, core, ringA, ringB, sparkles, meshScale }
    return model.userData.rig
  }, [gltf, material])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const u = material.uniforms
    u.uTime.value = t
    u.uIntensity.value = THREE.MathUtils.damp(u.uIntensity.value, active ? 1.65 : 1.25, 4, delta)

    // Levitación y respiración suaves.
    root.current.position.y = position[1] + Math.sin(t * 0.7) * 0.06
    rig.spine.quaternion.copy(rig.rest.spine).multiply(tmpQ.setFromEuler(tmpE.set(Math.sin(t * 1.3) * 0.015, 0, 0)))

    // Uniforms en coordenadas de mundo: pecho (red neuronal) y base de la disolución.
    rig.core.getWorldPosition(u.uChest.value)
    u.uBaseY.value = position[1] + 0.3 * scale
    u.uCircuitScale.value = 7 * rig.meshScale * scale

    // Mirada: orienta la cabeza hacia la tarjeta en hover (o al puntero).
    rig.head.getWorldPosition(tmpHead)
    let yaw = Math.sin(t * 0.35) * 0.08
    let pitch = Math.sin(t * 0.5) * 0.03
    if (lookAt) {
      tmpV.copy(lookAt).sub(tmpHead)
      yaw = Math.atan2(tmpV.x, Math.max(0.5, tmpV.z + 3))
      pitch = -Math.atan2(tmpV.y, Math.hypot(tmpV.x, tmpV.z + 3)) * 0.8
    } else if (!isMobile) {
      yaw += state.pointer.x * 0.25
      pitch -= state.pointer.y * 0.12
    }
    const hs = rig.head.userData
    hs.yaw = THREE.MathUtils.damp(hs.yaw ?? 0, THREE.MathUtils.clamp(yaw, -0.7, 0.7), 5, delta)
    hs.pitch = THREE.MathUtils.damp(hs.pitch ?? 0, THREE.MathUtils.clamp(pitch, -0.35, 0.35), 5, delta)
    rig.head.quaternion.copy(rig.rest.head).multiply(tmpQ.setFromEuler(tmpE.set(hs.pitch, hs.yaw, 0)))

    // Núcleo, orbes y ojos latiendo.
    const beat = 1 + Math.pow(Math.sin(t * 2.2) * 0.5 + 0.5, 6) * 0.35
    rig.core.children[0].scale.setScalar(beat)
    rig.ringA.rotation.z = t * 0.8
    rig.ringB.rotation.z = -t * 0.5
    const orbPulse = 1 + Math.sin(t * 3.1) * 0.12
    rig.orbs[0].children[0].scale.setScalar(orbPulse)
    rig.orbs[1].children[0].scale.setScalar(2 - orbPulse)
    const flicker = 1 + Math.sin(t * 5) * 0.08
    rig.eyes.forEach((e) => e.children[1].scale.setScalar(flicker))
  })

  return (
    <group ref={root} position={position} scale={scale}>
      <primitive object={rig.model} />
      <SurfaceSparkles points={rig.sparkles} />
    </group>
  )
}

useLoader.preload(GLTFLoader, AVATAR_URL, (loader) => loader.setMeshoptDecoder(MeshoptDecoder))
