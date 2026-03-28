import {
  forwardRef,
  type TextareaHTMLAttributes,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

import { overflowing, textarea } from './styles.css';

export interface AutoResizeTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxRows?: number;
  minRows?: number;
}

export const AutoResizeTextArea = forwardRef<HTMLTextAreaElement, AutoResizeTextAreaProps>(
  function AutoResizeTextArea({ maxRows = 6, minRows = 1, className, onInput, ...props }, ref) {
    const innerRef = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => innerRef.current!);

    const resize = useCallback(() => {
      const el = innerRef.current;
      if (!el) return;

      el.style.height = 'auto';
      const lineHeight = Number.parseFloat(getComputedStyle(el).lineHeight) || 21;
      const maxHeight = lineHeight * maxRows + 16;
      const scrollHeight = el.scrollHeight;

      if (scrollHeight > maxHeight) {
        el.style.height = `${maxHeight}px`;
        el.classList.add(overflowing);
      } else {
        el.style.height = `${scrollHeight}px`;
        el.classList.remove(overflowing);
      }
    }, [maxRows]);

    useEffect(() => {
      resize();
    }, [resize, props.value]);

    return (
      <textarea
        className={`${textarea}${className ? ` ${className}` : ''}`}
        ref={innerRef}
        rows={minRows}
        onInput={(e) => {
          resize();
          onInput?.(e);
        }}
        {...props}
      />
    );
  },
);
