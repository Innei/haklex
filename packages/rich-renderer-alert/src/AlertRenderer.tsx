import type { AlertRendererProps } from '@haklex/rich-editor/renderers';
import type { LucideProps } from 'lucide-react';
import { Info, Lightbulb, MessageSquareWarning, OctagonAlert, TriangleAlert } from 'lucide-react';
import type { FC } from 'react';

import * as css from './styles.css';

type AlertType = AlertRendererProps['type'];

export const ALERT_ICONS: Record<AlertType, FC<LucideProps>> = {
  note: Info,
  tip: Lightbulb,
  important: MessageSquareWarning,
  warning: TriangleAlert,
  caution: OctagonAlert,
};

export const ALERT_LABELS: Record<AlertType, string> = {
  note: 'Note',
  tip: 'Tip',
  important: 'Important',
  warning: 'Warning',
  caution: 'Caution',
};

export const ALL_TYPES: AlertType[] = ['note', 'tip', 'important', 'warning', 'caution'];

export const AlertRenderer: FC<AlertRendererProps> = ({ type }) => {
  const Icon = ALERT_ICONS[type];
  const label = ALERT_LABELS[type];

  return (
    <div
      className={`${css.alertHeader} ${css.alertType({ type })} ${css.semanticClassNames.header} ${css.semanticTypeClassNames.header[type]}`}
    >
      <Icon className={`${css.alertIcon} ${css.semanticClassNames.icon}`} />
      <span className={`${css.alertLabel} ${css.semanticClassNames.label}`}>{label}</span>
    </div>
  );
};

export default AlertRenderer;
