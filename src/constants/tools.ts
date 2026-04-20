import type { ToolKind, TransformMode } from '../types/scene';

export const TOOL_OPTIONS = [
  { value: 'select', label: 'Select' },
  { value: 'transform', label: 'Move' },
  { value: 'crayon', label: 'Crayon' },
  { value: 'eraser', label: 'Eraser' },
  { value: 'deform', label: 'Deform' },
] as const satisfies ReadonlyArray<{ value: ToolKind; label: string }>;

export const TRANSFORM_MODES = [
  { value: 'translate', label: 'translate' },
  { value: 'rotate', label: 'rotate' },
  { value: 'scale', label: 'scale' },
] as const satisfies ReadonlyArray<{ value: TransformMode; label: string }>;
