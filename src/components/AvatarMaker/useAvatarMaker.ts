import { useCallback } from 'react'
import { useInstanceState } from '@xrift/world-components'
import { DEFAULT_COLORS, type AvatarColors, type PartId } from './parts'

export interface AvatarMakerState {
  colors: AvatarColors
  /** 45° 単位の回転ステップ数 */
  rotation: number
}

export const DEFAULT_STATE: AvatarMakerState = { colors: DEFAULT_COLORS, rotation: 0 }

/** キャラクリの色と向き。インスタンス内の全員で共有する */
export const useAvatarMaker = () => {
  const [state, setState] = useInstanceState<AvatarMakerState>('avatar-maker', DEFAULT_STATE)

  const setColor = useCallback(
    (part: PartId, hex: string) => {
      setState((prev) => ({ ...prev, colors: { ...prev.colors, [part]: hex } }))
    },
    [setState],
  )

  const rotate = useCallback(
    (steps: number) => {
      setState((prev) => ({ ...prev, rotation: prev.rotation + steps }))
    },
    [setState],
  )

  const reset = useCallback(() => setState(DEFAULT_STATE), [setState])

  return { state, setColor, rotate, reset }
}
