import type { AnatomyRow, ComponentMeta, PartRow, UiCategory } from '../components';

const a = (part: string, spec: string, token: string): AnatomyRow => ({ part, spec, token });
const p = (name: string, props: string): PartRow => ({ name, props });

const popupRow = a(
  'Popup',
  'radius 12, padding 4, in 120ms scale .97→1, out 80ms',
  'bgElevated · boxShadow.menu',
);
const itemRow = a('Item', 'height 32, radius 8, padding 0 8, 14/20', 'text');
const highlightRow = a(
  'Item highlighted',
  'hover fillSecondary, pressed fill',
  'fillSecondary · fill',
);
const labelRow = a('Group label', '12/16 · 500', 'textTertiary');
const separatorRow = a('Separator', '1px, 4px vertical margin', 'borderSubtle');
const focusRow = a('Focus ring', '1px accent ring + 3px halo', 'accent · accentLight');

const ui = (
  id: string,
  label: string,
  category: UiCategory,
  description: string,
  anatomy: AnatomyRow[],
  parts: PartRow[],
): ComponentMeta<UiCategory> => ({
  id,
  label,
  category,
  description,
  anatomy,
  parts,
  packageName: 'rich-editor-ui',
});

export const uiData: ComponentMeta<UiCategory>[] = [
  ui(
    'dialog',
    'Dialog',
    'overlays',
    'A modal window built on Base UI Dialog. Used for nested documents, image editing and every presentDialog call.',
    [
      a(
        'Popup',
        'radius 12, max width 28rem, in 120ms scale .97→1, out 80ms',
        'bgElevated · boxShadow.modal',
      ),
      a('Scrim', '.32 light, .56 dark', 'scrim'),
      a('Header', 'padding 16 48 0 16; footer padding 16', '—'),
      a('Title', '16/24 · 600, chrome sans', 'text'),
      a('Description', '14/22', 'textSecondary'),
      a(
        'Close button',
        '28px square, radius 8, 12 from the corner',
        'textSecondary · fillSecondary',
      ),
    ],
    [
      p('Dialog', 'open onOpenChange modal'),
      p('DialogPopup', 'showCloseButton className'),
      p('DialogHeader · DialogTitle · DialogDescription', 'Header block'),
      p('DialogFooter', 'Button row'),
      p('presentDialog', 'Imperative API: content title sheet clickOutsideToDismiss'),
    ],
  ),
  ui(
    'popover',
    'Popover',
    'overlays',
    'A floating panel anchored to a trigger, built on Base UI Popover. Used by the link editor, color picker and node settings.',
    [
      a(
        'Popup',
        'width 280, radius 12, padding 12, grows from the anchor side',
        'bgElevated · boxShadow.menu',
      ),
      a('Title', '14/20 · 600', 'text'),
      a('Description', '13/20', 'textSecondary'),
      a('Arrow', 'optional, popup fill with ring stroke', 'bgElevated · ring'),
    ],
    [
      p('Popover', 'open onOpenChange modal'),
      p('PopoverTrigger', 'The anchor'),
      p('PopoverPanel', 'side align sideOffset className'),
      p('PopoverTitle · PopoverDescription · PopoverClose', 'Content parts'),
    ],
  ),
  ui(
    'dropdown-menu',
    'Dropdown Menu',
    'overlays',
    'A menu opened from a trigger, built on Base UI Menu. Used by the toolbar dropdowns, the table action menu and the block handle menu.',
    [
      popupRow,
      itemRow,
      highlightRow,
      labelRow,
      separatorRow,
      a('Shortcut', 'Kbd sm muted, right aligned', 'fillTertiary · textTertiary'),
      a('Destructive', 'caution text and icon', 'alertCaution'),
      a('Disabled', '50% opacity, no hover', '—'),
    ],
    [
      p('DropdownMenu', 'Root; controlled or uncontrolled open state'),
      p('DropdownMenuTrigger', 'The button that opens the menu'),
      p('DropdownMenuContent', 'side align sideOffset alignOffset positionMethod'),
      p('DropdownMenuGroup · DropdownMenuLabel', 'Groups items under a label'),
      p('DropdownMenuRadioGroup · DropdownMenuRadioItem', 'Single choice'),
      p('DropdownMenuCheckboxItem', 'Toggle with check indicator'),
      p('DropdownMenuItem', 'shortcut variant (default · destructive)'),
    ],
  ),
  ui(
    'select',
    'Select',
    'overlays',
    'A single-choice picker built on Base UI Select. Used for code block languages and settings fields.',
    [
      a(
        'Trigger',
        'height 28, radius 8, 13/20, hover fillSecondary, open fill',
        'boxShadow.xs · text',
      ),
      popupRow,
      itemRow,
      highlightRow,
      a('Selected indicator', 'check icon, neutral', 'text'),
      labelRow,
      separatorRow,
    ],
    [
      p('Select', 'value onValueChange items'),
      p('SelectTrigger · SelectValue', 'The field'),
      p('SelectContent', 'Popup with positioner'),
      p('SelectItem · SelectGroup · SelectGroupLabel · SelectSeparator', 'Options'),
    ],
  ),
  ui(
    'combobox',
    'Combobox',
    'overlays',
    'A filterable list with a text input, built on Base UI Combobox. Used where a select has too many options.',
    [
      a('Input', 'height 28, radius 8, 13/20, focus ring', 'boxShadow.xs · accent'),
      popupRow,
      itemRow,
      highlightRow,
      a('Popup width', 'matches the input', '—'),
      a('Empty', '13/20, centered, padding 8 12', 'textTertiary'),
    ],
    [
      p('Combobox', 'items value onValueChange'),
      p('ComboboxInput · ComboboxTrigger', 'The field'),
      p('ComboboxContent · ComboboxList', 'Popup and list'),
      p('ComboboxItem · ComboboxItemIndicator · ComboboxEmpty', 'Options'),
    ],
  ),
  ui(
    'tooltip',
    'Tooltip',
    'overlays',
    'A short label shown on hover or focus, built on Base UI Tooltip. Used by toolbar buttons.',
    [
      a(
        'Popup',
        'radius 8, padding 4 8, 12/16 · 500, inverted, no shadow',
        'text (ground) · bg (text)',
      ),
      a('Shortcut', 'Kbd sm inverted', '—'),
      a('Offset', '6px from trigger', '—'),
      a('Delay', 'opens after hover delay, instant within a group', '—'),
    ],
    [
      p('TooltipProvider', 'delay closeDelay'),
      p('TooltipRoot', 'open onOpenChange'),
      p('TooltipTrigger', 'The anchor'),
      p('TooltipContent', 'side align sideOffset shortcut'),
    ],
  ),
  ui(
    'action-button',
    'Action Button',
    'controls',
    'The button used across editor chrome and dialogs. Four variants, three sizes, plus danger, icon-only and rounded forms.',
    [
      a('Ghost', 'transparent, hover fillSecondary, pressed fill', 'fillSecondary · fill'),
      a('Solid (primary)', 'ink ground with bg-colored text', 'text · bg'),
      a('Outline', '1px line, hover fillSecondary', 'border · fillSecondary'),
      a('Accent', 'deprecated, renders as solid', 'text · bg'),
      a('Toggle', 'aria-pressed="true" keeps the pressed fill', 'fill'),
      a('Sizes', 'sm 24 · md 28 · lg 32, radius 8; icon buttons square', '—'),
      a('Disabled', '50% opacity', '—'),
      focusRow,
    ],
    [
      p('ActionButton', 'variant size danger icon rounded end aria-pressed'),
      p('ActionBar', 'gap; lays buttons out in a row'),
      p('getActionButtonClassName', 'Class for non-button elements'),
    ],
  ),
  ui(
    'segmented-control',
    'Segmented Control',
    'controls',
    'A row of mutually exclusive options with a sliding thumb.',
    [
      a('Track', 'radius 8, padding 2', 'fillSecondary'),
      a('Thumb', 'radius 6 (8 − 2), slides in 200ms', 'bg · boxShadow.xs'),
      a('Item', 'hover and selected go to text', 'textSecondary → text'),
      a('Sizes', 'sm 28 (12/16) · md 32 (13/20)', '—'),
      focusRow,
    ],
    [
      p('SegmentedControl', 'items value onChange size fullWidth'),
      p('SegmentedControlItem', 'value label disabled'),
    ],
  ),
  ui(
    'animated-tabs',
    'Animated Tabs',
    'controls',
    'Tabs with an underline indicator that slides to the active tab.',
    [
      a('Tab', 'height 36, 13/20 · 500, hover text', 'textSecondary → text'),
      a('Indicator', '2px line under the active tab, slides in 200ms', 'text'),
      a('Rail', '1px line under the row', 'borderSubtle'),
      focusRow,
    ],
    [p('AnimatedTabs', 'tabs value defaultTab onChange')],
  ),
  ui(
    'checkbox',
    'Checkbox',
    'controls',
    'A checkbox with an animated check mark, label and optional description.',
    [
      a('Box', '16px, radius 4, 1px line, 120ms, no bounce', 'textQuaternary'),
      a('Checked · indeterminate', 'ink fill, bg-colored check or dash', 'text · bg'),
      a('Label', '14/20 · 500', 'text'),
      a('Description', '13/20', 'textSecondary'),
      a('Focus ring', 'on the box', 'accent · accentLight'),
    ],
    [
      p(
        'AnimatedCheckbox',
        'checked defaultChecked indeterminate onChange label description disabled',
      ),
    ],
  ),
  ui(
    'color-picker',
    'Color Picker',
    'controls',
    'Swatch grid with a custom color view. Used for text color and highlight in the toolbar.',
    [
      a('Swatch', '16px dot in a 28px target, radius 8 hover', 'ring · fillSecondary'),
      a('Selected swatch', '1.5px ring, 2px offset', 'text'),
      a('Custom view', 'saturation field radius 8, round sliders', '—'),
      a('Hex input', 'mono 12/16, height 28, caution ring when invalid', 'fontMono · alertCaution'),
      a('Actions', 'Cancel outline · Apply solid ActionButton md', '—'),
    ],
    [p('ColorPicker', 'currentColor onSelect className')],
  ),
  ui(
    'auto-resize-textarea',
    'Textarea',
    'controls',
    'A textarea that grows with its content between a minimum and maximum row count.',
    [
      a('Field', 'radius 8, padding 4 10, 14/20, one line 28 high', 'boxShadow.xs · text'),
      a('Placeholder', '14/20', 'textTertiary'),
      a('Invalid', 'aria-invalid draws a caution ring', 'alertCaution'),
      a('Disabled', '50% opacity', '—'),
      focusRow,
    ],
    [p('AutoResizeTextArea', 'minRows maxRows + textarea attributes')],
  ),
  ui(
    'alert',
    'Alert',
    'display',
    'An inline status message with an icon and an optional action.',
    [
      a(
        'Container',
        'semantic 4% ground + 32% line, radius 8, no side bar',
        'alertInfo · alertTip · alertWarning · alertCaution',
      ),
      a('Neutral', 'fillTertiary ground, border line', 'fillTertiary · border'),
      a('Icon', '16px, semantic color', 'alert*'),
      a('Title · text', '13/20 · 600, then 13/20', 'text'),
      a('Action', 'semantic text on 12% ground, 18% on hover', 'alert*'),
    ],
    [p('Alert', 'variant (info · success · warning · error · neutral) title action')],
  ),
  ui(
    'badge',
    'Badge',
    'display',
    'A short status label. Semantic colors are allowed here.',
    [
      a('Neutral', 'quiet fill', 'fillSecondary · textSecondary'),
      a(
        'Semantic',
        '10% ground, semantic text',
        'alertTip · alertCaution · alertWarning · alertInfo',
      ),
      a('Sizes', 'sm 18 (11/16) · md 20 (12/16), radius 4', '—'),
      a('Dot', 'optional 6px dot in the text color', 'currentColor'),
    ],
    [p('Badge', 'variant (neutral · success · error · warning · info) size dot')],
  ),
  ui(
    'kbd',
    'Kbd',
    'display',
    'Keycaps for a shortcut, one cap per key. Shows ⌘ ⇧ ⌥ on macOS and words elsewhere; Enter, Backspace, Delete and arrows draw icons.',
    [
      a('Cap', 'md 20 · sm 18, radius 4, 2px between caps', '—'),
      a('Default', 'bg ground, inset line, heavier bottom edge', 'bg · border'),
      a('Muted', 'for menus', 'fillTertiary · borderSubtle · textTertiary'),
      a('Inverted', 'for tooltips and primary buttons', 'bg 16% · bg'),
    ],
    [
      p('Kbd', 'keys (string or array) size (sm · md) tone (default · muted · inverted) platform'),
      p('parseShortcut', "'Ctrl+B' or '⌘⇧Z' → ['mod', 'b']"),
    ],
  ),
  ui(
    'status-dot',
    'Status Dot',
    'display',
    'A dot that shows a process state, with an optional pulse.',
    [
      a('Dot', 'sm 8 · md 10, round', 'alert* · textQuaternary'),
      a('Pulse', 'expanding ring, same hue, only when motion is allowed', '—'),
    ],
    [p('StatusDot', 'status (idle · active · success · error · warning) pulse size')],
  ),
  ui(
    'spinner',
    'Spinner',
    'display',
    'An indeterminate loading indicator.',
    [
      a('Ring', 'sm 12 · md 16 · lg 20, two-tone: 20% track + solid arc', 'currentColor'),
      a('Speed', 'one turn per 0.7s', '—'),
    ],
    [p('Spinner', 'size (sm · md · lg)')],
  ),
  ui(
    'collapsible',
    'Collapsible',
    'display',
    'A trigger that shows and hides a panel, built on Base UI Collapsible.',
    [
      a('Trigger', '13/20 · 500, hover text, 16px chevron rotates', 'textSecondary → text'),
      a('Panel', 'content aligned with the title text (22px), 4px top; height animates 200ms', '—'),
      focusRow,
    ],
    [
      p('Collapsible', 'open defaultOpen onOpenChange'),
      p('CollapsibleTrigger', 'hideChevron'),
      p('CollapsiblePanel', 'Content'),
    ],
  ),
  ui(
    'scroll-area',
    'Scroll Area',
    'display',
    'A scroll container with a thin overlay scrollbar.',
    [
      a('Scrollbar', '6px thumb, radius full', 'textQuaternary'),
      a('Hover', 'thumb darkens', 'textTertiary'),
    ],
    [p('ScrollArea', 'autoScrollToBottom scrollRef className')],
  ),
  ui(
    'code-block',
    'Code Block',
    'display',
    'A read-only highlighted code block with a header, copy button and collapse.',
    [
      a('Frame', 'radius 8', 'codeBg · border'),
      a('Header', '32px, 12/16, borderSubtle line', 'textTertiary · borderSubtle'),
      a('Copy button', 'hover fillSecondary, pressed fill, copied state', 'fillSecondary · fill'),
      a('Code', 'mono 0.8125em / 1.7', 'codeText'),
      focusRow,
    ],
    [
      p('CodeBlock', 'code language chrome collapsible showCopyButton showLineNumbers'),
      p('highlightCode', 'Shiki highlight to HTML'),
    ],
  ),
];
