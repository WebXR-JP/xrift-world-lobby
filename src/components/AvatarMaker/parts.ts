/** 色を変えられる部位の定義。id は avatar-base.vrm のマテリアル名と一致させる */

export type PartId = 'Skin' | 'Hair' | 'Eyes' | 'Body' | 'Arms'

export interface PartDef {
  id: PartId
  label: string
  palette: string[]
  defaultColor: string
}

const SKIN_PALETTE = [
  '#fde0cc', '#f7cdb3', '#e9b48f', '#d49a6a', '#b57a4d',
  '#8c5a35', '#5e3b22', '#f3e6ff', '#c7e8ff', '#d4f5d0',
]

const HAIR_PALETTE = [
  '#5a3d33', '#2b2420', '#8c5a35', '#c9924f', '#f0d8a8', '#f5f5f5',
  '#9955ff', '#ff6b8a', '#3a86ff', '#3ddc84', '#ff8c42', '#b8b0c4',
]

const EYE_PALETTE = [
  '#002691', '#15151a', '#5a3a2a', '#2f6fd6', '#2e8b57', '#7b4fd6',
  '#c0392b', '#e86aa3', '#d9a136', '#1fa39a', '#7a7f8c', '#e8ecff',
]

const CLOTH_PALETTE = [
  '#5b2ff0', '#9955ff', '#ff6b8a', '#ff8c42', '#ffd23f', '#3ddc84',
  '#00c2d4', '#3a86ff', '#ffffff', '#1f2233', '#8d6e63', '#f5c6d6',
]

export const PARTS: PartDef[] = [
  { id: 'Skin', label: '肌', palette: SKIN_PALETTE, defaultColor: '#fde0cc' },
  { id: 'Hair', label: '髪', palette: HAIR_PALETTE, defaultColor: '#b8b0c4' },
  { id: 'Eyes', label: '目', palette: EYE_PALETTE, defaultColor: '#002691' },
  { id: 'Body', label: '体', palette: CLOTH_PALETTE, defaultColor: '#5b2ff0' },
  { id: 'Arms', label: '腕', palette: CLOTH_PALETTE, defaultColor: '#5b2ff0' },
]

export type AvatarColors = Record<PartId, string>

export const DEFAULT_COLORS: AvatarColors = Object.fromEntries(
  PARTS.map((p) => [p.id, p.defaultColor]),
) as AvatarColors
