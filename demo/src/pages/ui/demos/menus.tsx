import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@haklex/rich-editor-ui';
import { Copy, CopyPlus, FolderInput } from 'lucide-react';
import { useState } from 'react';

import { Force, highlighted } from '../../../components/preview/States';
import { usePinnedOpen } from '../../../components/preview/ThemeFrame';
import type { ComponentDemo } from '../../components/types';
import { triggerClass } from './overlays';

function DropdownPreview() {
  const pinned = usePinnedOpen();
  const [outline, setOutline] = useState(true);
  const [layout, setLayout] = useState('article');
  return (
    <div className="demo-top">
      <DropdownMenu modal={false} {...pinned}>
        <DropdownMenuTrigger className={triggerClass}>Options</DropdownMenuTrigger>
        <DropdownMenuContent className="demo-menu">
          <DropdownMenuItem>
            <Copy />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CopyPlus />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <FolderInput />
            Move to…
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>View</DropdownMenuLabel>
            <DropdownMenuCheckboxItem checked={outline} onCheckedChange={setOutline}>
              Show outline
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
          <DropdownMenuRadioGroup value={layout} onValueChange={setLayout}>
            <DropdownMenuRadioItem value="article">Article</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="note">Note</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function DropdownStates() {
  const pinned = usePinnedOpen();
  return (
    <div className="demo-top">
      <DropdownMenu modal={false} {...pinned}>
        <DropdownMenuTrigger className={triggerClass}>States</DropdownMenuTrigger>
        <DropdownMenuContent className="demo-menu">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Group label</DropdownMenuLabel>
            <DropdownMenuItem>Idle</DropdownMenuItem>
            <Force attrs={highlighted}>
              <DropdownMenuItem>Highlighted</DropdownMenuItem>
            </Force>
            <DropdownMenuCheckboxItem checked>Checked</DropdownMenuCheckboxItem>
            <DropdownMenuItem disabled>Disabled</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value="on">
            <DropdownMenuRadioItem value="on">Radio selected</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="off">Radio idle</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export const dropdownMenuDemo: ComponentDemo = {
  stageClassName: 'stage-tall',
  statesNote:
    'One item in each state. Highlighted is forced with the data-highlighted attribute Base UI sets on hover and arrow keys.',
  Preview: DropdownPreview,
  States: DropdownStates,
};

const languages = {
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  rust: 'Rust',
  go: 'Go',
  python: 'Python',
};

function SelectPreview() {
  const pinned = usePinnedOpen();
  const [value, setValue] = useState('typescript');
  return (
    <div className="demo-top">
      <Select
        items={languages}
        modal={false}
        value={value}
        onValueChange={(v) => setValue(v as string)}
        {...pinned}
      >
        <SelectTrigger className="demo-field">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start" alignItemWithTrigger={false}>
          <SelectGroup>
            <SelectGroupLabel>Web</SelectGroupLabel>
            <SelectItem value="typescript">TypeScript</SelectItem>
            <SelectItem value="javascript">JavaScript</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectGroupLabel>Systems</SelectGroupLabel>
            <SelectItem value="rust">Rust</SelectItem>
            <SelectItem value="go">Go</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function SelectStates() {
  const pinned = usePinnedOpen();
  return (
    <div className="demo-top">
      <Select items={languages} modal={false} value="rust" {...pinned}>
        <SelectTrigger className="demo-field">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start" alignItemWithTrigger={false}>
          <SelectItem value="typescript">Idle</SelectItem>
          <Force attrs={highlighted}>
            <SelectItem value="javascript">Highlighted</SelectItem>
          </Force>
          <SelectItem value="rust">Selected</SelectItem>
          <SelectItem disabled value="go">
            Disabled
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export const selectDemo: ComponentDemo = {
  stageClassName: 'stage-tall',
  statesNote: 'One option in each state. Highlighted is forced with data-highlighted.',
  Preview: SelectPreview,
  States: SelectStates,
};
