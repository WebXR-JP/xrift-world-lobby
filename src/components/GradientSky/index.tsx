import { useMemo } from 'react'
import { Color, BackSide } from 'three'
import { COLORS } from '../../constants'

const vertexShader = `
  varying vec3 vW;
  void main() {
    vW = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform vec3 uT;
  uniform vec3 uM;
  uniform vec3 uB;
  varying vec3 vW;
  void main() {
    float h = normalize(vW).y;
    vec3 c;
    if (h > 0.0) {
      c = mix(uM, uT, smoothstep(0.0, 0.5, h));
    } else {
      c = mix(uM, uB, smoothstep(0.0, -0.3, h));
    }
    gl_FragColor = vec4(c, 1.0);
  }
`

export const GradientSky: React.FC = () => {
  const uniforms = useMemo(
    () => ({
      uT: { value: new Color(COLORS.skyTop) },
      uM: { value: new Color(COLORS.skyMid) },
      uB: { value: new Color(COLORS.skyBottom) },
    }),
    [],
  )

  return (
    <mesh>
      <sphereGeometry args={[140, 32, 32]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={BackSide}
      />
    </mesh>
  )
}
