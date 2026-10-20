import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { patchVrmColors } from './exportVrm'
import { hexToLinearRgb, shadeOf, srgbToLinear } from './color'

const BASE_VRM = readFileSync(new URL('../../../public/avatar-base.vrm', import.meta.url))

const toArrayBuffer = (buf: Buffer): ArrayBuffer =>
  buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer

const readGlb = (buffer: ArrayBuffer) => {
  const view = new DataView(buffer)
  const jsonLen = view.getUint32(12, true)
  const json = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, 20, jsonLen)))
  const binOffset = 20 + jsonLen
  const binLen = view.getUint32(binOffset, true)
  const bin = new Uint8Array(buffer, binOffset + 8, binLen)
  return { view, json, bin, jsonLen, binLen }
}

describe('patchVrmColors', () => {
  it('指定したマテリアルの色だけを書き換え、他は元のまま保つ', () => {
    const src = toArrayBuffer(BASE_VRM)
    const out = patchVrmColors(src, { Body: { base: '#ff0000', shade: '#800000' } })

    const before = readGlb(src)
    const after = readGlb(out)

    const body = after.json.materials.find((m: any) => m.name === 'Body')
    expect(body.pbrMetallicRoughness.baseColorFactor).toEqual([1, 0, 0, 1])
    expect(body.extensions.VRMC_materials_mtoon.shadeColorFactor).toEqual(hexToLinearRgb('#800000'))

    const skinBefore = before.json.materials.find((m: any) => m.name === 'Skin')
    const skinAfter = after.json.materials.find((m: any) => m.name === 'Skin')
    expect(skinAfter).toEqual(skinBefore)

    expect(after.json.extensions.VRMC_vrm).toEqual(before.json.extensions.VRMC_vrm)
    expect(after.json.extensionsUsed).toEqual(before.json.extensionsUsed)
  })

  it('GLB の構造を保つ（ヘッダ長・4 バイト境界・バイナリチャンク不変）', () => {
    const src = toArrayBuffer(BASE_VRM)
    const out = patchVrmColors(src, { Skin: { base: '#123456', shade: '#0a1a2a' } })

    const before = readGlb(src)
    const after = readGlb(out)

    expect(after.view.getUint32(0, true)).toBe(0x46546c67)
    expect(after.view.getUint32(8, true)).toBe(out.byteLength)
    expect(after.jsonLen % 4).toBe(0)
    expect(after.binLen).toBe(before.binLen)
    expect(Buffer.from(after.bin).equals(Buffer.from(before.bin))).toBe(true)
  })
})

describe('color', () => {
  it('sRGB → リニア変換が glTF の仕様どおり', () => {
    expect(srgbToLinear(0)).toBe(0)
    expect(srgbToLinear(1)).toBeCloseTo(1, 6)
    expect(srgbToLinear(0.5)).toBeCloseTo(0.2140, 3)
  })

  it('影色はベース色より暗い', () => {
    const base = hexToLinearRgb('#5b2ff0')
    const shade = hexToLinearRgb(shadeOf('#5b2ff0'))
    expect(shade.every((c, i) => c < base[i])).toBe(true)
  })
})
