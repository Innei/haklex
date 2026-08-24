import type { LexicalCommand } from 'lexical';
import { createCommand } from 'lexical';

export const OPEN_FILE_PICKER_COMMAND: LexicalCommand<void> = createCommand(
  'OPEN_FILE_PICKER_COMMAND',
);
