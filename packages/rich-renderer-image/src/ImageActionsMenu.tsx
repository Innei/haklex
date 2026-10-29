import {
  ActionButton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  toast,
} from '@haklex/rich-editor-ui';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { UNDO_COMMAND } from 'lexical';
import { CopyPlus, Download, Ellipsis, ExternalLink, Trash2 } from 'lucide-react';

import { stopMouseDown } from './ToolbarButton';
import { useImageActions } from './useImageActions';

interface ImageActionsMenuProps {
  onOpenChange?: (open: boolean) => void;
}

export function ImageActionsMenu({ onOpenChange }: ImageActionsMenuProps) {
  const [editor] = useLexicalComposerContext();
  const { handleDuplicate, handleOpen, handleDownload, handleDelete } = useImageActions();

  const deleteImage = () => {
    handleDelete();
    toast({
      title: 'Image deleted',
      action: {
        label: 'Undo',
        onClick: () => editor.dispatchCommand(UNDO_COMMAND, undefined),
      },
    });
  };

  return (
    <DropdownMenu onOpenChange={(open) => onOpenChange?.(open)}>
      <DropdownMenuTrigger
        render={
          <ActionButton icon aria-label="More actions" size="md" onMouseDown={stopMouseDown} />
        }
      >
        <Ellipsis />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleDuplicate}>
          <CopyPlus />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleOpen}>
          <ExternalLink />
          Open original
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownload}>
          <Download />
          Download
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem shortcut="Backspace" variant="destructive" onClick={deleteImage}>
          <Trash2 />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
