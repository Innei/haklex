export type EmbedType =
  | 'tweet'
  | 'youtube'
  | 'codesandbox'
  | 'bilibili'
  | 'github-file'
  | 'github-gist'
  | 'thinking'

export const isTweetUrl = (url: URL) =>
  (url.hostname === 'twitter.com' || url.hostname === 'x.com') &&
  url.pathname.startsWith('/')

export const isYoutubeUrl = (url: URL) =>
  url.hostname === 'www.youtube.com' && url.pathname.startsWith('/watch')

export const isCodesandboxUrl = (url: URL) =>
  url.hostname === 'codesandbox.io' && url.pathname.split('/').length === 3

export const isBilibiliVideoUrl = (url: URL) =>
  url.hostname.includes('bilibili.com') && url.pathname.startsWith('/video/BV')

export const isGithubFilePreviewUrl = (url: URL) => {
  const [, , , type] = url.pathname.split('/')
  return url.hostname === 'github.com' && type === 'blob'
}

export const isGistUrl = (url: URL) => url.hostname === 'gist.github.com'

export function createSelfThinkingMatcher(hostnames: string[]) {
  return (url: URL) =>
    hostnames.includes(url.hostname) && url.pathname.startsWith('/thinking/')
}

export function matchEmbedUrl(
  url: URL,
  selfThinkingMatcher?: (url: URL) => boolean,
): EmbedType | null {
  if (isTweetUrl(url)) return 'tweet'
  if (isYoutubeUrl(url)) return 'youtube'
  if (isCodesandboxUrl(url)) return 'codesandbox'
  if (isBilibiliVideoUrl(url)) return 'bilibili'
  if (isGithubFilePreviewUrl(url)) return 'github-file'
  if (isGistUrl(url)) return 'github-gist'
  if (selfThinkingMatcher?.(url)) return 'thinking'
  return null
}
