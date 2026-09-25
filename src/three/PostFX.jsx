import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

/**
 * Post-procesamiento con UnrealBloomPass: resalta neones, ventanas, ojos y orbes.
 * Toma el control del render (prioridad 1) para que R3F no dibuje dos veces.
 */
export default function PostFX({ strength = 0.9, radius = 0.5, threshold = 0.82 }) {
  const { gl, scene, camera, size } = useThree()

  const { composer, bloom } = useMemo(() => {
    const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType })
    const composer = new EffectComposer(gl, target)
    composer.addPass(new RenderPass(scene, camera))
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), strength, radius, threshold)
    composer.addPass(bloom)
    composer.addPass(new OutputPass())
    return { composer, bloom }
  }, [gl, scene, camera]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bloom.strength = strength
    bloom.radius = radius
    bloom.threshold = threshold
  }, [bloom, strength, radius, threshold])

  useEffect(() => {
    composer.setPixelRatio(gl.getPixelRatio())
    composer.setSize(size.width, size.height)
  }, [composer, gl, size])

  useEffect(() => () => composer.dispose(), [composer])

  useFrame((_, delta) => composer.render(delta), 1)
  return null
}
