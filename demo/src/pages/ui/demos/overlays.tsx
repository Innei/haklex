import {
  ActionButton,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
  getActionButtonClassName,
  Popover,
  PopoverDescription,
  PopoverPanel,
  PopoverTitle,
  PopoverTrigger,
  TooltipContent,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from '@haklex/rich-editor-ui';
import { Bold } from 'lucide-react';

import { usePinnedOpen } from '../../../components/preview/ThemeFrame';
import type { ComponentDemo } from '../../components/types';

export const triggerClass = getActionButtonClassName({ variant: 'outline', size: 'md' });

const noStates = 'No states beyond open and closed. The preview shows the open popup.';

export const dialogDemo: ComponentDemo = {
  note: 'Dialog centers in the viewport and DialogPopup takes no portal container, so it cannot open inside a frame. Open one theme at a time.',
  statesNote: noStates,
  Preview: () => (
    <div className="demo-center">
      <Dialog>
        <DialogTrigger className={triggerClass}>Open dialog</DialogTrigger>
        <DialogPopup>
          <DialogHeader>
            <DialogTitle>Rename document</DialogTitle>
            <DialogDescription>The new title shows in the sidebar and the URL.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose className={getActionButtonClassName({ variant: 'ghost' })}>
              Cancel
            </DialogClose>
            <DialogClose className={getActionButtonClassName({ variant: 'accent' })}>
              Rename
            </DialogClose>
          </DialogFooter>
        </DialogPopup>
      </Dialog>
    </div>
  ),
};

function PopoverPreview() {
  const pinned = usePinnedOpen();
  return (
    <div className="demo-top">
      <Popover {...pinned}>
        <PopoverTrigger className={triggerClass}>Link settings</PopoverTrigger>
        <PopoverPanel align="start" className="demo-popover">
          <PopoverTitle>Open in new tab</PopoverTitle>
          <PopoverDescription>
            Links to other sites open in a new tab by default.
          </PopoverDescription>
        </PopoverPanel>
      </Popover>
    </div>
  );
}

export const popoverDemo: ComponentDemo = {
  stageClassName: 'stage-tall',
  statesNote: noStates,
  Preview: PopoverPreview,
};

const fruits = ['Apple', 'Apricot', 'Banana', 'Blueberry', 'Cherry'];

function ComboboxInstance({ initial }: { initial: string }) {
  const pinned = usePinnedOpen();
  return (
    <Combobox defaultInputValue={initial} items={fruits} {...pinned}>
      <ComboboxInput className="demo-field" placeholder="Pick a fruit" />
      <ComboboxContent>
        <ComboboxEmpty>No matches</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export const comboboxDemo: ComponentDemo = {
  stageClassName: 'stage-tall',
  statesNote: 'Filtered list and the empty state.',
  Preview: () => (
    <div className="demo-top">
      <ComboboxInstance initial="" />
    </div>
  ),
  States: () => (
    <div className="demo-row demo-row-tall">
      <ComboboxInstance initial="ap" />
      <ComboboxInstance initial="zz" />
    </div>
  ),
};

export const tooltipDemo: ComponentDemo = {
  statesNote: noStates,
  Preview: () => (
    <div className="demo-center">
      <TooltipProvider>
        <TooltipRoot open>
          <TooltipTrigger
            render={
              <ActionButton icon aria-label="Bold" variant="ghost">
                <Bold />
              </ActionButton>
            }
          />
          <TooltipContent shortcut="Mod+B">Bold</TooltipContent>
        </TooltipRoot>
      </TooltipProvider>
    </div>
  ),
};
