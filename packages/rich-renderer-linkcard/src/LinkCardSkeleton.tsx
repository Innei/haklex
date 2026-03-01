import { pluginMap } from './plugins'
import * as styles from './styles.css'

export function LinkCardSkeleton({
  source,
  className,
}: {
  source?: string
  className?: string
}) {
  const plugin = source ? pluginMap.get(source) : undefined
  const typeClass = plugin?.typeClass
  const typeStyleClass = typeClass ? styles.typeCardModifier[typeClass] : ''
  const typeSemanticClass = typeClass
    ? styles.semanticTypeClassNames[typeClass]
    : ''

  return (
    <span
      data-hide-print
      data-source={source || undefined}
      className={[
        styles.card,
        styles.semanticClassNames.card,
        styles.cardSkeleton,
        styles.semanticClassNames.cardSkeleton,
        typeStyleClass,
        typeSemanticClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className={`${styles.image} ${styles.semanticClassNames.image}`} />
      <span
        className={`${styles.content} ${styles.semanticClassNames.content}`}
      >
        <span className={`${styles.title} ${styles.semanticClassNames.title}`}>
          <span
            className={`${styles.titleText} ${styles.semanticClassNames.titleText}`}
          />
        </span>
        <span className={`${styles.desc} ${styles.semanticClassNames.desc}`} />
        <span
          className={`${styles.desc} ${styles.semanticClassNames.desc} ${styles.desc2} ${styles.semanticClassNames.desc2}`}
        />
      </span>
    </span>
  )
}
