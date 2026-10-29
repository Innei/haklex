import {
  ColorPicker,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@haklex/rich-editor-ui';
import type { TextFormatType } from 'lexical';
import {
  Bold,
  Code,
  Ellipsis,
  EyeOff,
  Highlighter,
  Italic,
  Languages,
  Link as LinkIcon,
  RemoveFormatting,
  Strikethrough,
  Subscript,
  Superscript,
  Underline,
} from 'lucide-react';
import type { ReactNode } from 'react';

import type { ToolbarState } from './selection-state';
import * as css from './styles.css';
import type { ToolbarTooltipHandle } from './ToolbarButton';
import { ToolbarButton } from './ToolbarButton';

const ICON = { size: 16, strokeWidth: 2 } as const;

interface FormatBarProps {
  actions?: ReactNode;
  handle: ToolbarTooltipHandle;
  onBackgroundColor: (value: string) => void;
  onClearFormatting: () => void;
  onColor: (value: string) => void;
  onFormat: (format: TextFormatType) => void;
  onLink: () => void;
  onRuby: () => void;
  onSpoiler: () => void;
  state: ToolbarState;
}

const MARKS: { format: TextFormatType; icon: ReactNode; label: string; shortcut?: string }[] = [
  { format: 'bold', label: 'Bold', shortcut: 'Mod+B', icon: <Bold {...ICON} /> },
  { format: 'italic', label: 'Italic', shortcut: 'Mod+I', icon: <Italic {...ICON} /> },
  { format: 'underline', label: 'Underline', shortcut: 'Mod+U', icon: <Underline {...ICON} /> },
  { format: 'strikethrough', label: 'Strikethrough', icon: <Strikethrough {...ICON} /> },
];

const STATE_KEY: Partial<Record<TextFormatType, keyof ToolbarState>> = {
  bold: 'isBold',
  italic: 'isItalic',
  underline: 'isUnderline',
  strikethrough: 'isStrikethrough',
};

function Separator() {
  return <span aria-hidden className={css.separator} />;
}

export function FormatBar({
  actions,
  handle,
  onBackgroundColor,
  onClearFormatting,
  onColor,
  onFormat,
  onLink,
  onRuby,
  onSpoiler,
  state,
}: FormatBarProps) {
  return (
    <>
      {MARKS.map((mark) => (
        <ToolbarButton
          active={Boolean(state[STATE_KEY[mark.format]!])}
          handle={handle}
          key={mark.format}
          label={mark.label}
          shortcut={mark.shortcut}
          onClick={() => onFormat(mark.format)}
        >
          {mark.icon}
        </ToolbarButton>
      ))}

      <Separator />

      <ToolbarButton
        active={state.isCode}
        handle={handle}
        label="Inline code"
        onClick={() => onFormat('code')}
      >
        <Code {...ICON} />
      </ToolbarButton>
      <ToolbarButton
        active={state.isHighlight}
        handle={handle}
        label="Highlight"
        onClick={() => onFormat('highlight')}
      >
        <Highlighter {...ICON} />
      </ToolbarButton>
      <ToolbarButton active={state.isSpoiler} handle={handle} label="Spoiler" onClick={onSpoiler}>
        <EyeOff {...ICON} />
      </ToolbarButton>

      <Separator />

      <ToolbarButton
        active={state.isLink}
        handle={handle}
        label="Link"
        shortcut="Mod+K"
        onClick={onLink}
      >
        <LinkIcon {...ICON} />
      </ToolbarButton>
      <ToolbarButton active={state.isRuby} handle={handle} label="Ruby" onClick={onRuby}>
        <Languages {...ICON} />
      </ToolbarButton>

      <Separator />

      <ColorPicker
        className={css.colorTrigger}
        currentBackground={state.backgroundColor}
        currentColor={state.fontColor || 'inherit'}
        tooltip="Text color"
        onSelect={onColor}
        onSelectBackground={onBackgroundColor}
      />

      <DropdownMenu modal={false}>
        <ToolbarButton
          handle={handle}
          label="More formatting"
          render={
            <DropdownMenuTrigger
              render={
                <button className={css.btn} type="button" onMouseDown={(e) => e.preventDefault()} />
              }
            />
          }
          onClick={() => {}}
        >
          <Ellipsis {...ICON} />
        </ToolbarButton>
        <DropdownMenuContent align="end" positionMethod="fixed" sideOffset={8}>
          <DropdownMenuCheckboxItem
            checked={state.isSuperscript}
            onCheckedChange={() => onFormat('superscript')}
          >
            <Superscript {...ICON} />
            Superscript
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={state.isSubscript}
            onCheckedChange={() => onFormat('subscript')}
          >
            <Subscript {...ICON} />
            Subscript
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onClearFormatting}>
            <RemoveFormatting {...ICON} />
            Clear formatting
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {actions && (
        <>
          <Separator />
          {actions}
        </>
      )}
    </>
  );
}
