import type { FC, SVGProps } from 'react'

import type { AlertType } from '../../nodes/AlertQuoteNode'
import { ALERT_LABELS } from '../../nodes/AlertQuoteNode'

export interface AlertRendererProps {
  type: AlertType
  editable?: boolean
  onTypeChange?: (type: AlertType) => void
}

const svgBase: SVGProps<SVGSVGElement> = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const InfoIcon = () => (
  <svg {...svgBase}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
)

const LightbulbIcon = () => (
  <svg {...svgBase}>
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </svg>
)

const MessageWarningIcon = () => (
  <svg {...svgBase}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M12 7v2" />
    <path d="M12 13h.01" />
  </svg>
)

const TriangleAlertIcon = () => (
  <svg {...svgBase}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
)

const OctagonAlertIcon = () => (
  <svg {...svgBase}>
    <path d="M12 16h.01" />
    <path d="M12 8v4" />
    <path d="M15.312 2H8.688L2 8.688v6.624L8.688 22h6.624L22 15.312V8.688z" />
  </svg>
)

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
