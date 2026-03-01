import { vars } from '@haklex/rich-style-token'

import type {
  LinkCardData,
  LinkCardFetchContext,
  LinkCardPlugin,
  UrlMatchResult,
} from '../../types'
import { camelcaseKeys, fetchJsonWithContext } from '../../utils'

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'Easy':
      return '#00BFA5'
    case 'Medium':
      return '#FFA726'
    case 'Hard':
      return '#F44336'
    default:
      return '#757575'
  }
}

export const leetcodePlugin: LinkCardPlugin = {
  name: 'leetcode',
  displayName: 'LeetCode',
  priority: 65,
  typeClass: 'wide',
  provider: 'leetcode',

  matchUrl(url: URL): UrlMatchResult | null {
    if (url.hostname !== 'leetcode.cn' && url.hostname !== 'leetcode.com')
      return null
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts[0] !== 'problems' || !parts[1]) return null
    return { id: parts[1], fullUrl: url.toString() }
  },

  isValidId(id: string): boolean {
    return typeof id === 'string' && id.length > 0
  },

  async fetch(
    id: string,
    _meta?: Record<string, unknown>,
    context?: LinkCardFetchContext,
  ): Promise<LinkCardData> {
    const body = {
      query: `query questionData($titleSlug: String!) {\n  question(titleSlug: $titleSlug) {translatedTitle\n   difficulty\n    likes\n     topicTags { translatedName\n }\n    stats\n  }\n}\n`,
      variables: { titleSlug: id },
    }

    const questionData = await fetchJsonWithContext(
      'https://leetcode.cn/graphql/',
      context,
      'leetcode',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    )

    const questionTitleData = camelcaseKeys(questionData.data.question)
    const stats = JSON.parse(questionTitleData.stats)

    return {
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ flex: 1 }}>{questionTitleData.translatedTitle}</span>
          <span style={{ flexShrink: 0 }}>
            {questionTitleData.likes > 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: vars.typography.fontSizeMd,
                  color: '#fb923c',
                }}
              >
                👍
                <span style={{ fontFamily: 'sans-serif', fontWeight: 500 }}>
                  {questionTitleData.likes}
                </span>
              </span>
            )}
          </span>
        </span>
      ),
      desc: (
        <>
          <span
            style={{
              marginRight: '16px',
              fontWeight: 'bold',
              color: getDifficultyColor(questionTitleData.difficulty),
            }}
          >
            {questionTitleData.difficulty}
          </span>
          <span style={{ overflow: 'hidden' }}>
            {questionTitleData.topicTags
              .map((tag: any) => tag.translatedName)
              .join(' / ')}
          </span>
          <span style={{ float: 'right', overflow: 'hidden' }}>
            AR: {stats.acRate}
          </span>
        </>
      ),
      image:
        'https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png',
      color: getDifficultyColor(questionTitleData.difficulty),
    }
  },
}
