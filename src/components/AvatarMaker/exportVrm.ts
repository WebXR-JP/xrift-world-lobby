/**
 * VRM の書き出し（方式 A）。
 * 元の .vrm（GLB）の JSON チャンク内にあるマテリアルの色の値だけを書き換えて、
 * 骨格・表情・揺れ物などはそのまま保つ。
 *
 * 将来パーツ切り替えなど JSON の書き換えでは足りない編集が必要になったら、
 * この関数の中身を three.js の GLTFExporter ベース（方式 B）に差し替える。
 */
import { FileLoader } from 'three'
import { hexToLinearRgb } from './color'

export interface MaterialColor {
  base: string
  shade: string
}

export type MaterialColors = Record<string, MaterialColor>

const GLB_MAGIC = 0x46546c67
const CHUNK_JSON = 0x4e4f534a
const CHUNK_BIN = 0x004e4942

interface GlbChunks {
  json: Record<string, any>
  bin: Uint8Array | null
}

const parseGlb = (buffer: ArrayBuffer): GlbChunks => {
  const view = new DataView(buffer)
  if (view.getUint32(0, true) !== GLB_MAGIC) throw new Error('GLB ではありません')
  const total = view.getUint32(8, true)
  let offset = 12
  let json: Record<string, any> | null = null
  let bin: Uint8Array | null = null
  while (offset < total) {
    const length = view.getUint32(offset, true)
    const type = view.getUint32(offset + 4, true)
    const data = new Uint8Array(buffer, offset + 8, length)
    if (type === CHUNK_JSON) json = JSON.parse(new TextDecoder().decode(data))
    else if (type === CHUNK_BIN) bin = data
    offset += 8 + length
  }
  if (!json) throw new Error('JSON チャンクがありません')
  return { json, bin }
}

const pad4 = (n: number) => (n + 3) & ~3

const buildGlb = ({ json, bin }: GlbChunks): ArrayBuffer => {
  const jsonBytes = new TextEncoder().encode(JSON.stringify(json))
  const jsonLen = pad4(jsonBytes.byteLength)
  const binLen = bin ? pad4(bin.byteLength) : 0
  const total = 12 + 8 + jsonLen + (bin ? 8 + binLen : 0)
  const out = new ArrayBuffer(total)
  const view = new DataView(out)
  const bytes = new Uint8Array(out)
  view.setUint32(0, GLB_MAGIC, true)
  view.setUint32(4, 2, true)
  view.setUint32(8, total, true)
  view.setUint32(12, jsonLen, true)
  view.setUint32(16, CHUNK_JSON, true)
  bytes.set(jsonBytes, 20)
  bytes.fill(0x20, 20 + jsonBytes.byteLength, 20 + jsonLen) // JSON の余白はスペース
  if (bin) {
    const binOffset = 20 + jsonLen
    view.setUint32(binOffset, binLen, true)
    view.setUint32(binOffset + 4, CHUNK_BIN, true)
    bytes.set(bin, binOffset + 8)
  }
  return out
}

/** GLB のマテリアル色を書き換えた新しい GLB を返す（純粋関数） */
export const patchVrmColors = (buffer: ArrayBuffer, colors: MaterialColors): ArrayBuffer => {
  const chunks = parseGlb(buffer)
  const materials: any[] = chunks.json.materials ?? []
  for (const material of materials) {
    const color = colors[material.name]
    if (!color) continue
    material.pbrMetallicRoughness ??= {}
    material.pbrMetallicRoughness.baseColorFactor = [...hexToLinearRgb(color.base), 1]
    const mtoon = material.extensions?.VRMC_materials_mtoon
    if (mtoon) mtoon.shadeColorFactor = hexToLinearRgb(color.shade)
  }
  return buildGlb(chunks)
}

/** ベース VRM を読み込み、色を反映した .vrm の Blob を返す */
export const exportVrm = async (baseUrl: string, colors: MaterialColors): Promise<Blob> => {
  const loader = new FileLoader()
  loader.setResponseType('arraybuffer')
  const buffer = (await loader.loadAsync(baseUrl)) as ArrayBuffer
  return new Blob([patchVrmColors(buffer, colors)], { type: 'model/gltf-binary' })
}
