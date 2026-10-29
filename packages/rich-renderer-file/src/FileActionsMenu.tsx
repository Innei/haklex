import {
  ActionButton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  toast,
} from '@haklex/rich-editor-ui';
import { Download, Ellipsis, Link2, Trash2 } from 'lucide-react';
import { useCallback } from 'react';

interface FileActionsMenuProps {
  name: string;
  onDelete: () => void;
  src?: string;
}

export function FileActionsMenu({ name, onDelete, src }: FileActionsMenuProps) {
  const handleCopyLink = useCallback(() => {
    if (!src) return;
    void navigator.clipboard?.writeText(src).then(
      () => toast({ title: 'Link copied', tone: 'success' }),
      () => toast({ title: 'Could not copy link', tone: 'error' }),
    );
  }, [src]);

  const handleDownload = useCallback(() => {
    if (!src) return;
    const anchor = document.createElement('a');
    anchor.href = src;
    anchor.download = name;
    anchor.rel = 'noopener noreferrer';
    anchor.target = '_blank';
    anchor.click();
  }, [src, name]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<ActionButton icon aria-label="More actions" size="md" />}>
        <Ellipsis />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled={!src} onClick={handleCopyLink}>
          <Link2 />
          Copy link
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!src} onClick={handleDownload}>
          <Download />
          Download
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2 />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
