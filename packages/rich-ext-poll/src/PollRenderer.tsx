import { useCallback, useMemo, useState } from 'react';

import { pollClasses } from './poll.css';
import { useInitialPollState, usePollDataAdapter } from './PollDataContext';
import type {
  PollDataAdapter,
  PollOption,
  PollRendererProps,
  PollShowResults,
  PollState,
} from './types';

function shouldShowTallies(state: PollState, showResults?: PollShowResults): boolean {
  if (showResults === 'after-vote') return state.userVote !== undefined || state.closed;
  if (showResults === 'after-close') return state.closed;
  return true;
}

function classNames(...names: Array<string | false | undefined>): string {
  return names.filter((n): n is string => Boolean(n)).join(' ');
}

function PollStaticFallback({ question, options }: PollRendererProps) {
  return (
    <div className={pollClasses.container}>
      <p className={pollClasses.question}>{question}</p>
      <ul className={pollClasses.optionList}>
        {options.map((option) => (
          <li className={pollClasses.option} key={option.id}>
            <div className={pollClasses.optionRow}>
              <span className={pollClasses.optionLabel}>{option.label}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface PollInteractiveProps {
  adapter: PollDataAdapter;
  closeAt?: string;
  mode: 'single' | 'multiple';
  options: PollOption[];
  pollId: string;
  question: string;
  showResults?: PollShowResults;
}

function PollInteractive({
  adapter,
  closeAt,
  mode,
  options,
  pollId,
  question,
  showResults,
}: PollInteractiveProps) {
  const initialState = useInitialPollState(pollId);
  const liveState = adapter.usePollState(pollId);
  const submit = adapter.useSubmit(pollId);
  const state: PollState = liveState ??
    initialState ?? {
      tallies: {},
      totalVotes: 0,
      status: 'loading',
      closed: false,
      canVote: false,
    };

  const [pendingSelection, setPendingSelection] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showTallies = shouldShowTallies(state, showResults);
  const userVoted = state.userVote !== undefined;
  const isClosed = state.closed;
  const canInteract = !userVoted && !isClosed && state.canVote && state.status !== 'loading';

  const tallyShare = useCallback(
    (optionId: string): number => {
      if (!showTallies || state.totalVotes <= 0) return 0;
      const tally = state.tallies[optionId] ?? 0;
      return Math.max(0, Math.min(1, tally / state.totalVotes));
    },
    [showTallies, state.tallies, state.totalVotes],
  );

  const handleSingleClick = useCallback(
    async (optionId: string) => {
      if (!canInteract || isSubmitting) return;
      setIsSubmitting(true);
      try {
        await submit([optionId]);
      } finally {
        setIsSubmitting(false);
      }
    },
    [canInteract, isSubmitting, submit],
  );

  const handleMultiToggle = useCallback(
    (optionId: string) => {
      if (!canInteract || isSubmitting) return;
      setPendingSelection((prev) =>
        prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId],
      );
    },
    [canInteract, isSubmitting],
  );

  const handleMultiSubmit = useCallback(async () => {
    if (!canInteract || isSubmitting || pendingSelection.length === 0) return;
    setIsSubmitting(true);
    try {
      await submit([...pendingSelection]);
    } finally {
      setIsSubmitting(false);
    }
  }, [canInteract, isSubmitting, pendingSelection, submit]);

  const metaLabel = useMemo(() => {
    const parts: string[] = [mode === 'single' ? 'Single choice' : 'Multiple choice'];
    if (isClosed) parts.push('Voting closed');
    else if (userVoted) parts.push('Voted');
    return parts.join(' · ');
  }, [mode, isClosed, userVoted]);

  if (state.status === 'loading') {
    return (
      <div className={pollClasses.container}>
        <p className={pollClasses.meta}>{metaLabel}</p>
        <p className={pollClasses.question}>{question}</p>
        <ul className={pollClasses.optionList}>
          {options.map((option) => (
            <li className={pollClasses.skeleton} key={option.id} />
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className={pollClasses.container}>
      <p className={pollClasses.meta}>{metaLabel}</p>
      <p className={pollClasses.question}>{question}</p>
      <ul className={pollClasses.optionList}>
        {options.map((option) => {
          const isUserChoice = state.userVote?.includes(option.id) ?? false;
          const isPending = pendingSelection.includes(option.id);
          const tintWidth = (() => {
            if (canInteract && mode === 'multiple' && isPending) return 1;
            return tallyShare(option.id);
          })();
          const tintShouldBeActive = isUserChoice || isPending;
          const labelHighlighted = isUserChoice || isPending;

          const handleClick = canInteract
            ? mode === 'single'
              ? () => handleSingleClick(option.id)
              : () => handleMultiToggle(option.id)
            : undefined;

          return (
            <li
              key={option.id}
              className={classNames(
                pollClasses.option,
                canInteract ? pollClasses.optionInteractive : pollClasses.optionDisabled,
                labelHighlighted && pollClasses.optionSelected,
              )}
              onClick={handleClick}
              {...(canInteract
                ? {
                    role: 'button',
                    tabIndex: 0,
                    onKeyDown: (event: React.KeyboardEvent<HTMLLIElement>) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleClick?.();
                      }
                    },
                  }
                : {})}
            >
              <span
                aria-hidden
                style={{ width: `${tintWidth * 100}%` }}
                className={classNames(
                  pollClasses.tint,
                  tintShouldBeActive && pollClasses.tintActive,
                )}
              />
              <div className={pollClasses.optionRow}>
                <span className={pollClasses.optionLabel}>
                  {labelHighlighted && '✓ '}
                  {option.label}
                </span>
                {showTallies && (userVoted || isClosed) ? (
                  <span
                    className={classNames(
                      pollClasses.optionPct,
                      labelHighlighted && pollClasses.optionPctActive,
                    )}
                  >
                    {Math.round(tallyShare(option.id) * 100)}%
                  </span>
                ) : canInteract && mode === 'single' ? (
                  <span className={pollClasses.hint}>Click to vote</span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      {canInteract && mode === 'multiple' && (
        <button
          disabled={pendingSelection.length === 0 || isSubmitting}
          type="button"
          className={classNames(
            pollClasses.submit,
            pendingSelection.length > 0 && !isSubmitting && pollClasses.submitActive,
          )}
          onClick={handleMultiSubmit}
        >
          {isSubmitting
            ? 'Submitting…'
            : pendingSelection.length > 0
              ? `Submit ${pendingSelection.length} ${pendingSelection.length === 1 ? 'item' : 'items'}`
              : 'Submit (select at least one)'}
        </button>
      )}
      <div className={pollClasses.footer}>
        {(userVoted || isClosed) && state.totalVotes > 0 ? (
          <span>
            {state.totalVotes.toLocaleString()} {state.totalVotes === 1 ? 'vote' : 'votes'}
          </span>
        ) : (
          <span />
        )}
        {closeAt && !isClosed ? <span>Closes {closeAt}</span> : null}
      </div>
      {state.status === 'error' && state.errorMessage ? (
        <p className={pollClasses.errorMessage}>{state.errorMessage}</p>
      ) : !state.canVote && !userVoted && !isClosed && state.errorMessage ? (
        <p className={pollClasses.errorMessage}>{state.errorMessage}</p>
      ) : null}
    </div>
  );
}

export function PollRenderer(props: PollRendererProps) {
  const adapter = usePollDataAdapter();
  if (!adapter) return <PollStaticFallback {...props} />;
  return <PollInteractive adapter={adapter} {...props} />;
}
