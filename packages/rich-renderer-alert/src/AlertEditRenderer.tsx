import type { AlertRendererProps } from '@haklex/rich-editor'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@haklex/rich-editor-ui'
import { ChevronDown } from 'lucide-react'
import type { FC } from 'react'

import {
  ALERT_ICONS,
  ALERT_LABELS,
  AlertRenderer,
  ALL_TYPES,
} from './AlertRenderer'
import * as css from './styles.css'

export const AlertEditRenderer: FC<AlertRendererProps> = ({
  type,
  editable,
  onTypeChange,
}) => {
  if (!editable || !onTypeChange) {
    return <AlertRenderer type={type} />
  }

  const Icon = ALERT_ICONS[type]
  const label = ALERT_LABELS[type]

  return (
    <div
      className={`${css.alertHeader} ${css.alertType({ type })} ${css.semanticClassNames.header} ${css.semanticTypeClassNames.header[type]}`}
    >
      <DropdownMenu>
        <DropdownMenuTrigger className={css.alertTrigger}>
          <Icon className={`${css.alertIcon} ${css.semanticClassNames.icon}`} />
          <span className={`${css.alertLabel} ${css.semanticClassNames.label}`}>
            {label}
          </span>
          <ChevronDown className={css.alertChevron} />
        </DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={6} align="start">
          {ALL_TYPES.map((t) => {
            const ItemIcon = ALERT_ICONS[t]
            return (
              <DropdownMenuItem key={t} onClick={() => onTypeChange(t)}>
                <ItemIcon
                  className={`${css.alertMenuIcon} ${css.alertType({ type: t })}`}
                />
                <span>{ALERT_LABELS[t]}</span>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
