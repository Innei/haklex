import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  getActionButtonClassName,
} from '@haklex/rich-editor-ui';
import { ChevronDown, Copy, Download, Ellipsis, RotateCcw } from 'lucide-react';
import type { FC } from 'react';

import { MERMAID_TEMPLATES } from './templates';

export interface MermaidHeaderMenusProps {
  canDownload: boolean;
  canReset: boolean;
  onCopy: () => void;
  onDownload: () => void;
  onReset: () => void;
  onTemplate: (code: string) => void;
}

export const MermaidHeaderMenus: FC<MermaidHeaderMenusProps> = ({
  canDownload,
  canReset,
  onCopy,
  onDownload,
  onReset,
  onTemplate,
}) => (
  <>
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Templates"
        className={getActionButtonClassName({ size: 'md' })}
      >
        Templates
        <ChevronDown />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {MERMAID_TEMPLATES.map((tpl) => (
          <DropdownMenuItem key={tpl.label} onClick={() => onTemplate(tpl.code)}>
            {tpl.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="More actions"
        className={getActionButtonClassName({ size: 'md' })}
      >
        <Ellipsis />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onCopy}>
          <Copy />
          Copy code
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!canDownload} onClick={onDownload}>
          <Download />
          Download SVG
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!canReset} onClick={onReset}>
          <RotateCcw />
          Reset
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </>
);
