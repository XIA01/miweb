import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Motas de luz que ascienden alrededor de la entidad y titilan.
export default function AmbientParticles({ count = 900, radius = 7, height = 12, y = -5 }) {
  const { geometry, material } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2
      const r = Math.pow(Math.random(), 0.6) * radius
      pos[i * 3] = Math.cos(a) * r
      pos[i * 3 + 1] = Math.random() * height
      pos[i * 3 + 2] = Math.sin(a) * r * 0.6
      seed[i] = Math.random()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    const m = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uHeight: { value: height }, uPR: { value: 1 } },
      vertexShader: /* glsl */ `
        uniform float uTime; uniform float uHeight; uniform float uPR;
        attribute float aSeed; varying float vA;
        void main() {
          vec3 p = position;
          p.y = mod(p.y + uTime * (0.2 + aSeed * 0.5), uHeight);
          p.x += sin(uTime * 0.5 + aSeed * 20.0) * 0.25;
          float edge = smoothstep(0.0, 1.5, p.y) * smoothstep(uHeight, uHeight - 3.0, p.y);
          vA = edge * (0.35 + 0.65 * pow(0.5 + 0.5 * sin(uTime * 3.0 + aSeed * 50.0), 3.0));
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = (8.0 + aSeed * 18.0) * uPR / -mv.z;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        varying float vA;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          gl_FragColor = vec4(vec3(0.35, 0.85, 1.4) * 1.8, smoothstep(0.5, 0.0, d) * vA);
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    return { geometry: g, material: m }
  }, [count, radius, height])

  useFrame((s) => {
    material.uniforms.uTime.value = s.clock.elapsedTime
    material.uniforms.uPR.value = s.gl.getPixelRatio()
  })
  return <points geometry={geometry} material={material} position={[0, y, 0]} />
}
