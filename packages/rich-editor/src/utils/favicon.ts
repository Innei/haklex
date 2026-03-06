const FAVICON_VARIANTS = [
  '/favicon.ico',
  '/favicon.png',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/apple-touch-icon-precomposed.png',
]

const faviconCache = new Map<string, string | null>()

export function getHostname(href: string): string | null {
  try {
    const url = new URL(href)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.hostname
  } catch {
    return null
  }
}

function probeImage(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(url)
    img.onerror = () => resolve(null)
    img.src = url
  })
}

export async function probeFavicon(hostname: string): Promise<string | null> {
  const cached = faviconCache.get(hostname)
  if (cached !== undefined) return cached

  for (const variant of FAVICON_VARIANTS) {
    const url = `https://${hostname}${variant}`
    const result = await probeImage(url)
    if (result) {
      faviconCache.set(hostname, result)
      return result
    }
  }

  faviconCache.set(hostname, null)
  return null
}
