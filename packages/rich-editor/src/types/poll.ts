export type PollMode = 'single' | 'multiple';

export type PollShowResults = 'always' | 'after-vote' | 'after-close';

export interface PollOption {
  id: string;
  label: string;
}

export interface PollState {
  canVote: boolean;
  closed: boolean;
  errorMessage?: string;
  status: 'loading' | 'ready' | 'error';
  tallies: Record<string, number>;
  totalVotes: number;
  userVote?: string[];
}

export interface PollDataAdapter {
  usePollState: (pollId: string) => PollState;
  useSubmit: (pollId: string) => (optionIds: string[]) => Promise<void>;
}

export interface PollMetadata {
  closeAt?: string;
  mode: PollMode;
  options: PollOption[];
  pollId: string;
  question: string;
  showResults?: PollShowResults;
}

export interface PollRendererProps {
  closeAt?: string;
  mode: PollMode;
  options: PollOption[];
  pollId: string;
  question: string;
  showResults?: PollShowResults;
}
