import { ArrowLeft, Pipette } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import {
  clamp,
  hexToHsva,
  type HSVA,
  hsvaToHex,
  huePreviewHex,
  parseHex,
  rgbToHsv,
} from './color-math';
import * as css from './styles.css';

interface PickerViewProps {
  initialColor: string;
  onApply: (hex: string) => void;
  onBack: () => void;
  onCancel: () => void;
}

type PointerTarget = 'sat' | 'hue' | 'alpha';

interface EyeDropperConstructor {
  new (): { open: () => Promise<{ sRGBHex: string }> };
}

const FALLBACK: HSVA = { h: 0, s: 0, v: 0, a: 1 };

function seedHsva(input: string): HSVA {
  if (!input || input === 'inherit' || input === 'currentColor') return FALLBACK;
  return hexToHsva(input) ?? FALLBACK;
}

export function PickerView({ initialColor, onApply, onCancel, onBack }: PickerViewProps) {
  const [hsva, setHsva] = useState<HSVA>(() => seedHsva(initialColor));
  const [hexDraft, setHexDraft] = useState<string>(() => hsvaToHex(seedHsva(initialColor)));
  const [hexInvalid, setHexInvalid] = useState(false);
  const [hasEyeDropper, setHasEyeDropper] = useState(false);

  const oldColorRef = useRef(initialColor);
  const satRef = useRef<HTMLDivElement | null>(null);
  const hueRef = useRef<HTMLDivElement | null>(null);
  const alphaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setHasEyeDropper(
      typeof window !== 'undefined' && 'EyeDropper' in (window as unknown as object),
    );
  }, []);

  useEffect(() => {
    if (document.activeElement?.tagName !== 'INPUT') {
      setHexDraft(hsvaToHex(hsva));
      setHexInvalid(false);
    }
  }, [hsva]);

  const currentHex = hsvaToHex(hsva);

  const updateFromPointer = (target: PointerTarget, ev: PointerEvent | React.PointerEvent) => {
    const el =
      target === 'sat' ? satRef.current : target === 'hue' ? hueRef.current : alphaRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clamp((ev.clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((ev.clientY - rect.top) / rect.height, 0, 1);

    setHsva((prev) => {
      if (target === 'sat') return { ...prev, s: x, v: 1 - y };
      if (target === 'hue') return { ...prev, h: x * 360 };
      return { ...prev, a: x };
    });
  };

  const startDrag = (target: PointerTarget) => (ev: React.PointerEvent) => {
    ev.preventDefault();
    (ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);
    updateFromPointer(target, ev);
  };

  const onMove = (target: PointerTarget) => (ev: React.PointerEvent) => {
    if (ev.buttons === 0) return;
    updateFromPointer(target, ev);
  };

  const onHexChange = (value: string) => {
    setHexDraft(value);
    const parsed = parseHex(value);
    if (!parsed) {
      setHexInvalid(true);
      return;
    }
    setHexInvalid(false);
    const { h, s, v } = rgbToHsv(parsed.r, parsed.g, parsed.b);
    setHsva({ h, s, v, a: parsed.a });
  };

  const onHexBlur = () => {
    if (hexInvalid) {
      setHexDraft(currentHex);
      setHexInvalid(false);
    }
  };

  const openEyeDropper = async () => {
    const Ctor = (window as unknown as { EyeDropper?: EyeDropperConstructor }).EyeDropper;
    if (!Ctor) return;
    try {
      const result = await new Ctor().open();
      const parsed = parseHex(result.sRGBHex);
      if (!parsed) return;
      const { h, s, v } = rgbToHsv(parsed.r, parsed.g, parsed.b);
      setHsva((prev) => ({ h, s, v, a: prev.a }));
    } catch {
      // User cancelled — ignore
    }
  };

  const handleApply = () => onApply(currentHex);

  const hueHex = huePreviewHex(hsva.h);
  const previewNewCss = hsvaToHex(hsva);
  const previewOldCss =
    oldColorRef.current === 'inherit' || !oldColorRef.current ? 'transparent' : oldColorRef.current;

  return (
    <div className={css.pickerView}>
      <button
        aria-label="Back to presets"
        className={css.backButton}
        type="button"
        onClick={onBack}
        onMouseDown={(e) => e.preventDefault()}
      >
        <ArrowLeft className={css.backIcon} />
        <span>Back</span>
      </button>

      <div
        className={css.satSquare}
        ref={satRef}
        style={{ backgroundColor: hueHex }}
        onPointerDown={startDrag('sat')}
        onPointerMove={onMove('sat')}
      >
        <div className={css.satOverlayX} />
        <div className={css.satOverlayY} />
        <div
          className={css.satThumb}
          style={{
            left: `${hsva.s * 100}%`,
            top: `${(1 - hsva.v) * 100}%`,
            backgroundColor: hsvaToHex({ ...hsva, a: 1 }),
          }}
        />
      </div>

      <div
        className={css.hueTrack}
        ref={hueRef}
        onPointerDown={startDrag('hue')}
        onPointerMove={onMove('hue')}
      >
        <div
          className={css.sliderThumb}
          style={{ left: `${(hsva.h / 360) * 100}%`, backgroundColor: hueHex }}
        />
      </div>

      <div
        className={css.alphaTrack}
        ref={alphaRef}
        onPointerDown={startDrag('alpha')}
        onPointerMove={onMove('alpha')}
      >
        <div
          className={css.alphaGradient}
          style={{
            background: `linear-gradient(to right, transparent, ${hsvaToHex({ ...hsva, a: 1 })})`,
          }}
        />
        <div
          className={css.sliderThumb}
          style={{ left: `${hsva.a * 100}%`, backgroundColor: currentHex }}
        />
      </div>

      <div className={css.hexRow}>
        <input
          aria-invalid={hexInvalid || undefined}
          aria-label="Hex color"
          className={`${css.hexInput}${hexInvalid ? ` ${css.hexInputInvalid}` : ''}`}
          spellCheck={false}
          type="text"
          value={hexDraft}
          onBlur={onHexBlur}
          onChange={(e) => onHexChange(e.target.value)}
        />
        {hasEyeDropper && (
          <button
            aria-label="Pick color from screen"
            className={css.iconButton}
            type="button"
            onClick={openEyeDropper}
            onMouseDown={(e) => e.preventDefault()}
          >
            <Pipette className={css.icon} />
          </button>
        )}
        <div aria-hidden className={css.previewPair}>
          <div className={css.previewCell} style={{ backgroundColor: previewOldCss }} />
          <div className={css.previewCell} style={{ backgroundColor: previewNewCss }} />
        </div>
      </div>

      <div className={css.actionRow}>
        <button
          className={css.actionButton}
          type="button"
          onClick={onCancel}
          onMouseDown={(e) => e.preventDefault()}
        >
          Cancel
        </button>
        <button
          className={`${css.actionButton} ${css.actionButtonPrimary}`}
          type="button"
          onClick={handleApply}
          onMouseDown={(e) => e.preventDefault()}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
