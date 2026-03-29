import { ColorSchemeProvider, getVariantClass } from '@haklex/rich-editor';
import {
  ActionBar,
  ActionButton,
  Alert,
  AnimatedCheckbox,
  AnimatedTabs,
  Badge,
  CodeBlock,
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
  SegmentedControl,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
  StatusDot,
  TooltipContent,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from '@haklex/rich-editor-ui';
import { PortalThemeProvider, vars } from '@haklex/rich-style-token';
import { Heart, Plus, Settings, Trash2 } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';

import { useTheme } from '../context/ThemeContext';
import * as css from './DesignPage.css';

const COLOR_TOKENS = [
  { name: 'text', usage: 'Primary reading color for titles and body copy.' },
  { name: 'textSecondary', usage: 'Supporting copy, subheadings, and labels.' },
  { name: 'textTertiary', usage: 'Meta information and secondary chrome.' },
  { name: 'textQuaternary', usage: 'Lowest-emphasis text and helper content.' },
  { name: 'bg', usage: 'Base surface for cards and framed regions.' },
  { name: 'bgSecondary', usage: 'Soft contrast surface behind grouped content.' },
  { name: 'bgTertiary', usage: 'Page canvas and recessed backgrounds.' },
  { name: 'fill', usage: 'Default fill for controls and inline surfaces.' },
  { name: 'fillSecondary', usage: 'Selected or emphasized low-contrast fill.' },
  { name: 'fillTertiary', usage: 'Hover and preview states.' },
  { name: 'fillQuaternary', usage: 'Subtle separators and dense utility chrome.' },
  { name: 'border', usage: 'Primary border for cards, inputs, and dividers.' },
  { name: 'accent', usage: 'Primary brand action and highlight color.' },
  { name: 'accentLight', usage: 'Low-contrast accent backgrounds and outlines.' },
  { name: 'link', usage: 'Inline link affordance inside reading content.' },
  { name: 'codeText', usage: 'Foreground color inside code regions.' },
  { name: 'codeBg', usage: 'Background color for code surfaces.' },
  { name: 'hrBorder', usage: 'Horizontal rule and neutral content separator.' },
  { name: 'quoteBorder', usage: 'Border treatment for quoted content.' },
  { name: 'quoteBg', usage: 'Background treatment for quotations and callouts.' },
  { name: 'alertInfo', usage: 'Informational feedback surfaces.' },
  { name: 'alertWarning', usage: 'Warning and caution surfaces.' },
  { name: 'alertTip', usage: 'Tips and assistive prompts.' },
  { name: 'alertCaution', usage: 'High-attention caution styling.' },
  { name: 'alertImportant', usage: 'Important emphasis treatment.' },
] as const;

const SPACING_TOKENS = [
  { name: 'xs', usage: 'Tight inline gaps inside compact controls.' },
  { name: 'sm', usage: 'Dense stack spacing between related labels and values.' },
  { name: 'md', usage: 'Default gap for form rows and component groups.' },
  { name: 'lg', usage: 'Section spacing inside complex cards or panels.' },
  { name: 'xl', usage: 'Page-level separation between major content blocks.' },
] as const;

const RADIUS_TOKENS = [
  { name: 'sm', usage: 'Compact inputs and tags.' },
  { name: 'md', usage: 'Default card and control radius.' },
  { name: 'lg', usage: 'Large surfaces and overlay containers.' },
] as const;

const SHADOW_TOKENS = [
  { name: 'topBar', usage: 'Subtle elevation for persistent header surfaces.' },
  { name: 'modal', usage: 'High-elevation overlay framing.' },
  { name: 'menu', usage: 'Transient floating UI such as menus and popovers.' },
] as const;

const TYPOGRAPHY_SAMPLES = [
  {
    label: 'Interface Sans',
    value: vars.typography.fontFamily,
    preview: 'Design systems become legible when hierarchy is explicit.',
  },
  {
    label: 'Editorial Serif',
    value: vars.typography.fontFamilySerif,
    preview: 'Serif is reserved for expressive long-form accents.',
  },
  {
    label: 'Code Mono',
    value: vars.typography.fontMono,
    preview: 'const token = vars.color.accent',
  },
] as const;

const TYPE_SCALE = [
  { name: '2xs', value: vars.typography.fontSize2xs, role: 'Micro labels' },
  { name: 'xs', value: vars.typography.fontSizeXs, role: 'Meta text' },
  { name: 'sm', value: vars.typography.fontSizeSm, role: 'Dense UI copy' },
  { name: 'md', value: vars.typography.fontSizeMd, role: 'Body text' },
  { name: 'lg', value: vars.typography.fontSizeLg, role: 'Section headings' },
] as const;

const FOUNDATION_REFERENCE_COUNT =
  COLOR_TOKENS.length +
  SPACING_TOKENS.length +
  RADIUS_TOKENS.length +
  SHADOW_TOKENS.length +
  TYPOGRAPHY_SAMPLES.length +
  TYPE_SCALE.length;

const buttonVariants = ['ghost', 'solid', 'outline', 'accent'] as const;
const buttonSizes = ['sm', 'md', 'lg'] as const;
const badgeVariants = ['neutral', 'success', 'error', 'warning', 'info'] as const;
const badgeSizes = ['sm', 'md'] as const;
const statusDotStatuses = ['idle', 'active', 'success', 'error', 'warning'] as const;

const demoTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'features', label: 'Features' },
  { id: 'changelog', label: 'Changelog' },
];

const sampleCode = `import { vars } from '@haklex/rich-style-token'

function greet(name: string) {
  console.log(\`Hello, \${name}!\`)
  return { color: vars.color.accent }
}`;

const NAV_GROUPS = [
  {
    label: 'Foundations',
    description: 'Core tokens and primitives that define tone, spacing, and depth.',
    items: [
      { id: 'tokens', label: 'Style Tokens' },
    ],
  },
  {
    label: 'Controls',
    description: 'Interactive controls that drive actions, selection, and status.',
    items: [
      { id: 'action-button', label: 'ActionButton' },
      { id: 'badge', label: 'Badge' },
      { id: 'spinner', label: 'Spinner' },
      { id: 'select', label: 'Select' },
      { id: 'tabs', label: 'Tabs & Segmented' },
      { id: 'checkbox', label: 'Checkbox' },
      { id: 'status-dot', label: 'StatusDot' },
    ],
  },
  {
    label: 'Feedback',
    description: 'Patterns for system messaging, disclosure, and transient detail.',
    items: [
      { id: 'alert', label: 'Alert' },
      { id: 'collapsible', label: 'Collapsible' },
      { id: 'dialog', label: 'Dialog' },
      { id: 'tooltip', label: 'Tooltip' },
    ],
  },
  {
    label: 'Content',
    description: 'Structured presentation blocks for technical or long-form content.',
    items: [
      { id: 'code-block', label: 'CodeBlock' },
    ],
  },
] as const;

const SECTION_IDS = NAV_GROUPS.flatMap((group) => group.items.map((item) => item.id));
const ACTIVE_SIDEBAR_ITEM_STYLE = {
  background: vars.color.accentLight,
  color: vars.color.accent,
  fontWeight: 700,
} as const;

function isSectionId(value: string | undefined): value is (typeof SECTION_IDS)[number] {
  return value != null && SECTION_IDS.includes(value as (typeof SECTION_IDS)[number]);
}

function SectionFrame(props: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const { id, eyebrow, title, description, children } = props;

  return (
    <section className={css.sectionFrame} id={id}>
      <div className={css.sectionHeader}>
        <p className={css.sectionEyebrow}>{eyebrow}</p>
        <h2 className={css.sectionTitle}>{title}</h2>
        <p className={css.sectionDescription}>{description}</p>
      </div>
      <div className={css.sectionBody}>{children}</div>
    </section>
  );
}

function IntroCard(props: {
  label: string;
  value: string;
  detail: string;
}) {
  const { label, value, detail } = props;
  return (
    <div className={css.heroStat}>
      <span className={css.heroStatLabel}>{label}</span>
      <strong className={css.heroStatValue}>{value}</strong>
      <span className={css.heroStatDetail}>{detail}</span>
    </div>
  );
}

function PageHero() {
  return (
    <header className={css.hero}>
      <div className={css.heroBody}>
        <p className={css.heroEyebrow}>Design System</p>
        <h1 className={css.heroTitle}>A documentation surface for tokens, controls, and interaction patterns.</h1>
        <p className={css.heroLead}>
          This page is organized as a reference workspace rather than a tab switcher.
          Foundations appear first, followed by controls, feedback patterns, and
          content blocks, so the visual language can be scanned in one pass.
        </p>
        <div className={css.heroActions}>
          <Link className={css.heroLink} to="/design/tokens">Jump to foundations</Link>
          <Link className={css.heroLinkSecondary} to="/design/action-button">Review controls</Link>
        </div>
      </div>
      <div className={css.heroStats}>
        <IntroCard
          label="Foundations"
          value={`${FOUNDATION_REFERENCE_COUNT}`}
          detail="Color, spacing, radius, shadow, and typography references."
        />
        <IntroCard
          label="Components"
          value="12"
          detail="Interactive primitives arranged by semantic group."
        />
        <IntroCard
          label="Structure"
          value="4"
          detail="Foundations, controls, feedback, and content."
        />
      </div>
    </header>
  );
}

function SideNav() {
  const { section } = useParams();
  const activeSection = isSectionId(section) ? section : undefined;

  return (
    <aside className={css.sidebar}>
      <div className={css.sidebarInner}>
        <p className={css.sidebarKicker}>On this page</p>
        {NAV_GROUPS.map((group) => (
          <div className={css.sidebarGroup} key={group.label}>
            <div className={css.sidebarGroupHeader}>
              <h2 className={css.sidebarGroupTitle}>{group.label}</h2>
              <p className={css.sidebarGroupDescription}>{group.description}</p>
            </div>
            <div className={css.sidebarList}>
              {group.items.map((item) => (
                <NavLink
                  className={css.sidebarItem}
                  key={item.id}
                  style={activeSection === item.id ? ACTIVE_SIDEBAR_ITEM_STYLE : undefined}
                  to={`/design/${item.id}`}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function TokensSection() {
  return (
    <SectionFrame
      description="Foundational tokens are presented as reference rows with usage context, so visual values remain linked to semantic intent."
      eyebrow="Foundations"
      id="tokens"
      title="Style Tokens"
    >
      <div className={css.callout}>
        <span className={css.calloutTitle}>Reading order</span>
        <p className={css.calloutText}>
          Review semantic color first, then spacing, typography, radius, and shadow.
          The layout intentionally moves from abstract design language toward applied depth.
        </p>
      </div>

      <div className={css.foundationBlock}>
        <div className={css.foundationHeader}>
          <h3 className={css.subsectionTitle}>Color Roles</h3>
          <p className={css.subsectionText}>Each token is paired with a suggested usage instead of appearing as an isolated swatch.</p>
        </div>
        <div className={css.tokenTable}>
          {COLOR_TOKENS.map((token) => (
            <div className={css.tokenRow} key={token.name}>
              <div className={css.tokenMeta}>
                <span className={css.tokenName}>{token.name}</span>
                <span className={css.tokenUsage}>{token.usage}</span>
              </div>
              <code className={css.tokenValue}>{vars.color[token.name]}</code>
              <div className={css.tokenSwatch} style={{ background: vars.color[token.name] }} />
            </div>
          ))}
        </div>
      </div>

      <div className={css.foundationGrid}>
        <div className={css.foundationBlock}>
          <div className={css.foundationHeader}>
            <h3 className={css.subsectionTitle}>Spacing Scale</h3>
            <p className={css.subsectionText}>Spacing is easier to read when the token, visual span, and intended use are aligned on the same row.</p>
          </div>
          <div className={css.spacingTable}>
            {SPACING_TOKENS.map((token) => (
              <div className={css.spacingRow} key={token.name}>
                <span className={css.spacingLabel}>{token.name}</span>
                <div className={css.spacingTrack}>
                  <div
                    className={css.spacingBar}
                    style={{ width: vars.spacing[token.name] }}
                  />
                </div>
                <code className={css.spacingValue}>{vars.spacing[token.name]}</code>
                <span className={css.spacingUsage}>{token.usage}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={css.foundationBlock}>
          <div className={css.foundationHeader}>
            <h3 className={css.subsectionTitle}>Typography</h3>
            <p className={css.subsectionText}>Typography is shown by role, not only by raw token value.</p>
          </div>
          <div className={css.typeStack}>
            {TYPOGRAPHY_SAMPLES.map((sample) => (
              <div className={css.typeSample} key={sample.label} style={{ fontFamily: sample.value }}>
                <div className={css.typeSampleHeader}>
                  <span className={css.demoLabel}>{sample.label}</span>
                  <code className={css.inlineCode}>{sample.value}</code>
                </div>
                <p className={css.typeSampleText}>{sample.preview}</p>
              </div>
            ))}
          </div>
          <div className={css.typeScale}>
            {TYPE_SCALE.map((scale) => (
              <div className={css.typeScaleItem} key={scale.name}>
                <span className={css.typeScaleName}>{scale.name}</span>
                <span className={css.typeScalePreview} style={{ fontSize: scale.value }}>{scale.role}</span>
                <code className={css.inlineCode}>{scale.value}</code>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={css.foundationGrid}>
        <div className={css.foundationBlock}>
          <div className={css.foundationHeader}>
            <h3 className={css.subsectionTitle}>Radius</h3>
            <p className={css.subsectionText}>Corner radius is framed as surface personality, not only as raw numbers.</p>
          </div>
          <div className={css.radiusGrid}>
            {RADIUS_TOKENS.map((token) => (
              <div className={css.radiusCard} key={token.name}>
                <div className={css.radiusPreview} style={{ borderRadius: vars.borderRadius[token.name] }} />
                <span className={css.tokenName}>{token.name}</span>
                <span className={css.tokenUsage}>{token.usage}</span>
                <code className={css.inlineCode}>{vars.borderRadius[token.name]}</code>
              </div>
            ))}
          </div>
        </div>

        <div className={css.foundationBlock}>
          <div className={css.foundationHeader}>
            <h3 className={css.subsectionTitle}>Depth & Layout</h3>
            <p className={css.subsectionText}>Elevation is shown as a scene with layer intent, alongside the canonical content width.</p>
          </div>
          <div className={css.shadowScene}>
            {SHADOW_TOKENS.map((token) => (
              <div className={css.shadowCard} key={token.name} style={{ boxShadow: vars.boxShadow[token.name] }}>
                <span className={css.shadowName}>{token.name}</span>
                <span className={css.shadowUsage}>{token.usage}</span>
              </div>
            ))}
          </div>
          <div className={css.layoutNote}>
            <span className={css.demoLabel}>Layout max width</span>
            <code className={css.inlineCode}>{vars.layout.maxWidth}</code>
          </div>
        </div>
      </div>
    </SectionFrame>
  );
}

function ActionButtonSection() {
  return (
    <SectionFrame
      description="Buttons are framed by usage mode so the matrix reads as a decision aid, not only as a prop dump."
      eyebrow="Controls"
      id="action-button"
      title="ActionButton"
    >
      <div className={css.showcaseSplit}>
        <div className={css.showcasePanel}>
          <div className={css.showcaseHeading}>
            <h3 className={css.subsectionTitle}>Priority Ladder</h3>
            <p className={css.subsectionText}>Use stronger fills for committed actions and quieter variants for utility work.</p>
          </div>
          {buttonVariants.map((variant) => (
            <div className={css.demoRow} key={variant}>
              <span className={css.demoLabel}>{variant}</span>
              <ActionBar gap={8}>
                {buttonSizes.map((size) => (
                  <ActionButton key={size} size={size} variant={variant}>
                    {size}
                  </ActionButton>
                ))}
              </ActionBar>
            </div>
          ))}
        </div>

        <div className={css.showcasePanel}>
          <div className={css.showcaseHeading}>
            <h3 className={css.subsectionTitle}>Utility Set</h3>
            <p className={css.subsectionText}>Compact icon treatments remain grouped so the family reads as one control system.</p>
          </div>
          <div className={css.demoRow}>
            <ActionButton danger variant="solid">Danger</ActionButton>
            <ActionButton icon variant="ghost"><Settings size={16} /></ActionButton>
            <ActionButton icon rounded variant="ghost"><Heart size={16} /></ActionButton>
            <ActionButton icon variant="outline"><Plus size={16} /></ActionButton>
            <ActionButton icon danger variant="ghost"><Trash2 size={16} /></ActionButton>
          </div>
        </div>
      </div>
    </SectionFrame>
  );
}

function BadgeSection() {
  return (
    <SectionFrame
      description="Badge variants are arranged by scale so color and density can be compared without losing whitespace."
      eyebrow="Controls"
      id="badge"
      title="Badge"
    >
      <div className={css.showcasePanel}>
        {badgeSizes.map((size) => (
          <div className={css.demoRow} key={size}>
            <span className={css.demoLabel}>size={size}</span>
            {badgeVariants.map((variant) => (
              <Badge key={variant} size={size} variant={variant}>
                {variant}
              </Badge>
            ))}
          </div>
        ))}
      </div>
    </SectionFrame>
  );
}

function AlertSection() {
  return (
    <SectionFrame
      description="Feedback components should be read in context as stacked message surfaces, not isolated state chips."
      eyebrow="Feedback"
      id="alert"
      title="Alert"
    >
      <div className={css.showcasePanel}>
        <div className={css.stack}>
          <Alert variant="info">This is an informational message.</Alert>
          <Alert variant="warning">This is a warning message.</Alert>
          <Alert
            action={<ActionButton size="sm" variant="outline">Retry</ActionButton>}
            variant="error"
          >
            Something went wrong. Please try again.
          </Alert>
        </div>
      </div>
    </SectionFrame>
  );
}

function SpinnerSection() {
  return (
    <SectionFrame
      description="Loading indicators are shown in a neutral utility panel to keep attention on cadence and scale."
      eyebrow="Controls"
      id="spinner"
      title="Spinner"
    >
      <div className={css.showcasePanel}>
        <div className={css.inlineGroup}>
          <div className={css.inlineGroup}>
            <span className={css.demoLabel}>sm</span>
            <Spinner size="sm" />
          </div>
          <div className={css.inlineGroup}>
            <span className={css.demoLabel}>md</span>
            <Spinner size="md" />
          </div>
        </div>
      </div>
    </SectionFrame>
  );
}

function SelectSection() {
  const [value, setValue] = useState('apple');
  const handleValueChange = (nextValue: unknown) => {
    setValue(String(nextValue));
  };

  return (
    <SectionFrame
      description="Form controls are framed with their resulting state so the field reads as part of a full interaction cycle."
      eyebrow="Controls"
      id="select"
      title="Select"
    >
      <div className={css.showcaseSplit}>
        <div className={css.showcasePanel}>
          <div className={css.showcaseHeading}>
            <h3 className={css.subsectionTitle}>Field Preview</h3>
            <p className={css.subsectionText}>The component is shown inside a form-like panel rather than as a floating primitive.</p>
          </div>
          <div className={css.formField}>
            <span className={css.formLabel}>Favorite fruit</span>
            <Select value={value} onValueChange={handleValueChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pick a fruit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="cherry">Cherry</SelectItem>
                <SelectItem value="durian">Durian</SelectItem>
                <SelectItem value="elderberry">Elderberry</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className={css.showcasePanel}>
          <div className={css.showcaseHeading}>
            <h3 className={css.subsectionTitle}>Resolved Value</h3>
            <p className={css.subsectionText}>State feedback is surfaced alongside the field to clarify cause and effect.</p>
          </div>
          <p className={css.stateReadout}>
            Selected option
            <strong>{value}</strong>
          </p>
        </div>
      </div>
    </SectionFrame>
  );
}

function TabsSection() {
  const [tab, setTab] = useState('overview');
  const [segment, setSegment] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  return (
    <SectionFrame
      description="Tabs and segmented controls are separated by purpose so the two patterns do not collapse into a single visual category."
      eyebrow="Controls"
      id="tabs"
      title="Tabs & Segmented"
    >
      <div className={css.showcaseSplit}>
        <div className={css.showcasePanel}>
          <div className={css.showcaseHeading}>
            <h3 className={css.subsectionTitle}>AnimatedTabs</h3>
            <p className={css.subsectionText}>Use when switching between content regions with equal visual weight.</p>
          </div>
          <AnimatedTabs tabs={demoTabs} value={tab} onChange={setTab} />
          <p className={css.stateReadout}>
            Active tab
            <strong>{tab}</strong>
          </p>
        </div>

        <div className={css.showcasePanel}>
          <div className={css.showcaseHeading}>
            <h3 className={css.subsectionTitle}>SegmentedControl</h3>
            <p className={css.subsectionText}>Use when a compact option set directly changes the current view or metric.</p>
          </div>
          <div className={css.stack}>
            <SegmentedControl
              items={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
              ]}
              value={segment}
              onChange={setSegment}
            />
            <SegmentedControl
              fullWidth
              size="md"
              items={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly', disabled: true },
              ]}
              value={segment}
              onChange={setSegment}
            />
          </div>
          <p className={css.stateReadout}>
            Selected segment
            <strong>{segment}</strong>
          </p>
        </div>
      </div>
    </SectionFrame>
  );
}

function CollapsibleSection() {
  return (
    <SectionFrame
      description="Disclosure patterns are grouped as a progressive reveal system, with open and closed states shown side by side."
      eyebrow="Feedback"
      id="collapsible"
      title="Collapsible"
    >
      <div className={css.showcaseSplit}>
        <div className={css.showcasePanel}>
          <div className={css.showcaseHeading}>
            <h3 className={css.subsectionTitle}>Default Closed</h3>
            <p className={css.subsectionText}>Use closed-by-default when the detail is subordinate to the primary flow.</p>
          </div>
          <Collapsible>
            <CollapsibleTrigger>Review implementation details</CollapsibleTrigger>
            <CollapsiblePanel>
              <div className={css.contentNote}>
                Here is some collapsible content. It animates open and closed
                using the Base UI Collapsible primitive.
              </div>
            </CollapsiblePanel>
          </Collapsible>
        </div>

        <div className={css.showcasePanel}>
          <div className={css.showcaseHeading}>
            <h3 className={css.subsectionTitle}>Default Open</h3>
            <p className={css.subsectionText}>Use open-by-default when the detail is critical and only optionally hidden later.</p>
          </div>
          <Collapsible defaultOpen>
            <CollapsibleTrigger>Release notes summary</CollapsibleTrigger>
            <CollapsiblePanel>
              <div className={css.contentNote}>
                This section starts expanded by default.
              </div>
            </CollapsiblePanel>
          </Collapsible>
        </div>
      </div>
    </SectionFrame>
  );
}

function DialogSection() {
  return (
    <SectionFrame
      description="Dialogs are framed as confirmation surfaces, with the supporting copy exposed before interaction so intent is legible at rest."
      eyebrow="Feedback"
      id="dialog"
      title="Dialog"
    >
      <div className={css.showcaseSplit}>
        <div className={css.showcasePanel}>
          <div className={css.showcaseHeading}>
            <h3 className={css.subsectionTitle}>Resting Context</h3>
            <p className={css.subsectionText}>Confirmation dialogs should communicate destructive weight before the trigger is activated.</p>
          </div>
          <div className={css.dialogPreview}>
            <p className={css.dialogPreviewLabel}>Intent</p>
            <h4 className={css.dialogPreviewTitle}>Confirm Action</h4>
            <p className={css.dialogPreviewText}>Proceeding will apply a change that cannot be undone.</p>
          </div>
        </div>

        <div className={css.showcasePanel}>
          <div className={css.showcaseHeading}>
            <h3 className={css.subsectionTitle}>Interactive Preview</h3>
            <p className={css.subsectionText}>The trigger is kept adjacent to the explanatory copy so the pattern reads as one unit.</p>
          </div>
          <Dialog>
            <DialogTrigger render={<ActionButton variant="solid">Open Dialog</ActionButton>} />
            <DialogPopup>
              <DialogHeader>
                <DialogTitle>Confirm Action</DialogTitle>
                <DialogDescription>
                  Are you sure you want to proceed? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<ActionButton variant="ghost">Cancel</ActionButton>} />
                <DialogClose render={<ActionButton variant="accent">Confirm</ActionButton>} />
              </DialogFooter>
            </DialogPopup>
          </Dialog>
        </div>
      </div>
    </SectionFrame>
  );
}

function TooltipSection() {
  return (
    <SectionFrame
      description="Tooltip examples are presented as annotation patterns attached to specific control contexts."
      eyebrow="Feedback"
      id="tooltip"
      title="Tooltip"
    >
      <div className={css.showcasePanel}>
        <TooltipProvider>
          <div className={css.inlineGroup}>
            <TooltipRoot>
              <TooltipTrigger render={<ActionButton variant="outline">Chart summary</ActionButton>} />
              <TooltipContent side="top">Tooltip on top</TooltipContent>
            </TooltipRoot>
            <TooltipRoot>
              <TooltipTrigger render={<ActionButton variant="outline">Data freshness</ActionButton>} />
              <TooltipContent side="bottom">Tooltip on bottom</TooltipContent>
            </TooltipRoot>
            <TooltipRoot>
              <TooltipTrigger render={<ActionButton icon variant="ghost"><Settings size={16} /></ActionButton>} />
              <TooltipContent>Settings</TooltipContent>
            </TooltipRoot>
          </div>
        </TooltipProvider>
      </div>
    </SectionFrame>
  );
}

function CheckboxSection() {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(true);

  return (
    <SectionFrame
      description="Checkboxes are placed in a settings-style list to show how labels, descriptions, and state cohere within a panel."
      eyebrow="Controls"
      id="checkbox"
      title="Checkbox"
    >
      <div className={css.showcasePanel}>
        <div className={css.stack}>
          <AnimatedCheckbox
            checked={checked1}
            description="Click to toggle"
            label="Unchecked by default"
            onChange={setChecked1}
          />
          <AnimatedCheckbox
            checked={checked2}
            description="With a description"
            label="Checked by default"
            onChange={setChecked2}
          />
          <AnimatedCheckbox disabled label="Disabled checkbox" />
        </div>
      </div>
    </SectionFrame>
  );
}

function StatusDotSection() {
  return (
    <SectionFrame
      description="Status tokens are shown in compact monitoring rows to emphasize semantic reading, not only chromatic variation."
      eyebrow="Controls"
      id="status-dot"
      title="StatusDot"
    >
      <div className={css.showcaseSplit}>
        <div className={css.showcasePanel}>
          <div className={css.showcaseHeading}>
            <h3 className={css.subsectionTitle}>Without Pulse</h3>
            <p className={css.subsectionText}>Static dots work best for durable state markers.</p>
          </div>
          <div className={css.statusList}>
            {statusDotStatuses.map((status) => (
              <div key={status} className={css.statusRow}>
                <StatusDot status={status} />
                <span className={css.statusName}>{status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={css.showcasePanel}>
          <div className={css.showcaseHeading}>
            <h3 className={css.subsectionTitle}>With Pulse</h3>
            <p className={css.subsectionText}>Pulse treatment adds urgency for actively changing or attention-seeking states.</p>
          </div>
          <div className={css.statusList}>
            {statusDotStatuses.map((status) => (
              <div key={status} className={css.statusRow}>
                <StatusDot pulse status={status} />
                <span className={css.statusName}>{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionFrame>
  );
}

function CodeBlockSection() {
  return (
    <SectionFrame
      description="Code presentation is treated as content, with supporting notes explaining when the component should carry technical detail."
      eyebrow="Content"
      id="code-block"
      title="CodeBlock"
    >
      <div className={css.showcaseSplit}>
        <div className={css.showcasePanel}>
          <div className={css.showcaseHeading}>
            <h3 className={css.subsectionTitle}>Reference Snippet</h3>
            <p className={css.subsectionText}>Use code blocks for implementation guidance, usage examples, and token references.</p>
          </div>
          <CodeBlock code={sampleCode} language="typescript" />
        </div>

        <div className={css.showcasePanel}>
          <div className={css.showcaseHeading}>
            <h3 className={css.subsectionTitle}>Presentation Notes</h3>
            <p className={css.subsectionText}>Code surfaces should remain visually distinct from the document canvas while preserving long-form readability.</p>
          </div>
          <div className={css.codeNotes}>
            <p className={css.contentNote}>Keep code blocks on darker contrast islands to separate implementation detail from narrative content.</p>
            <p className={css.contentNote}>Use concise snippets for explanation and reserve longer excerpts for reference-heavy sections.</p>
            <p className={css.contentNote}>Pair code with short framing copy so readers know why the snippet matters before parsing syntax.</p>
          </div>
        </div>
      </div>
    </SectionFrame>
  );
}

export function DesignPage() {
  const theme = useTheme();
  const { section } = useParams();

  useEffect(() => {
    const scrollPane = document.querySelector('.app-main');

    if (!(scrollPane instanceof HTMLElement)) {
      return;
    }

    if (!isSectionId(section)) {
      scrollPane.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    const nextSection = document.getElementById(section);

    if (!nextSection) {
      return;
    }

    requestAnimationFrame(() => {
      nextSection.scrollIntoView({ block: 'start', behavior: 'auto' });
    });
  }, [section]);

  return (
    <PortalThemeProvider className={getVariantClass('article')} theme={theme}>
      <ColorSchemeProvider colorScheme={theme}>
        <div className={css.pageLayout}>
          <SideNav />
          <div className={css.content}>
            <PageHero />
            <div className={css.sectionStack}>
              <TokensSection />
              <ActionButtonSection />
              <BadgeSection />
              <AlertSection />
              <SpinnerSection />
              <SelectSection />
              <TabsSection />
              <CollapsibleSection />
              <DialogSection />
              <TooltipSection />
              <CheckboxSection />
              <StatusDotSection />
              <CodeBlockSection />
            </div>
          </div>
        </div>
      </ColorSchemeProvider>
    </PortalThemeProvider>
  );
}
