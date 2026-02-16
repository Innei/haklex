import {
  Info,
  Lightbulb,
  MessageSquareWarning,
  OctagonAlert,
  TriangleAlert,
} from 'lucide-react'
import type { FC } from 'react'

import type { AlertType } from '../../nodes/AlertQuoteNode'
import { ALERT_LABELS } from '../../nodes/AlertQuoteNode'

export interface AlertRendererProps {
  type: AlertType
  editable?: boolean
  onTypeChange?: (type: AlertType) => void
}

const InfoIcon = () => <Info size={16} />
const LightbulbIcon = () => <Lightbulb size={16} />
const MessageWarningIcon = () => <MessageSquareWarning size={16} />
const TriangleAlertIcon = () => <TriangleAlert size={16} />
const OctagonAlertIcon = () => <OctagonAlert size={16} />

const ALERT_ICONS: Record<AlertType, FC> = {
  note: InfoIcon,
  tip: LightbulbIcon,
  important: MessageWarningIcon,
  warning: TriangleAlertIcon,
  caution: OctagonAlertIcon,
}

export const AlertRenderer: FC<AlertRendererProps> = ({ type }) => {
  const Icon = ALERT_ICONS[type]

  return (
    <div className={`rich-alert-header rich-alert-header-${type}`}>
      <span className="rich-alert-icon">
        <Icon />
      </span>
      <span className="rich-alert-label">{ALERT_LABELS[type]}</span>
    </div>
  )
}
