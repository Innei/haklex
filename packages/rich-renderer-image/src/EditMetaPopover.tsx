import type { ImageDisplaySize } from '@haklex/rich-editor/nodes';
import type { LiveApply } from '@haklex/rich-editor-ui';
import {
  Field,
  Kbd,
  Popover,
  PopoverBody,
  PopoverFooter,
  PopoverHeader,
  PopoverPanel,
  PopoverTrigger,
  TextInput,
  useLiveEdit,
} from '@haklex/rich-editor-ui';
import { ImageIcon } from 'lucide-react';
import type { KeyboardEvent, ReactElement, ReactNode, RefObject } from 'react';
import { useEffect, useId, useRef, useState } from 'react';

import * as styles from './styles.css';

export interface ImageMetaValues {
  altText: string;
  caption: string;
  size: ImageDisplaySize;
  src: string;
}

export type ImageInspectorFocus = 'alt' | 'caption';

export interface ImageInspectorProps {
  focus?: ImageInspectorFocus | null;
  menu?: ReactNode;
  onApply: LiveApply<ImageMetaValues>;
  onKeyDown?: (event: KeyboardEvent) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  renderWidth?: (apply: (size: ImageDisplaySize) => void) => ReactNode;
  trigger: ReactElement;
  values: ImageMetaValues;
}

const UNSAFE_SRC_RE = /^(?:javascript\s*:|vbscript\s*:|data\s*:(?!image\/))/i;

export function isSafeImageSrc(src: string): boolean {
  return src.trim() !== '' && !UNSAFE_SRC_RE.test(src.trim());
}

export function ImageInspector({
  focus,
  menu,
  onApply,
  onKeyDown,
  onOpenChange,
  open,
  renderWidth,
  trigger,
  values,
}: ImageInspectorProps) {
  const id = useId();
  const altRef = useRef<HTMLInputElement>(null);
  const captionRef = useRef<HTMLInputElement>(null);
  const [altText, setAltText] = useState(values.altText);
  const [caption, setCaption] = useState(values.caption);
  const [src, setSrc] = useState(values.src);
  const { apply, revert } = useLiveEdit(values, open, onApply);

  useEffect(() => {
    if (!open) return;
    setAltText(values.altText);
    setCaption(values.caption);
    setSrc(values.src);
  }, [open]);

  const srcInvalid = !isSafeImageSrc(src);
  const initialFocus: RefObject<HTMLInputElement | null> | undefined =
    focus === 'caption' ? captionRef : focus === 'alt' ? altRef : undefined;

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen, details) => {
        if (!nextOpen && details?.reason === 'escape-key') revert();
        onOpenChange(nextOpen);
      }}
    >
      <PopoverTrigger render={trigger} />
      <PopoverPanel
        flush
        className={`${styles.inspector} ${styles.semanticClassNames.inspector}`}
        initialFocus={initialFocus}
        side="bottom"
        size="md"
        onKeyDown={onKeyDown}
      >
        <PopoverHeader actions={menu} icon={<ImageIcon />} title="Image" />
        <PopoverBody>
          {renderWidth?.((size) => apply({ size }))}
          <Field id={`${id}-alt`} label="Alt text">
            <TextInput
              id={`${id}-alt`}
              placeholder="Describe the image"
              ref={altRef}
              value={altText}
              onChange={(event) => {
                setAltText(event.target.value);
                apply({ altText: event.target.value });
              }}
            />
          </Field>
          <Field hint="Optional" id={`${id}-caption`} label="Caption">
            <TextInput
              id={`${id}-caption`}
              ref={captionRef}
              value={caption}
              onChange={(event) => {
                setCaption(event.target.value);
                apply({ caption: event.target.value });
              }}
            />
          </Field>
          <Field
            error={srcInvalid ? 'Enter an image URL' : undefined}
            id={`${id}-src`}
            label="Source URL"
          >
            <TextInput
              aria-describedby={srcInvalid ? `${id}-src-error` : undefined}
              id={`${id}-src`}
              invalid={srcInvalid}
              type="url"
              value={src}
              onChange={(event) => {
                setSrc(event.target.value);
                if (isSafeImageSrc(event.target.value)) apply({ src: event.target.value.trim() });
              }}
            />
          </Field>
        </PopoverBody>
        <PopoverFooter hint="Changes apply as you type">
          <Kbd keys="Esc" size="sm" tone="muted" />
          <span className={styles.footerNote}>revert</span>
        </PopoverFooter>
      </PopoverPanel>
    </Popover>
  );
}
