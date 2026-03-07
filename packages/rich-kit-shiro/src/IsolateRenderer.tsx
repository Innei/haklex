import root from 'react-shadow';

import type { ShiroRendererProps } from './ShiroRenderer';
import { ShiroRenderer } from './ShiroRenderer';
// @ts-expect-error -- vite ?inline returns processed CSS as string
import cssText from './style.css?inline';

const resolvedCss = (cssText as string).replaceAll(':root {', ':root, :host {');

export type IsolateRendererProps = ShiroRendererProps & {
  extraCss?: string;
};

export function IsolateRenderer({
  theme = 'light',
  className,
  extraCss,
  ...props
}: IsolateRendererProps) {
  return (
    <root.div className={className}>
      <div suppressHydrationWarning data-theme={theme} id="shadow-html">
        <style
          dangerouslySetInnerHTML={{
            __html: extraCss ? resolvedCss + extraCss : resolvedCss,
          }}
        />
        <ShiroRenderer {...props} theme={theme} />
      </div>
    </root.div>
  );
}
