import * as THREE from 'three'

// Ruido y hash compartidos por los shaders de la escena.
export const glslHash = /* glsl */ `
  float hash11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
  float hash21(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
  float hash31(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
`

// El vertex shader incluye los chunks de skinning de three.js: funciona igual con
// mallas estáticas y con SkinnedMesh (p. ej. el modelo GLTF de Mixamo).
const vertexShader = /* glsl */ `
  #include <common>
  #include <skinning_pars_vertex>
  uniform float uTime;
  uniform float uGlitch;
  varying vec3 vWorldPos;
  varying vec3 vObjPos;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  ${glslHash}

  void main() {
    #include <skinbase_vertex>
    #include <beginnormal_vertex>
    #include <skinnormal_vertex>
    #include <begin_vertex>
    #include <skinning_vertex>

    vec4 world = modelMatrix * vec4(transformed, 1.0);

    // Glitch horizontal esporádico: desplaza franjas finas del holograma.
    float slice = floor(world.y * 18.0);
    float tick = floor(uTime * 7.0);
    float g = step(0.985, hash21(vec2(slice, tick))) * uGlitch;
    world.x += (hash21(vec2(tick, slice)) - 0.5) * 0.12 * g;

    vWorldPos = world.xyz;
    vObjPos = transformed;
    vNormalW = normalize(mat3(modelMatrix) * objectNormal);
    vViewDir = normalize(cameraPosition - world.xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uCoreColor;
  uniform float uOpacity;
  uniform float uIntensity;
  uniform float uBaseY;
  uniform vec3 uChest;
  uniform float uCircuit;
  uniform float uCircuitScale;
  varying vec3 vWorldPos;
  varying vec3 vObjPos;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  ${glslHash}

  // Líneas de red neuronal: celdas pseudo-voronoi con nodos que pulsan.
  float neural(vec2 p, float t) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float d1 = 8.0, d2 = 8.0;
    float pulse = 0.0;
    for (int y = -1; y <= 1; y++)
    for (int x = -1; x <= 1; x++) {
      vec2 o = vec2(float(x), float(y));
      float h = hash21(i + o);
      vec2 r = o + 0.5 + 0.38 * sin(t * 0.6 + 6.2831 * vec2(h, hash21(i + o + 7.0))) - f;
      float d = dot(r, r);
      if (d < d1) { d2 = d1; d1 = d; pulse = h; }
      else if (d < d2) { d2 = d; }
    }
    float edge = 1.0 - smoothstep(0.0, 0.07, sqrt(d2) - sqrt(d1));
    float node = 1.0 - smoothstep(0.0, 0.1, sqrt(d1));
    return edge * 0.8 + node * (0.6 + 0.4 * sin(t * 3.0 + pulse * 30.0));
  }

  void main() {
    vec3 n = normalize(vNormalW);
    if (!gl_FrontFacing) n = -n;
    float fres = pow(1.0 - clamp(abs(dot(n, vViewDir)), 0.0, 1.0), 2.2);

    // Líneas de escaneo horizontal (finas + banda que recorre el cuerpo).
    float scan = 0.55 + 0.45 * sin(vWorldPos.y * 160.0 - uTime * 6.0);
    float sweep = pow(1.0 - abs(fract(vWorldPos.y * 0.25 - uTime * 0.35) * 2.0 - 1.0), 18.0);

    // Circuitos que parpadean sobre la superficie.
    vec3 cp = vObjPos * uCircuitScale;
    vec3 cell = floor(cp);
    vec3 fc = fract(cp);
    float lineMask = step(0.93, max(fc.x, max(fc.y, fc.z)));
    float blink = step(0.8, hash31(cell + floor(uTime * 2.0 + hash31(cell) * 4.0)));
    float circuit = lineMask * blink * uCircuit;

    // Red neuronal concentrada en el pecho.
    float chestMask = 1.0 - smoothstep(0.15, 0.85, distance(vWorldPos, uChest));
    float net = neural(vWorldPos.xy * 7.0, uTime) * chestMask;

    vec3 col = uColor * (0.18 + fres * 1.6) * scan;
    col += uColor * circuit * 1.4;
    col += uCoreColor * net * 1.8;
    col += uColor * sweep * 0.9;
    col *= uIntensity;

    float alpha = (0.1 + fres * 0.85 + circuit * 0.5 + net * 0.6 + sweep * 0.25) * uOpacity;
    alpha *= 0.75 + 0.25 * scan;

    // Disolución etérea hacia la parte inferior del cuerpo.
    float fade = smoothstep(uBaseY, uBaseY + 1.6, vWorldPos.y);
    float noise = hash21(floor(vWorldPos.xy * 60.0) + floor(uTime * 12.0));
    alpha *= fade * mix(step(noise, fade + 0.15), 1.0, fade);

    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
  }
`

export function createHologramMaterial(overrides = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#38c8ff') },
      uCoreColor: { value: new THREE.Color('#9ff5ff') },
      uOpacity: { value: 0.85 },
      uIntensity: { value: 1.25 },
      uBaseY: { value: -1.9 },
      uChest: { value: new THREE.Vector3(0, 1.0, 0.45) },
      uCircuit: { value: 1 },
      uCircuitScale: { value: 9 },
      uGlitch: { value: 1 },
      ...overrides,
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  })
}
