import { DEFAULT_COLOR } from '../constants/palette';
import type {
  BrushSettings,
  LightSettings,
  SceneSnapshot,
  ToolKind,
  TransformMode,
} from '../types/scene';

const DEFAULT_LIGHTS: LightSettings = {
  directionalX: 5,
  directionalY: 6,
  directionalZ: 4,
  ambientIntensity: 0.65,
};

const DEFAULT_BRUSH: BrushSettings = {
  eraserShape: 'sphere',
  eraserRadius: 0.7,
  deformMode: 'pushPull',
  deformRadius: 0.9,
  deformStrength: 0.18,
  drawingPlaneMode: 'camera',
};

export function buildInitialSnapshot(): SceneSnapshot {
  const activeTool: ToolKind = 'select';
  const transformMode: TransformMode = 'translate';

  return {
    primitives: [],
    strokes: [],
    selectionId: null,
    activeTool,
    activeColor: DEFAULT_COLOR,
    transformMode,
    lights: structuredClone(DEFAULT_LIGHTS),
    brush: structuredClone(DEFAULT_BRUSH),
  };
}

export const DEFAULT_SCENE = buildInitialSnapshot();
