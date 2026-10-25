import type { AnatomyRow, ComponentMeta, PartRow, UiCategory } from '../components';

const a = (part: string, spec: string, token: string): AnatomyRow => ({ part, spec, token });
const p = (name: string, props: string): PartRow => ({ name, props });

const popupRow = a('Popup', 'radius 12, padding 4, enter 120ms scale .97→1', 'bg · boxShadow.menu');
const itemRow = a('Item', 'height 32, radius 8 (12 − 4), padding 0 8, 13px', 'textSecondary');
const highlightRow = a('Item highlighted', 'translucent fill, no accent fill', 'fill · text');
const labelRow = a('Group label', '12px / 500', 'textTertiary');
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
      a('Popup', 'radius 12, max width 28rem, enter 120ms scale .97→1', 'bg · boxShadow.modal'),
      a('Backdrop', 'translucent ink, not solid black', '—'),
      a('Title', '15px / 600', 'text'),
      a('Description', '13px / 20', 'textTertiary'),
      a('Close button', '28px, radius 8, hover fill', 'textTertiary · fillSecondary'),
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
      popupRow,
      a('Title', '13px / 600', 'text'),
      a('Description', '13px / 20', 'textTertiary'),
      a('Arrow', 'optional, matches popup fill', 'bg'),
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
      a('Shortcut', 'mono 11px, right aligned', 'textTertiary'),
      a('Disabled', '45% opacity, no hover', '—'),
    ],
    [
      p('DropdownMenu', 'Root; controlled or uncontrolled open state'),
      p('DropdownMenuTrigger', 'The button that opens the menu'),
      p('DropdownMenuContent', 'side align sideOffset alignOffset positionMethod'),
      p('DropdownMenuGroup · DropdownMenuLabel', 'Groups items under a label'),
      p('DropdownMenuRadioGroup · DropdownMenuRadioItem', 'Single choice'),
      p('DropdownMenuCheckboxItem', 'Toggle with check indicator'),
    ],
  ),
  ui(
    'select',
    'Select',
    'overlays',
    'A single-choice picker built on Base UI Select. Used for code block languages and settings fields.',
    [
      a('Trigger', 'height 32, radius 8, 1px line, 13px', 'border · text'),
      popupRow,
      itemRow,
      highlightRow,
      a('Selected indicator', 'check icon, neutral', 'text'),
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
      a('Input', 'height 32, radius 8, 1px line, focus ring', 'border · accent'),
      popupRow,
      itemRow,
      highlightRow,
      a('Empty', '13px, centered, padding 8', 'textTertiary'),
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
      a('Popup', 'radius 8, padding 4 8, 12px, inverted ink', 'text (bg) · bg (fg)'),
      a('Offset', '6px from trigger', '—'),
      a('Delay', 'opens after hover delay, instant within a group', '—'),
    ],
    [
      p('TooltipProvider', 'delay closeDelay'),
      p('TooltipRoot', 'open onOpenChange'),
      p('TooltipTrigger', 'The anchor'),
      p('TooltipContent', 'side align sideOffset'),
    ],
  ),
  ui(
    'action-button',
    'Action Button',
    'controls',
    'The button used across editor chrome and dialogs. Four variants, three sizes, plus danger, icon-only and rounded forms.',
    [
      a('Ghost', 'transparent, hover fill', 'fillSecondary · textSecondary'),
      a('Solid', 'neutral fill, hover deeper fill', 'fill · text'),
      a('Outline', '1px line, hover fill', 'border · fillSecondary'),
      a('Accent (primary)', 'near-black ground with bg-colored text', 'text · bg'),
      a('Sizes', 'sm 24 · md 28 · lg 32, radius 8', 'borderRadius.md'),
      focusRow,
    ],
    [
      p('ActionButton', 'variant size danger icon rounded end'),
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
      a('Track', 'radius 8, padding 2', 'fillTertiary'),
      a('Thumb', 'radius 6 (8 − 2), raised', 'bg · boxShadow.xs'),
      a('Item', '13px, selected text darker', 'textTertiary → text'),
      a('Sizes', 'sm 24 · md 28', '—'),
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
      a('Tab', '13px / 500, padding 0 8', 'textTertiary → text'),
      a('Indicator', '2px line under the active tab', 'text'),
      a('Rail', '1px line under the row', 'border'),
    ],
    [p('AnimatedTabs', 'tabs value defaultTab onChange')],
  ),
  ui(
    'checkbox',
    'Checkbox',
    'controls',
    'A checkbox with an animated check mark, label and optional description.',
    [
      a('Box', '16px, radius 4, 1px line', 'border'),
      a('Checked', 'ink fill, bg-colored mark', 'text · bg'),
      a('Label', '13px', 'text'),
      a('Description', '12px', 'textTertiary'),
      focusRow,
    ],
    [p('AnimatedCheckbox', 'checked defaultChecked onChange label description disabled')],
  ),
  ui(
    'color-picker',
    'Color Picker',
    'controls',
    'Swatch grid with a custom color view. Used for text color and highlight in the toolbar.',
    [
      a('Swatch', '20px, radius 4, 1px ring', 'ring'),
      a('Selected swatch', '2px ring offset', 'text'),
      a('Custom view', 'saturation field, hue slider, hex input', 'border'),
    ],
    [p('ColorPicker', 'currentColor onSelect className')],
  ),
  ui(
    'auto-resize-textarea',
    'Textarea',
    'controls',
    'A textarea that grows with its content between a minimum and maximum row count.',
    [
      a('Field', 'radius 8, 1px line, padding 8 10, 13px', 'border · text'),
      a('Placeholder', '13px', 'textQuaternary'),
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
        'semantic 6% ground + 18% ring, radius 8, no side bar',
        'alertInfo · alertWarning · alertCaution',
      ),
      a('Icon', '16px, semantic color', 'alert*'),
      a('Text', '13px / 20', 'text'),
    ],
    [p('Alert', 'variant (info · warning · error) action')],
  ),
  ui(
    'badge',
    'Badge',
    'display',
    'A short status label. Semantic colors are allowed here.',
    [
      a('Neutral', '1px line, no fill', 'border · textTertiary'),
      a(
        'Semantic',
        'tinted ground, semantic text',
        'alertTip · alertCaution · alertWarning · alertInfo',
      ),
      a('Sizes', 'sm 18 · md 20, radius 4', 'borderRadius.sm'),
    ],
    [p('Badge', 'variant (neutral · success · error · warning · info) size')],
  ),
  ui(
    'status-dot',
    'Status Dot',
    'display',
    'A dot that shows a process state, with an optional pulse.',
    [
      a('Dot', 'sm 6 · md 8, round', 'alert* · textQuaternary'),
      a('Pulse', 'expanding ring, same hue', '—'),
    ],
    [p('StatusDot', 'status (idle · active · success · error · warning) pulse size')],
  ),
  ui(
    'spinner',
    'Spinner',
    'display',
    'An indeterminate loading indicator.',
    [a('Ring', 'sm 14 · md 18, 1.5px stroke', 'textTertiary')],
    [p('Spinner', 'size (sm · md)')],
  ),
  ui(
    'collapsible',
    'Collapsible',
    'display',
    'A trigger that shows and hides a panel, built on Base UI Collapsible.',
    [
      a('Trigger', '13px / 500, chevron rotates', 'textSecondary'),
      a('Panel', 'height animates, no ground', '—'),
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
      a('Scrollbar', '6px thumb, radius full', 'fill'),
      a('Hover', 'thumb darkens', 'textQuaternary'),
    ],
    [p('ScrollArea', 'autoScrollToBottom scrollRef className')],
  ),
  ui(
    'code-block',
    'Code Block',
    'display',
    'A read-only highlighted code block with a header, copy button and collapse.',
    [
      a('Frame', 'radius 8, borderSubtle ring', 'codeBg · borderSubtle'),
      a('Header', '36px, language name and copy button', 'textTertiary'),
      a('Code', 'mono 0.8125em / 1.7', 'codeText'),
    ],
    [
      p('CodeBlock', 'code language chrome collapsible showCopyButton showLineNumbers'),
      p('highlightCode', 'Shiki highlight to HTML'),
    ],
  ),
];
