import './styles.css'

import type { AlertRendererProps } from '@shiro/rich-editor'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shiro/rich-editor-ui'
import type { LucideProps } from 'lucide-react'
import {
  ChevronDown,
  Info,
  Lightbulb,
  MessageSquareWarning,
  OctagonAlert,
  TriangleAlert,
} from 'lucide-react'
import type { FC } from 'react'

type AlertType = AlertRendererProps['type']

const ALERT_ICONS: Record<AlertType, FC<LucideProps>> = {
  note: Info,
  tip: Lightbulb,
  important: MessageSquareWarning,
  warning: TriangleAlert,
  caution: OctagonAlert,
}

const ALERT_LABELS: Record<AlertType, string> = {
  note: 'Note',
  tip: 'Tip',
  important: 'Important',
  warning: 'Warning',
  caution: 'Caution',
}

const ALERT_COLORS: Record<AlertType, string> = {
  note: '#3b82f6',
  tip: '#22c55e',
  important: '#a855f7',
  warning: '#f59e0b',
  caution: '#ef4444',
}

const ALL_TYPES: AlertType[] = [
  'note',
  'tip',
  'important',
  'warning',
  'caution',
]

export const AlertRenderer: FC<AlertRendererProps> = ({
  type,
  editable,
  onTypeChange,
}) => {
  const Icon = ALERT_ICONS[type]
  const label = ALERT_LABELS[type]

  if (!editable || !onTypeChange) {
    return (
      <div className="rr-alert-header" data-alert-type={type}>
        <Icon className="rr-alert-icon" />
        <span className="rr-alert-label">{label}</span>
      </div>
    )
  }

  return (
    <div className="rr-alert-header" data-alert-type={type}>
      <DropdownMenu>
        <DropdownMenuTrigger className="rr-alert-trigger">
          <Icon className="rr-alert-icon" />
          <span className="rr-alert-label">{label}</span>
          <ChevronDown className="rr-alert-chevron" />
        </DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={6} align="start">
          {ALL_TYPES.map((t) => {
            const ItemIcon = ALERT_ICONS[t]
            return (
              <DropdownMenuItem
                key={t}
                data-alert-type={t}
                onClick={() => onTypeChange(t)}
              >
                <ItemIcon
                  className="rr-alert-menu-icon"
                  style={{ color: ALERT_COLORS[t] }}
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

export default AlertRenderer
