/** Blob をファイルとして端末に保存する */
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  // ダウンロード開始前に URL を無効化しないよう少し待つ
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

export const avatarFilename = (date = new Date()) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `avatar-${y}${m}${d}.vrm`
}
