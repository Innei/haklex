import { EditorSurfacePlugin } from '../context/EditorSurfaceContext';
import type { EditorVirtualization } from '../virtualization/types';
import { VirtualizationPlugin } from '../virtualization/VirtualizationPlugin';

/** Convenience adapter. The core surface host never inspects virtualization options. */
export function VirtualizationFromProps({ value }: { value?: EditorVirtualization }) {
  if (value === undefined) return null;
  return value === false ? (
    <EditorSurfacePlugin priority={1} surface={null} />
  ) : (
    <VirtualizationPlugin {...(value === true ? {} : value)} priority={1} />
  );
}
