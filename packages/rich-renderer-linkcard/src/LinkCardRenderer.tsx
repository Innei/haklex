import './styles.css'

import type { LinkCardRendererProps } from '@shiro/rich-editor'
import { m, useMotionTemplate, useMotionValue } from 'motion/react'
import type { ComponentType } from 'react'
import { useCallback } from 'react'

import { useCardFetcher } from './hooks/useCardFetcher'
import { LinkCardSkeleton } from './LinkCardSkeleton'
import { pluginMap } from './plugins'

export interface EnhancedLinkCardProps extends LinkCardRendererProps {
  /** Plugin source (e.g., 'github-repo', 'arxiv') */
  source?: string
  /** ID for plugin-based fetch (e.g., 'owner/repo') */
  id?: string
}

/**
 * Enhanced LinkCard Renderer for @shiro/rich-editor
 * Supports plugin-based dynamic fetching and spotlight effects
 */
export const LinkCardRenderer: ComponentType<EnhancedLinkCardProps> = (
  props,
) => {
  const { url, title, description, favicon, image, source, id } = props

  // If source + id provided, use plugin system for dynamic fetch
  const useDynamicFetch = !!source && !!id
  const { loading, isError, cardInfo, fullUrl, isValid } = useCardFetcher({
    source: source || '',
    id: id || '',
    fallbackUrl: url,
    enabled: useDynamicFetch,
  })

  const plugin = source ? pluginMap.get(source) : undefined
  const typeClass = plugin?.typeClass ? `link-card--${plugin.typeClass}` : ''

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const radius = useMotionValue(0)

  const handleMouseMove = useCallback(
    ({ clientX, clientY, currentTarget }: React.MouseEvent) => {
      const bounds = currentTarget.getBoundingClientRect()
      mouseX.set(clientX - bounds.left)
      mouseY.set(clientY - bounds.top)
      radius.set(Math.hypot(bounds.width, bounds.height) * 1.3)
    },
    [mouseX, mouseY, radius],
  )

  const background = useMotionTemplate`radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, var(--spotlight-color) 0%, transparent 65%)`

  // Use plugin data if available, otherwise use props
  const finalTitle = cardInfo?.title || title || url
  const finalDesc = cardInfo?.desc || description
  const finalImage = cardInfo?.image || image
  const finalColor = cardInfo?.color
  const classNames = cardInfo?.classNames || {}

  if (useDynamicFetch && !isValid) {
    return null
  }

  if (useDynamicFetch && loading) {
    return (
      <a
        className="link-card"
        href={fullUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <LinkCardSkeleton />
      </a>
    )
  }

  return (
    <a
      className={`link-card ${typeClass} ${isError ? 'link-card--error' : ''} ${classNames.cardRoot || ''}`}
      href={useDynamicFetch ? fullUrl : url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        borderColor: finalColor ? `${finalColor}30` : undefined,
      }}
      onMouseMove={handleMouseMove}
    >
      {finalColor && (
        <>
          <div
            className="link-card__bg"
            style={{
              backgroundColor: finalColor,
              opacity: 0.06,
            }}
          />
          <m.div
            className="link-card__spotlight"
            style={
              {
                '--spotlight-color': `${finalColor}50`,
                background,
              } as any
            }
          />
        </>
      )}
      <span className="link-card__content">
        <span className="link-card__title">
          {favicon && (
            <img
              className="link-card__favicon"
              src={favicon}
              alt=""
              width={16}
              height={16}
            />
          )}
          {finalTitle}
        </span>
        {finalDesc && <span className="link-card__desc">{finalDesc}</span>}
        <span className="link-card__url">{url}</span>
      </span>
      {finalImage && (
        <span
          className={`link-card__image ${classNames.image || ''}`}
          style={{
            backgroundImage: `url(${finalImage})`,
          }}
        />
      )}
    </a>
  )
}
