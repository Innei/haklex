import {
  ActionButton,
  Alert,
  Badge,
  CodeBlock,
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
  ScrollArea,
  Spinner,
  StatusDot,
} from '@haklex/rich-editor-ui';

import { Force, hover, StateCell, StateGrid } from '../../../components/preview/States';
import type { ComponentDemo } from '../../components/types';

const alertVariants = ['info', 'warning', 'error'] as const;
const alertCopy = {
  info: 'Changes sync when you go back online.',
  warning: 'This image is larger than 5 MB.',
  error: 'Upload failed. Check the connection and try again.',
};

export const alertDemo: ComponentDemo = {
  Preview: () => (
    <div className="demo-stack demo-fill">
      {alertVariants.map((v) => (
        <Alert key={v} variant={v}>
          {alertCopy[v]}
        </Alert>
      ))}
    </div>
  ),
  States: () => (
    <div className="demo-stack">
      {alertVariants.map((v) => (
        <Alert
          key={v}
          variant={v}
          action={
            <ActionButton size="sm" variant="ghost">
              Retry
            </ActionButton>
          }
        >
          {`${v} with an action`}
        </Alert>
      ))}
    </div>
  ),
};

const badgeVariants = ['neutral', 'success', 'error', 'warning', 'info'] as const;

export const badgeDemo: ComponentDemo = {
  Preview: () => (
    <div className="demo-center demo-row">
      {badgeVariants.map((v) => (
        <Badge key={v} variant={v}>
          {v}
        </Badge>
      ))}
    </div>
  ),
  States: () => (
    <StateGrid>
      {(['sm', 'md'] as const).map((size) => (
        <StateCell key={size} label={`Size ${size}`}>
          {badgeVariants.map((v) => (
            <Badge key={v} size={size} variant={v}>
              {v}
            </Badge>
          ))}
        </StateCell>
      ))}
    </StateGrid>
  ),
};

const statuses = ['idle', 'active', 'success', 'error', 'warning'] as const;

export const statusDotDemo: ComponentDemo = {
  Preview: () => (
    <div className="demo-center demo-row">
      {statuses.map((s) => (
        <span className="demo-inline" key={s}>
          <StatusDot pulse={s === 'active'} status={s} />
          {s}
        </span>
      ))}
    </div>
  ),
  States: () => (
    <StateGrid>
      {(['sm', 'md'] as const).map((size) => (
        <StateCell key={size} label={`Size ${size}`}>
          {statuses.map((s) => (
            <StatusDot key={s} size={size} status={s} />
          ))}
        </StateCell>
      ))}
      <StateCell label="Pulse">
        {statuses.map((s) => (
          <StatusDot pulse key={s} status={s} />
        ))}
      </StateCell>
    </StateGrid>
  ),
};

export const spinnerDemo: ComponentDemo = {
  Preview: () => (
    <div className="demo-center demo-row">
      <Spinner size="sm" />
      <Spinner size="md" />
    </div>
  ),
  States: () => (
    <StateGrid>
      <StateCell label="Size sm">
        <Spinner size="sm" />
      </StateCell>
      <StateCell label="Size md">
        <Spinner size="md" />
      </StateCell>
    </StateGrid>
  ),
};

const panelText =
  'Collapsed blocks keep their content in the document. Readers open them when they need the detail.';

export const collapsibleDemo: ComponentDemo = {
  Preview: () => (
    <div className="demo-stack demo-fill">
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Show details</CollapsibleTrigger>
        <CollapsiblePanel>
          <p className="demo-text">{panelText}</p>
        </CollapsiblePanel>
      </Collapsible>
      <Collapsible>
        <CollapsibleTrigger>Closed section</CollapsibleTrigger>
        <CollapsiblePanel>
          <p className="demo-text">{panelText}</p>
        </CollapsiblePanel>
      </Collapsible>
    </div>
  ),
  States: () => (
    <StateGrid>
      <StateCell label="Closed">
        <Collapsible>
          <CollapsibleTrigger>Trigger</CollapsibleTrigger>
        </Collapsible>
      </StateCell>
      <StateCell label="Open">
        <Collapsible open>
          <CollapsibleTrigger>Trigger</CollapsibleTrigger>
        </Collapsible>
      </StateCell>
      <StateCell label="Hover">
        <Collapsible>
          <Force attrs={hover}>
            <CollapsibleTrigger>Trigger</CollapsibleTrigger>
          </Force>
        </Collapsible>
      </StateCell>
      <StateCell label="No chevron">
        <Collapsible>
          <CollapsibleTrigger hideChevron>Trigger</CollapsibleTrigger>
        </Collapsible>
      </StateCell>
    </StateGrid>
  ),
};

const lines = Array.from({ length: 24 }, (_, i) => `Line ${i + 1}: scroll to see the thumb.`);

export const scrollAreaDemo: ComponentDemo = {
  statesNote: 'The thumb shows while scrolling. Scroll the preview to check it.',
  Preview: () => (
    <div className="demo-scroll">
      <ScrollArea>
        {lines.map((line) => (
          <p className="demo-text" key={line}>
            {line}
          </p>
        ))}
      </ScrollArea>
    </div>
  ),
};

const sample = `import { vars } from '@haklex/rich-style-token';

export function quiet(color: string) {
  return \`color-mix(in oklab, \${color} 10%, transparent)\`;
}`;

export const codeBlockDemo: ComponentDemo = {
  Preview: () => (
    <div className="demo-fill">
      <CodeBlock code={sample} language="ts" />
    </div>
  ),
  States: () => (
    <div className="demo-stack">
      <StateCell label="Line numbers">
        <div className="demo-fill">
          <CodeBlock showLineNumbers code={sample} language="ts" />
        </div>
      </StateCell>
      <StateCell label="Compact chrome, no copy button">
        <div className="demo-fill">
          <CodeBlock chrome="compact" code={sample} language="ts" showCopyButton={false} />
        </div>
      </StateCell>
    </div>
  ),
};
