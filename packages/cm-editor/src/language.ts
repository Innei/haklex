import { LanguageDescription } from '@codemirror/language'
import { languages as languageData } from '@codemirror/language-data'
import type { Extension } from '@codemirror/state'

export const languageAliases: Record<string, string[]> = {
  c: ['c'],
  cpp: ['c++', 'cpp'],
  cs: ['c#', 'csharp'],
  js: ['javascript'],
  jsx: ['javascript jsx', 'jsx'],
  md: ['markdown'],
  py: ['python'],
  sh: ['shell', 'bash'],
  ts: ['typescript'],
  tsx: ['typescript jsx', 'tsx'],
  yml: ['yaml'],
  zsh: ['shell', 'bash'],
}

export function getLanguageCandidates(language: string): string[] {
  const normalized = language === 'plaintext' ? 'text' : language
  return [normalized, ...(languageAliases[normalized] ?? [])]
}

export async function loadLanguageExtension(
  language: string,
): Promise<Extension> {
  if (language === 'text') return []

  const candidates = getLanguageCandidates(language)
  for (const candidate of candidates) {
    const matched = LanguageDescription.matchLanguageName(
      languageData,
      candidate,
      true,
    )
    if (!matched) continue

    try {
      return await matched.load()
    } catch {
      // try next candidate
    }
  }

  return []
}
