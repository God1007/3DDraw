export type PrimitiveKind = 'sphere' | 'cube' | 'box' | 'cylinder' | 'cone' | 'capsule';

export type ToolKind = 'select' | 'transform' | 'crayon' | 'eraser' | 'deform';

export type TransformMode = 'translate' | 'rotate' | 'scale';

export type EraserShape = 'sphere' | 'cube' | 'cylinder';

export type DeformMode = 'pushPull' | 'inflate' | 'smooth';

export type DrawingPlaneMode = 'camera' | 'ground';

export type Vec3 = [number, number, number];

export interface EditableGeometryData {
  positions: number[];
  indices: number[];
  normals: number[];
  neighbors: number[][];
}

export interface PrimitiveObject {
  id: string;
  type: PrimitiveKind;
  color: string;
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
  geometryData: EditableGeometryData;
  meshResolution: number;
}

export interface StrokeSegment {
  center: Vec3;
  rotation: [number, number, number, number];
  radius: number;
  length: number;
}

export interface CrayonStroke {
  id: string;
  color: string;
  points: Vec3[];
  thickness: number;
  jitterSeed: number;
  segmentData: StrokeSegment[];
}

export interface LightSettings {
  directionalX: number;
  directionalY: number;
  directionalZ: number;
  ambientIntensity: number;
}

export interface BrushSettings {
  eraserShape: EraserShape;
  eraserRadius: number;
  deformMode: DeformMode;
  deformRadius: number;
  deformStrength: number;
  drawingPlaneMode: DrawingPlaneMode;
}

export interface SceneSnapshot {
  primitives: PrimitiveObject[];
  strokes: CrayonStroke[];
  selectionId: string | null;
  activeTool: ToolKind;
  activeColor: string;
  transformMode: TransformMode;
  lights: LightSettings;
  brush: BrushSettings;
}
