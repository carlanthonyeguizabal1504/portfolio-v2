import { BufferAttribute, BufferGeometry, CatmullRomCurve3, Line, OrthographicCamera, Scene, ShaderMaterial, Vector2, Vector3, WebGLRenderer } from 'three'

/**
 * "Signal flow" background: hair-thin lines gather from the left, pass through the content center
 * and fan out right, with light pulses running along them.
 *
 * The canvas is transparent: the page's own --bg shows through, so only the line colors follow
 * the theme. Colors go to the shader as raw sRGB (no three color management), so they equal the
 * token hex values. This module is loaded with a dynamic import, after first paint.
 */

export type FlowColors = { accent: string; deep: string }
export type FlowSettings = { strength: number; speed: number; calm: boolean }

const VIEW_HALF_HEIGHT = 4.5 // scene units from center to top edge (landscape)
const MIN_HALF_WIDTH = 5 // scene units, so portrait screens see the fan, not just its waist
const LINES = 34
const SAMPLES = 220

function hexToVec3(hex: string): Vector3 {
  const value = parseInt(hex.trim().replace('#', ''), 16)
  return new Vector3(((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255)
}

/** Seeded random so the lines are the same on every visit. */
function seededRandom(seed: number) {
  let s = seed
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

const vertexShader = /* glsl */ `
  attribute float aU;
  attribute float aSeed;
  varying float vU;
  varying float vSeed;
  void main() {
    vU = aU;
    vSeed = aSeed;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uCenter;   // calm-zone center, 0..1 screen space
  uniform float uStrength;
  uniform float uCalm;
  uniform vec3 uAccent;
  uniform vec3 uDeep;
  varying float vU;
  varying float vSeed;

  // 1 at the edges, eased down behind the content center so text stays easy to read.
  float calmMask(vec2 uv) {
    float d = length((uv - uCenter) * vec2(1.0, 1.25));
    return mix(1.0, mix(0.32, 1.0, smoothstep(0.12, 0.55, d)), uCalm);
  }

  void main() {
    float d = fract(vSeed + uTime * (0.05 + 0.04 * fract(vSeed * 7.0)) - vU);
    float comet = exp(-d * 26.0);
    float alpha = (0.13 + 0.95 * comet) * uStrength * calmMask(gl_FragCoord.xy / uRes);
    gl_FragColor = vec4(mix(uAccent, uDeep, comet * 0.5), alpha);
  }
`

export function createSignalFlow(canvas: HTMLCanvasElement, colors: FlowColors, settings: FlowSettings) {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' })
  renderer.setClearColor(0x000000, 0)

  const scene = new Scene()
  const camera = new OrthographicCamera(-8, 8, VIEW_HALF_HEIGHT, -VIEW_HALF_HEIGHT, -10, 10)

  const uniforms = {
    uTime: { value: 0 },
    uRes: { value: new Vector2(1, 1) },
    uCenter: { value: new Vector2(0.5, 0.5) },
    uStrength: { value: settings.strength },
    uCalm: { value: settings.calm ? 1 : 0 },
    uAccent: { value: hexToVec3(colors.accent) },
    uDeep: { value: hexToVec3(colors.deep) },
  }
  const material = new ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true, depthWrite: false })

  const random = seededRandom(7)
  const geometries: BufferGeometry[] = []
  for (let i = 0; i < LINES; i++) {
    const spreadIn = random() * 2 - 1
    const spreadOut = random() * 2 - 1
    // Wide endpoints (x = +-12) so the lines still reach the screen edge when the scene is shifted.
    const curve = new CatmullRomCurve3([
      new Vector3(-12, spreadIn * 4.6, 0),
      new Vector3(-4, spreadIn * 1.7, 0),
      new Vector3(0, spreadIn * 0.35 + spreadOut * 0.1, 0),
      new Vector3(4, spreadOut * 1.7, 0),
      new Vector3(12, spreadOut * 4.6, 0),
    ])
    const points = curve.getPoints(SAMPLES)
    const geometry = new BufferGeometry().setFromPoints(points)
    geometry.setAttribute('aU', new BufferAttribute(new Float32Array(points.map((_, j) => j / SAMPLES)), 1))
    geometry.setAttribute('aSeed', new BufferAttribute(new Float32Array(points.length).fill(random()), 1))
    geometries.push(geometry)
    scene.add(new Line(geometry, material))
  }

  let width = 1

  return {
    resize(w: number, h: number) {
      width = w
      const dpr = Math.min(window.devicePixelRatio, 1.5)
      renderer.setPixelRatio(dpr)
      renderer.setSize(w, h, false)
      uniforms.uRes.value.set(w * dpr, h * dpr)
      // Portrait phones: keep at least 5 units of width so more of the fan shows, not a sliver.
      const halfWidth = Math.max(VIEW_HALF_HEIGHT * (w / h), MIN_HALF_WIDTH)
      const halfHeight = halfWidth / (w / h)
      camera.left = -halfWidth
      camera.right = halfWidth
      camera.top = halfHeight
      camera.bottom = -halfHeight
      camera.updateProjectionMatrix()
    },

    /** Put the convergence point and the calm zone behind the content column (x in CSS px). */
    setCenter(xPx: number) {
      uniforms.uCenter.value.set(xPx / width, 0.5)
      scene.position.x = (xPx / width - 0.5) * (camera.right - camera.left)
    },

    setColors(next: FlowColors) {
      uniforms.uAccent.value.copy(hexToVec3(next.accent))
      uniforms.uDeep.value.copy(hexToVec3(next.deep))
    },

    render(seconds: number) {
      uniforms.uTime.value = seconds * settings.speed
      renderer.render(scene, camera)
    },

    dispose() {
      geometries.forEach((g) => g.dispose())
      material.dispose()
      renderer.dispose()
    },
  }
}

export type SignalFlow = ReturnType<typeof createSignalFlow>
