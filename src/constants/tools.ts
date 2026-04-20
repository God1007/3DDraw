import type { ToolKind, TransformMode } from '../types/scene';

export const TOOL_OPTIONS = [
  { value: 'select', label: 'Select' },
  { value: 'transform', label: 'Transform' },
  { value: 'crayon', label: 'Crayon' },
  { value: 'eraser', label: 'Eraser' },
  { value: 'deform', label: 'Deform' },
] as const satisfies ReadonlyArray<{ value: ToolKind; label: string }>;

export const TRANSFORM_MODES = [
  { value: 'translate', label: 'Translate' },
  { value: 'rotate', label: 'Rotate' },
  { value: 'scale', label: 'Scale' },
] as const satisfies ReadonlyArray<{ value: TransformMode; label: string }>;
