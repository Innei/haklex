import { vars } from '@haklex/rich-style-token'

import type {
  LinkCardData,
  LinkCardFetchContext,
  LinkCardPlugin,
  UrlMatchResult,
} from '../../types'
import {
  allowedBangumiTypes,
  bangumiTypeMap,
  fetchJsonWithContext,
  generateColor,
} from '../../utils'

export const bangumiPlugin: LinkCardPlugin = {
  name: 'bangumi',
  displayName: 'Bangumi',
  priority: 70,
  typeClass: 'media',
  provider: 'bangumi',

  matchUrl(url: URL): UrlMatchResult | null {
    if (url.hostname !== 'bgm.tv' && url.hostname !== 'bangumi.tv') return null
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts.length < 2) return null
    const [type, realId] = parts
    if (!allowedBangumiTypes.includes(type)) return null
    return { id: `${type}/${realId}`, fullUrl: url.toString(), meta: { type } }
  },

  isValidId(id: string): boolean {
    const [type, realId] = id.split('/')
    return allowedBangumiTypes.includes(type) && realId?.length > 0
  },

  async fetch(
    id: string,
    _meta?: Record<string, unknown>,
    context?: LinkCardFetchContext,
  ): Promise<LinkCardData> {
    const [type, realId] = id.split('/')
    const json = await fetchJsonWithContext(
      `https://api.bgm.tv/v0/${bangumiTypeMap[type]}/${realId}`,
      context,
      'bangumi',
    )

    let title = ''
    let originalTitle = ''

    if (type === 'subject') {
      if (json.name_cn && json.name_cn !== json.name && json.name_cn !== '') {
        title = json.name_cn
        originalTitle = json.name
      } else {
        title = json.name
        originalTitle = json.name
      }
    } else if (type === 'character' || type === 'person') {
      const { infobox } = json
      infobox.forEach(
        (item: { key: string; value: string | { v: string }[] }) => {
          if (item.key === '简体中文名') {
            title =
              typeof item.value === 'string' ? item.value : item.value[0].v
          } else if (item.key === '别名') {
            const aliases = item.value as { v: string }[]
            aliases.forEach((alias) => {
              originalTitle += `${alias.v} / `
            })
            originalTitle = originalTitle.slice(0, -3)
          }
        },
      )
    }

    const starStyle = {
      display: 'inline-flex',
      flexShrink: 0,
      alignItems: 'center',
      gap: '4px',
      alignSelf: 'center' as const,
      fontSize: vars.typography.fontSizeXs,
      color: '#fb923c',
    }

    return {
      title: (
        <span
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            gap: '8px',
          }}
        >
          <span>{title}</span>
          {title !== originalTitle && (
            <span
              style={{ fontSize: vars.typography.fontSizeMd, opacity: 0.7 }}
            >
              ({originalTitle})
            </span>
          )}
          {type === 'subject' && (
            <span
              style={{
                display: 'inline-flex',
                flexShrink: 0,
                alignItems: 'center',
                gap: '12px',
                alignSelf: 'center',
              }}
            >
              <span style={starStyle}>
                ★
                <span style={{ fontFamily: 'sans-serif', fontWeight: 500 }}>
                  {json.rating.score > 0 && json.rating.score.toFixed(1)}
                </span>
              </span>
              <span style={starStyle}>
                ☆
                <span style={{ fontFamily: 'sans-serif', fontWeight: 500 }}>
                  {json.collection &&
                    json.collection.on_hold +
                      json.collection.dropped +
                      json.collection.wish +
                      json.collection.collect +
                      json.collection.doing}
                </span>
              </span>
            </span>
          )}
          {(type === 'character' || type === 'person') && (
            <span style={starStyle}>
              ☆
              <span style={{ fontFamily: 'sans-serif', fontWeight: 500 }}>
                {json.stat.collects > 0 && json.stat.collects}
              </span>
            </span>
          )}
        </span>
      ),
      desc: (
        <span style={{ overflow: 'visible', whiteSpace: 'pre-wrap' }}>
          {json.summary}
        </span>
      ),
      image: json.images.grid,
      color: generateColor(title),
      classNames: {
        image: 'link-card__image--poster',
        cardRoot: 'link-card--reversed',
      },
    }
  },
}
