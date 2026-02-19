import { rgbaToThumbHash, thumbHashToDataURL } from 'thumbhash'

const MAX_DIM = 100

export async function computeImageMeta(
  file: File,
): Promise<{ width: number; height: number; thumbhash: string }> {
  const url = URL.createObjectURL(file)
  try {
    const img = await loadImage(url)
    const { naturalWidth: w, naturalHeight: h } = img

    const scale = Math.min(MAX_DIM / w, MAX_DIM / h, 1)
    const sw = Math.round(w * scale)
    const sh = Math.round(h * scale)

    const canvas = document.createElement('canvas')
    canvas.width = sw
    canvas.height = sh
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0, sw, sh)
    const { data } = ctx.getImageData(0, 0, sw, sh)

    const hash = rgbaToThumbHash(sw, sh, data)
    const thumbhash = uint8ToBase64(hash)

    return { width: w, height: h, thumbhash }
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function decodeThumbHash(hash: string): string | undefined {
  try {
    const bytes = base64ToUint8(hash)
    return thumbHashToDataURL(bytes)
  } catch {
    return undefined
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function uint8ToBase64(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCodePoint(b)
  return btoa(bin)
}

function base64ToUint8(str: string): Uint8Array {
  const bin = atob(str)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.codePointAt(i)!
  return bytes
}
