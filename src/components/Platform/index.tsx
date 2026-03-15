import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import {
  Shape,
  ExtrudeGeometry,
  Vector3,
  BufferGeometry,
  Color,
  ShaderMaterial,
  Line as ThreeLine,
  LineBasicMaterial,
} from 'three'
import { COLORS, PLATFORM } from '../../constants'

const { hubRadius: R, wingLength: WL, wingBaseHalf: WB, wingTipHalf: WT, thickness } = PLATFORM

function buildPlatformShape(): Shape {
  const shape = new Shape()

  const pts: [number, number][] = [
    [WT, -(R + WL)],
    [WB, -R],
    [R, -WB],
    [R + WL, -WT],
    [R + WL, WT],
    [R, WB],
    [WB, R],
    [WT, R + WL],
    [-WT, R + WL],
    [-WB, R],
    [-R, WB],
    [-(R + WL), WT],
    [-(R + WL), -WT],
    [-R, -WB],
    [-WB, -R],
    [-WT, -(R + WL)],
  ]

  shape.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length; i++) {
    shape.lineTo(pts[i][0], pts[i][1])
  }
  shape.lineTo(pts[0][0], pts[0][1])

  return shape
}

const gridVertexShader = `
  varying vec3 vW;
  varying vec3 vWorldNormal;
  void main() {
    vW = (modelMatrix * vec4(position, 1.0)).xyz;
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    gl_Position = projectionMatrix * viewMatrix * vec4(vW, 1.0);
  }
`

const gridFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uBase;
  varying vec3 vW;
  varying vec3 vWorldNormal;
  void main() {
    float isTop = step(0.5, vWorldNormal.y);
    float gx = smoothstep(0.015, 0.0, abs(fract(vW.x) - 0.5));
    float gz = smoothstep(0.015, 0.0, abs(fract(vW.z) - 0.5));
    float g = max(gx, gz) * 0.25 * isTop;
    float pulse = sin(uTime * 0.4 + vW.x * 0.15 + vW.z * 0.15) * 0.5 + 0.5;
    g *= (0.6 + pulse * 0.4);
    vec3 sideColor = uBase * 0.55;
    vec3 topColor = mix(uBase, uColor, g);
    vec3 col = mix(sideColor, topColor, isTop);
    gl_FragColor = vec4(col, 1.0);
  }
`

export const Platform: React.FC = () => {
  const shaderRef = useRef<ShaderMaterial>(null)

  const { geometry, edgeLine, edgeLine2 } = useMemo(() => {
    const shape = buildPlatformShape()

    const geo = new ExtrudeGeometry(shape, {
      depth: thickness,
      bevelEnabled: false,
    })
    geo.rotateX(-Math.PI / 2)

    const bottomGeo = new ExtrudeGeometry(shape, {
      depth: 0.05,
      bevelEnabled: false,
    })
    bottomGeo.rotateX(-Math.PI / 2)

    const pts2D = shape.getPoints(80)
    const edgePts = pts2D.map((p) => new Vector3(p.x, thickness + 0.02, p.y))
    edgePts.push(edgePts[0].clone())
    const edgeGeo = new BufferGeometry().setFromPoints(edgePts)

    const line1 = new ThreeLine(
      edgeGeo,
      new LineBasicMaterial({ color: COLORS.accent, transparent: true, opacity: 0.5 }),
    )

    const line2 = new ThreeLine(
      edgeGeo.clone(),
      new LineBasicMaterial({ color: COLORS.accent, transparent: true, opacity: 0.25 }),
    )
    line2.position.y = 0.01
    line2.scale.set(0.98, 1, 0.98)

    return { geometry: geo, edgeLine: line1, edgeLine2: line2 }
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new Color(COLORS.accent) },
      uBase: { value: new Color(COLORS.platformBase) },
    }),
    [],
  )

  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <group>
      <RigidBody type="fixed" colliders="trimesh">
        <mesh geometry={geometry} receiveShadow>
          <shaderMaterial
            ref={shaderRef}
            uniforms={uniforms}
            vertexShader={gridVertexShader}
            fragmentShader={gridFragmentShader}
          />
        </mesh>
      </RigidBody>

      <primitive object={edgeLine} />
      <primitive object={edgeLine2} />
    </group>
  )
}
