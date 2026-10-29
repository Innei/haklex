import {
  ActionButton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  getActionButtonClassName,
  Kbd,
} from '@haklex/rich-editor-ui';
import { CheckCheck, ChevronLeft, ChevronRight, Sparkles, XCircle } from 'lucide-react';
import type { ReactElement, Ref } from 'react';

import {
  reviewBar,
  reviewBarIcon,
  reviewBarKbd,
  reviewBarPosition,
  reviewBarSeparator,
  reviewBarTitle,
} from './diff-review-overlay.css';

export interface DiffReviewBarProps {
  canNavigate: boolean;
  onAccept: () => void;
  onAcceptAll: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onReject: () => void;
  onRejectAll: () => void;
  pendingCount: number;
  position: number;
  ref?: Ref<HTMLDivElement>;
  total: number;
}

export function DiffReviewBar({
  canNavigate,
  onAccept,
  onAcceptAll,
  onNext,
  onPrevious,
  onReject,
  onRejectAll,
  pendingCount,
  position,
  ref,
  total,
}: DiffReviewBarProps): ReactElement {
  const hasCurrent = canNavigate && position > 0;
  const countLabel = canNavigate
    ? `${position} / ${total}`
    : `${pendingCount} change${pendingCount === 1 ? '' : 's'}`;

  return (
    <div aria-label="AI review" className={reviewBar} ref={ref} role="toolbar">
      <Sparkles className={reviewBarIcon} size={14} />
      <span className={reviewBarTitle}>AI review</span>
      <span aria-hidden className={reviewBarSeparator} />
      <ActionButton
        icon
        aria-label="Previous change"
        disabled={!canNavigate}
        size="sm"
        title="Previous change (⌥↑)"
        onClick={onPrevious}
      >
        <ChevronLeft />
      </ActionButton>
      <span aria-live="polite" className={reviewBarPosition}>
        {countLabel}
      </span>
      <ActionButton
        icon
        aria-label="Next change"
        disabled={!canNavigate}
        size="sm"
        title="Next change (⌥↓)"
        onClick={onNext}
      >
        <ChevronRight />
      </ActionButton>
      <span aria-hidden className={reviewBarSeparator} />
      <ActionButton
        disabled={!hasCurrent}
        size="sm"
        title="Reject this change"
        variant="outline"
        onClick={onReject}
      >
        Reject
        <Kbd className={reviewBarKbd} keys="Mod+Backspace" size="sm" tone="muted" />
      </ActionButton>
      <ActionButton
        disabled={!hasCurrent}
        size="sm"
        title="Accept this change"
        variant="solid"
        onClick={onAccept}
      >
        Accept
        <Kbd className={reviewBarKbd} keys="Mod+Enter" size="sm" tone="inverted" />
      </ActionButton>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={getActionButtonClassName({ size: 'sm', level: 3 })}
          title="Resolve all changes"
        >
          All…
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" sideOffset={8}>
          <DropdownMenuItem variant="destructive" onClick={onRejectAll}>
            <XCircle />
            Reject all
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onAcceptAll}>
            <CheckCheck />
            Accept all
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
