# 3D Crayon Modeler Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a desktop-first React + React Three Fiber web app for playful 3D crayon modeling with primitive creation, stylized wax rendering, 3D crayon strokes, lighting controls, approximate erasing, mesh deformation, undo/redo, and PNG/JPG export.

**Architecture:** The app uses a serializable Zustand scene store, a modular sidebar UI, and a Three/R3F scene that renders editable primitive meshes plus chunky stroke segments. Geometry-heavy behavior such as crayon stroke building, eraser carving, and deform brushes lives in pure utility modules first, then gets wired into canvas pointer interactions and history commits.

**Tech Stack:** Vite, React, TypeScript, React Three Fiber, Drei, Zustand, Three.js, Vitest, Testing Library

---

## Target File Structure

### Root Setup

- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Modify: `README.md`

### App Shell

- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles/global.css`
- Create: `src/test/setup.ts`
- Create: `src/vite-env.d.ts`

### Shared Types and Store

- Create: `src/types/scene.ts`
- Create: `src/constants/palette.ts`
- Create: `src/constants/tools.ts`
- Create: `src/store/defaultScene.ts`
- Create: `src/store/history.ts`
- Create: `src/store/sceneStore.ts`

### Feature Logic

- Create: `src/features/primitives/createPrimitive.ts`
- Create: `src/features/style/createCrayonTexture.ts`
- Create: `src/features/strokes/buildStrokeSegments.ts`
- Create: `src/features/eraser/applyEraser.ts`
- Create: `src/features/deform/applyDeform.ts`
- Create: `src/features/export/exportViewport.ts`

### UI Components

- Create: `src/components/layout/AppShell.tsx`
- Create: `src/components/panels/ShapePanel.tsx`
- Create: `src/components/panels/ToolPanel.tsx`
- Create: `src/components/panels/ColorPalette.tsx`
- Create: `src/components/panels/BrushPanel.tsx`
- Create: `src/components/panels/LightPanel.tsx`
- Create: `src/components/panels/ActionPanel.tsx`

### Scene Components

- Create: `src/scene/SceneCanvas.tsx`
- Create: `src/scene/SceneEnvironment.tsx`
- Create: `src/scene/PrimitiveMesh.tsx`
- Create: `src/scene/StrokeMesh.tsx`
- Create: `src/scene/SelectionOutline.tsx`
- Create: `src/scene/ToolCursor.tsx`

### Interaction Helpers

- Create: `src/tools/workingPlane.ts`
- Create: `src/tools/useSceneInteractions.ts`

### Tests

- Create: `tests/app.test.tsx`
- Create: `tests/features/createPrimitive.test.ts`
- Create: `tests/store/history.test.ts`
- Create: `tests/components/appShell.test.tsx`
- Create: `tests/features/buildStrokeSegments.test.ts`
- Create: `tests/features/applyEraser.test.ts`
- Create: `tests/features/applyDeform.test.ts`
- Create: `tests/components/actionPanel.test.tsx`

## Task 1: Bootstrap the Vite + React + Test Harness

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles/global.css`
- Create: `src/test/setup.ts`
- Create: `src/vite-env.d.ts`
- Test: `tests/app.test.tsx`

- [ ] **Step 1: Write the project config and Vite test harness**

```json
{
  "name": "3d-crayon-modeler",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "@react-three/drei": "^10.0.0",
    "@react-three/fiber": "^9.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "three": "^0.179.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.0",
    "@types/node": "^22.15.0",
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "@vitejs/plugin-react": "^5.0.0",
    "jsdom": "^26.1.0",
    "typescript": "^5.8.0",
    "vite": "^7.0.0",
    "vitest": "^3.1.0"
  }
}
```

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
});
```

```ts
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`

Expected: `added ... packages` and no fatal dependency resolution errors.

- [ ] **Step 3: Write a failing smoke test for the app shell**

```tsx
// tests/app.test.tsx
import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App', () => {
  it('renders the app title and workspace region', () => {
    render(<App />);

    expect(screen.getByText(/3D Crayon Modeler/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/workspace/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Write the minimum app entry files to satisfy the smoke test**

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

```tsx
// src/App.tsx
export default function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <h1>3D Crayon Modeler</h1>
        <p>Playful wax-crayon 3D doodling studio.</p>
      </aside>
      <main aria-label="workspace" className="workspace">
        <div className="workspace-placeholder">Scene canvas goes here.</div>
      </main>
    </div>
  );
}
```

```css
/* src/styles/global.css */
:root {
  color-scheme: light;
  font-family: "Trebuchet MS", "Comic Sans MS", sans-serif;
  background: #f6ead4;
  color: #3a2e28;
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  margin: 0;
  min-height: 100%;
  height: 100%;
}

body {
  background:
    radial-gradient(circle at top, #fff7eb 0%, #f6ead4 55%, #ecd7b6 100%);
}

.app {
  display: grid;
  grid-template-columns: 320px 1fr;
  min-height: 100vh;
}

.sidebar {
  padding: 24px;
  border-right: 3px solid rgba(92, 64, 51, 0.12);
  background: rgba(255, 248, 236, 0.88);
  backdrop-filter: blur(12px);
}

.workspace {
  padding: 24px;
}

.workspace-placeholder {
  height: calc(100vh - 48px);
  border-radius: 28px;
  border: 3px dashed rgba(92, 64, 51, 0.24);
  background: rgba(255, 255, 255, 0.32);
}
```

- [ ] **Step 5: Run the smoke test and a production build**

Run: `npm test -- --run tests/app.test.tsx`

Expected: `1 passed`

Run: `npm run build`

Expected: `vite build` completes successfully and emits `dist/`.

- [ ] **Step 6: Commit the bootstrap**

```bash
git add package.json tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts index.html src tests
git commit -m "chore: bootstrap crayon modeler app"
```

## Task 2: Define Scene Types, Palette, Primitive Factory, and History Store

**Files:**
- Create: `src/types/scene.ts`
- Create: `src/constants/palette.ts`
- Create: `src/constants/tools.ts`
- Create: `src/store/defaultScene.ts`
- Create: `src/store/history.ts`
- Create: `src/store/sceneStore.ts`
- Create: `src/features/primitives/createPrimitive.ts`
- Test: `tests/features/createPrimitive.test.ts`
- Test: `tests/store/history.test.ts`

- [ ] **Step 1: Write failing tests for primitive creation and snapshot history**

```ts
// tests/features/createPrimitive.test.ts
import { describe, expect, it } from 'vitest';
import { createPrimitive } from '../../src/features/primitives/createPrimitive';

describe('createPrimitive', () => {
  it('creates a centered capsule with editable geometry data', () => {
    const primitive = createPrimitive('capsule', '#ffd166');

    expect(primitive.type).toBe('capsule');
    expect(primitive.color).toBe('#ffd166');
    expect(primitive.position).toEqual([0, 0, 0]);
    expect(primitive.geometryData.positions.length).toBeGreaterThan(0);
    expect(primitive.geometryData.indices.length).toBeGreaterThan(0);
    expect(primitive.geometryData.neighbors.length).toBeGreaterThan(0);
  });
});
```

```ts
// tests/store/history.test.ts
import { describe, expect, it } from 'vitest';
import { createHistoryState, pushHistory, redoHistory, undoHistory } from '../../src/store/history';

describe('history helpers', () => {
  it('undoes and redoes serializable scene snapshots', () => {
    const initial = { primitives: [], strokes: [], selectionId: null };
    const afterAdd = { primitives: [{ id: 'a' }], strokes: [], selectionId: 'a' };

    const seeded = pushHistory(createHistoryState(initial), afterAdd);
    const undone = undoHistory(seeded);
    const redone = redoHistory(undone);

    expect(undone.present).toEqual(initial);
    expect(redone.present).toEqual(afterAdd);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- --run tests/features/createPrimitive.test.ts tests/store/history.test.ts`

Expected: FAIL with module-not-found or missing-export errors.

- [ ] **Step 3: Implement the scene types, palette constants, primitive factory, and history-aware store**

```ts
// src/types/scene.ts
export type PrimitiveKind = 'sphere' | 'cube' | 'box' | 'cylinder' | 'cone' | 'capsule';
export type ToolKind = 'select' | 'transform' | 'crayon' | 'eraser' | 'deform';
export type TransformMode = 'translate' | 'rotate' | 'scale';
export type EraserShape = 'sphere' | 'cube' | 'cylinder';
export type DeformMode = 'pushPull' | 'inflate' | 'smooth';

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
  drawingPlaneMode: 'camera' | 'ground';
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
```

```ts
// src/constants/palette.ts
export const CRAYON_COLORS = [
  { name: 'Red', value: '#ef476f' },
  { name: 'Orange', value: '#f78c35' },
  { name: 'Yellow', value: '#ffd166' },
  { name: 'Light Green', value: '#9adf6d' },
  { name: 'Green', value: '#43aa5c' },
  { name: 'Cyan', value: '#48c6c2' },
  { name: 'Light Blue', value: '#7cc7ff' },
  { name: 'Blue', value: '#3a86ff' },
  { name: 'Purple', value: '#8e6ad8' },
  { name: 'Pink', value: '#ff86c8' },
  { name: 'Brown', value: '#9c6644' },
  { name: 'Black', value: '#2d2a32' },
] as const;

export const DEFAULT_COLOR = CRAYON_COLORS[0].value;
```

```ts
// src/constants/tools.ts
export const TOOL_OPTIONS = [
  { label: 'Select', value: 'select' },
  { label: 'Move', value: 'transform' },
  { label: 'Crayon', value: 'crayon' },
  { label: 'Eraser', value: 'eraser' },
  { label: 'Deform', value: 'deform' },
] as const;

export const TRANSFORM_MODES = [
  { label: 'translate', value: 'translate' },
  { label: 'rotate', value: 'rotate' },
  { label: 'scale', value: 'scale' },
] as const;
```

```ts
// src/store/history.ts
export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function createHistoryState<T>(present: T): HistoryState<T> {
  return { past: [], present, future: [] };
}

export function pushHistory<T>(history: HistoryState<T>, next: T): HistoryState<T> {
  return {
    past: [...history.past, history.present],
    present: structuredClone(next),
    future: [],
  };
}

export function undoHistory<T>(history: HistoryState<T>): HistoryState<T> {
  if (history.past.length === 0) return history;

  const previous = history.past[history.past.length - 1];
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  };
}

export function redoHistory<T>(history: HistoryState<T>): HistoryState<T> {
  if (history.future.length === 0) return history;

  const [next, ...rest] = history.future;
  return {
    past: [...history.past, history.present],
    present: next,
    future: rest,
  };
}
```

```ts
// src/store/defaultScene.ts
import { DEFAULT_COLOR } from '../constants/palette';
import type { SceneSnapshot } from '../types/scene';

export function buildInitialSnapshot(): SceneSnapshot {
  return {
    primitives: [],
    strokes: [],
    selectionId: null,
    activeTool: 'select',
    activeColor: DEFAULT_COLOR,
    transformMode: 'translate',
    lights: {
      directionalX: 5,
      directionalY: 6,
      directionalZ: 4,
      ambientIntensity: 0.65,
    },
    brush: {
      eraserShape: 'sphere',
      eraserRadius: 0.7,
      deformMode: 'pushPull',
      deformRadius: 0.9,
      deformStrength: 0.18,
      drawingPlaneMode: 'camera',
    },
  };
}
```

```ts
// src/features/primitives/createPrimitive.ts
import {
  BoxGeometry,
  CapsuleGeometry,
  ConeGeometry,
  CylinderGeometry,
  SphereGeometry,
  BufferGeometry,
} from 'three';
import type { EditableGeometryData, PrimitiveKind, PrimitiveObject } from '../../types/scene';

function buildNeighborMap(indices: number[], vertexCount: number) {
  const neighbors = Array.from({ length: vertexCount }, () => new Set<number>());

  for (let index = 0; index < indices.length; index += 3) {
    const a = indices[index];
    const b = indices[index + 1];
    const c = indices[index + 2];
    neighbors[a].add(b).add(c);
    neighbors[b].add(a).add(c);
    neighbors[c].add(a).add(b);
  }

  return neighbors.map((entry) => Array.from(entry));
}

function toEditableGeometryData(geometry: BufferGeometry): EditableGeometryData {
  const indexed = geometry.clone();
  indexed.computeVertexNormals();

  const positions = Array.from(indexed.attributes.position.array as Iterable<number>);
  const normals = Array.from(indexed.attributes.normal.array as Iterable<number>);
  const indices = indexed.index
    ? Array.from(indexed.index.array as Iterable<number>)
    : Array.from({ length: positions.length / 3 }, (_, index) => index);
  const neighbors = buildNeighborMap(indices, positions.length / 3);

  return { positions, indices, normals, neighbors };
}

function createBaseGeometry(type: PrimitiveKind) {
  switch (type) {
    case 'sphere':
      return new SphereGeometry(1, 28, 24);
    case 'cube':
      return new BoxGeometry(1.5, 1.5, 1.5, 8, 8, 8);
    case 'box':
      return new BoxGeometry(2, 1.25, 1.5, 10, 8, 8);
    case 'cylinder':
      return new CylinderGeometry(0.9, 0.9, 2, 24, 12);
    case 'cone':
      return new ConeGeometry(1, 2, 24, 12);
    case 'capsule':
      return new CapsuleGeometry(0.75, 1.25, 10, 20);
  }
}

export function createPrimitive(type: PrimitiveKind, color: string): PrimitiveObject {
  return {
    id: crypto.randomUUID(),
    type,
    color,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    geometryData: toEditableGeometryData(createBaseGeometry(type)),
    meshResolution: 1,
  };
}
```

```ts
// src/store/sceneStore.ts
import { create } from 'zustand';
import { createPrimitive } from '../features/primitives/createPrimitive';
import { buildInitialSnapshot } from './defaultScene';
import { createHistoryState, pushHistory, redoHistory, undoHistory } from './history';
import type { PrimitiveKind, SceneSnapshot, Vec3 } from '../types/scene';

type SceneStore = {
  history: ReturnType<typeof createHistoryState<SceneSnapshot>>;
  setTool: (tool: SceneSnapshot['activeTool']) => void;
  setColor: (color: string) => void;
  setTransformMode: (mode: SceneSnapshot['transformMode']) => void;
  selectEntity: (id: string | null) => void;
  addPrimitive: (type: PrimitiveKind) => void;
  updateSelectionTransform: (id: string, transform: { position: Vec3; rotation: Vec3; scale: Vec3 }, commit?: boolean) => void;
  replaceSnapshot: (next: SceneSnapshot, commit?: boolean) => void;
  updateLights: (partial: Partial<SceneSnapshot['lights']>) => void;
  updateBrush: (partial: Partial<SceneSnapshot['brush']>) => void;
  deleteSelected: () => void;
  resetScene: () => void;
  undo: () => void;
  redo: () => void;
};

const initialSnapshot = buildInitialSnapshot();

export const useSceneStore = create<SceneStore>((set) => ({
  history: createHistoryState(initialSnapshot),
  setTool: (activeTool) =>
    set((state) => ({ history: { ...state.history, present: { ...state.history.present, activeTool } } })),
  setColor: (activeColor) =>
    set((state) => {
      const selected = state.history.present.selectionId;
      const next = structuredClone(state.history.present);
      next.activeColor = activeColor;

      if (!selected) {
        return { history: { ...state.history, present: next } };
      }

      next.primitives = next.primitives.map((primitive) =>
        primitive.id === selected ? { ...primitive, color: activeColor } : primitive,
      );
      next.strokes = next.strokes.map((stroke) =>
        stroke.id === selected ? { ...stroke, color: activeColor } : stroke,
      );

      return { history: pushHistory(state.history, next) };
    }),
  setTransformMode: (transformMode) =>
    set((state) => ({ history: { ...state.history, present: { ...state.history.present, transformMode } } })),
  selectEntity: (selectionId) =>
    set((state) => ({ history: { ...state.history, present: { ...state.history.present, selectionId } } })),
  addPrimitive: (type) =>
    set((state) => {
      const next = structuredClone(state.history.present);
      const primitive = createPrimitive(type, next.activeColor);
      next.primitives.push(primitive);
      next.selectionId = primitive.id;
      next.activeTool = 'transform';
      return { history: pushHistory(state.history, next) };
    }),
  updateSelectionTransform: (id, transform, commit = false) =>
    set((state) => {
      const next = structuredClone(state.history.present);
      next.primitives = next.primitives.map((primitive) =>
        primitive.id === id ? { ...primitive, ...transform } : primitive,
      );
      return {
        history: commit ? pushHistory(state.history, next) : { ...state.history, present: next },
      };
    }),
  replaceSnapshot: (next, commit = false) =>
    set((state) => ({
      history: commit ? pushHistory(state.history, next) : { ...state.history, present: next },
    })),
  updateLights: (partial) =>
    set((state) => ({
      history: {
        ...state.history,
        present: { ...state.history.present, lights: { ...state.history.present.lights, ...partial } },
      },
    })),
  updateBrush: (partial) =>
    set((state) => ({
      history: {
        ...state.history,
        present: { ...state.history.present, brush: { ...state.history.present.brush, ...partial } },
      },
    })),
  deleteSelected: () =>
    set((state) => {
      const next = structuredClone(state.history.present);
      next.primitives = next.primitives.filter((item) => item.id !== next.selectionId);
      next.strokes = next.strokes.filter((item) => item.id !== next.selectionId);
      next.selectionId = null;
      return { history: pushHistory(state.history, next) };
    }),
  resetScene: () => set((state) => ({ history: pushHistory(state.history, buildInitialSnapshot()) })),
  undo: () => set((state) => ({ history: undoHistory(state.history) })),
  redo: () => set((state) => ({ history: redoHistory(state.history) })),
}));
```

- [ ] **Step 4: Run the tests again**

Run: `npm test -- --run tests/features/createPrimitive.test.ts tests/store/history.test.ts`

Expected: `2 passed`

- [ ] **Step 5: Commit the scene model layer**

```bash
git add src/constants src/features/primitives src/store src/types tests/features/createPrimitive.test.ts tests/store/history.test.ts
git commit -m "feat: add scene models and history store"
```

## Task 3: Build the Sidebar UI Shell and Wire It to the Store

**Files:**
- Create: `src/components/layout/AppShell.tsx`
- Create: `src/components/panels/ShapePanel.tsx`
- Create: `src/components/panels/ToolPanel.tsx`
- Create: `src/components/panels/ColorPalette.tsx`
- Create: `src/components/panels/BrushPanel.tsx`
- Create: `src/components/panels/LightPanel.tsx`
- Create: `src/components/panels/ActionPanel.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles/global.css`
- Test: `tests/components/appShell.test.tsx`

- [ ] **Step 1: Write a failing component test for tool and color selection**

```tsx
// tests/components/appShell.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';

describe('AppShell', () => {
  it('switches tools and colors from the sidebar', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /crayon/i }));
    await user.click(screen.getByRole('button', { name: /purple/i }));

    expect(screen.getByRole('button', { name: /crayon/i })).toHaveAttribute('data-active', 'true');
    expect(screen.getByLabelText(/selected color/i)).toHaveStyle({ background: '#8e6ad8' });
  });
});
```

- [ ] **Step 2: Run the component test to verify it fails**

Run: `npm test -- --run tests/components/appShell.test.tsx`

Expected: FAIL because the sidebar components and store wiring do not exist yet.

- [ ] **Step 3: Implement the sidebar layout and panels**

```tsx
// src/components/layout/AppShell.tsx
import { ReactNode } from 'react';

export function AppShell({ sidebar, canvas }: { sidebar: ReactNode; canvas: ReactNode }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">{sidebar}</aside>
      <main className="workspace">{canvas}</main>
    </div>
  );
}
```

```tsx
// src/components/panels/ToolPanel.tsx
import { TOOL_OPTIONS, TRANSFORM_MODES } from '../../constants/tools';
import { useSceneStore } from '../../store/sceneStore';

export function ToolPanel() {
  const activeTool = useSceneStore((state) => state.history.present.activeTool);
  const transformMode = useSceneStore((state) => state.history.present.transformMode);
  const setTool = useSceneStore((state) => state.setTool);
  const setTransformMode = useSceneStore((state) => state.setTransformMode);

  return (
    <section className="panel">
      <h2>Tools</h2>
      <div className="tool-grid">
        {TOOL_OPTIONS.map((tool) => (
          <button
            key={tool.value}
            data-active={String(activeTool === tool.value)}
            onClick={() => setTool(tool.value)}
            type="button"
          >
            {tool.label}
          </button>
        ))}
      </div>
      <div className="subtool-row">
        {TRANSFORM_MODES.map((mode) => (
          <button
            key={mode.value}
            data-active={String(transformMode === mode.value)}
            onClick={() => {
              setTool('transform');
              setTransformMode(mode.value);
            }}
            type="button"
          >
            {mode.label}
          </button>
        ))}
      </div>
    </section>
  );
}
```

```tsx
// src/components/panels/ColorPalette.tsx
import { CRAYON_COLORS } from '../../constants/palette';
import { useSceneStore } from '../../store/sceneStore';

export function ColorPalette() {
  const activeColor = useSceneStore((state) => state.history.present.activeColor);
  const setColor = useSceneStore((state) => state.setColor);

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Crayon Colors</h2>
        <span aria-label="selected color" className="selected-color" style={{ background: activeColor }} />
      </div>
      <div className="palette-grid">
        {CRAYON_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            aria-label={color.name}
            title={color.name}
            data-active={String(activeColor === color.value)}
            className="swatch"
            style={{ background: color.value }}
            onClick={() => setColor(color.value)}
          />
        ))}
      </div>
    </section>
  );
}
```

```tsx
// src/components/panels/ShapePanel.tsx
import { useSceneStore } from '../../store/sceneStore';
import type { PrimitiveKind } from '../../types/scene';

const SHAPES: PrimitiveKind[] = ['sphere', 'cube', 'box', 'cylinder', 'cone', 'capsule'];

export function ShapePanel() {
  const addPrimitive = useSceneStore((state) => state.addPrimitive);

  return (
    <section className="panel">
      <h2>Shapes</h2>
      <div className="shape-grid">
        {SHAPES.map((shape) => (
          <button key={shape} type="button" onClick={() => addPrimitive(shape)}>
            {shape}
          </button>
        ))}
      </div>
    </section>
  );
}
```

```tsx
// src/components/panels/BrushPanel.tsx
import { useSceneStore } from '../../store/sceneStore';

export function BrushPanel() {
  const brush = useSceneStore((state) => state.history.present.brush);
  const updateBrush = useSceneStore((state) => state.updateBrush);

  return (
    <section className="panel">
      <h2>Brush</h2>
      <label>
        Radius
        <input
          type="range"
          min="0.2"
          max="2"
          step="0.05"
          value={brush.eraserRadius}
          onChange={(event) => updateBrush({ eraserRadius: Number(event.target.value), deformRadius: Number(event.target.value) })}
        />
      </label>
      <label>
        Strength
        <input
          type="range"
          min="0.05"
          max="0.5"
          step="0.01"
          value={brush.deformStrength}
          onChange={(event) => updateBrush({ deformStrength: Number(event.target.value) })}
        />
      </label>
      <label>
        Drawing Plane
        <select
          value={brush.drawingPlaneMode}
          onChange={(event) => updateBrush({ drawingPlaneMode: event.target.value as 'camera' | 'ground' })}
        >
          <option value="camera">Camera</option>
          <option value="ground">Ground</option>
        </select>
      </label>
    </section>
  );
}
```

```tsx
// src/components/panels/LightPanel.tsx
import { useSceneStore } from '../../store/sceneStore';

export function LightPanel() {
  const lights = useSceneStore((state) => state.history.present.lights);
  const updateLights = useSceneStore((state) => state.updateLights);

  return (
    <section className="panel">
      <h2>Lights</h2>
      {(['directionalX', 'directionalY', 'directionalZ', 'ambientIntensity'] as const).map((key) => (
        <label key={key}>
          {key}
          <input
            type="range"
            min={key === 'ambientIntensity' ? '0.1' : '-10'}
            max={key === 'ambientIntensity' ? '1.5' : '10'}
            step="0.05"
            value={lights[key]}
            onChange={(event) =>
              updateLights({ [key]: Number(event.target.value) } as Partial<typeof lights>)
            }
          />
        </label>
      ))}
    </section>
  );
}
```

```tsx
// src/components/panels/ActionPanel.tsx
import { useSceneStore } from '../../store/sceneStore';

export function ActionPanel() {
  const selectionId = useSceneStore((state) => state.history.present.selectionId);
  const canUndo = useSceneStore((state) => state.history.past.length > 0);
  const canRedo = useSceneStore((state) => state.history.future.length > 0);
  const undo = useSceneStore((state) => state.undo);
  const redo = useSceneStore((state) => state.redo);
  const deleteSelected = useSceneStore((state) => state.deleteSelected);
  const resetScene = useSceneStore((state) => state.resetScene);

  return (
    <section className="panel">
      <h2>Actions</h2>
      <div className="action-grid">
        <button type="button" onClick={undo} disabled={!canUndo}>Undo</button>
        <button type="button" onClick={redo} disabled={!canRedo}>Redo</button>
        <button type="button" onClick={deleteSelected} disabled={!selectionId}>Delete Selected</button>
        <button type="button" onClick={resetScene}>Reset Scene</button>
        <button type="button" disabled>Export PNG</button>
        <button type="button" disabled>Export JPG</button>
      </div>
    </section>
  );
}
```

```tsx
// src/App.tsx
import { AppShell } from './components/layout/AppShell';
import { ActionPanel } from './components/panels/ActionPanel';
import { BrushPanel } from './components/panels/BrushPanel';
import { ColorPalette } from './components/panels/ColorPalette';
import { LightPanel } from './components/panels/LightPanel';
import { ShapePanel } from './components/panels/ShapePanel';
import { ToolPanel } from './components/panels/ToolPanel';

function Sidebar() {
  return (
    <>
      <header className="hero-card">
        <h1>3D Crayon Modeler</h1>
        <p>Squish, doodle, erase, and light waxy toy forms.</p>
      </header>
      <ShapePanel />
      <ToolPanel />
      <ColorPalette />
      <BrushPanel />
      <LightPanel />
      <ActionPanel />
    </>
  );
}

export default function App() {
  return (
    <AppShell
      sidebar={<Sidebar />}
      canvas={<div aria-label="workspace" className="workspace-placeholder">3D canvas loading...</div>}
    />
  );
}
```

- [ ] **Step 4: Update the global CSS so the panels look like a crayon toy UI**

```css
/* append to src/styles/global.css */
.app-shell {
  display: grid;
  grid-template-columns: 320px 1fr;
  min-height: 100vh;
}

.panel,
.hero-card {
  background: rgba(255, 251, 244, 0.88);
  border: 2px solid rgba(108, 82, 68, 0.12);
  border-radius: 24px;
  box-shadow: 0 12px 36px rgba(117, 87, 55, 0.12);
  padding: 16px;
  margin-bottom: 14px;
}

.shape-grid,
.tool-grid,
.palette-grid,
.action-grid {
  display: grid;
  gap: 10px;
}

.shape-grid,
.tool-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.palette-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.action-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

button {
  border: 0;
  border-radius: 16px;
  padding: 10px 12px;
  font: inherit;
  color: #3a2e28;
  background: #f9f0e3;
  box-shadow: inset 0 -3px 0 rgba(90, 63, 51, 0.12);
  cursor: pointer;
}

button[data-active='true'] {
  background: #ffe7a9;
  outline: 3px solid rgba(255, 193, 7, 0.28);
}

.swatch {
  aspect-ratio: 1;
}

.selected-color {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 2px solid rgba(58, 46, 40, 0.2);
}

.panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.subtool-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 10px;
}
```

- [ ] **Step 5: Run the sidebar component test**

Run: `npm test -- --run tests/components/appShell.test.tsx`

Expected: `1 passed`

- [ ] **Step 6: Commit the sidebar shell**

```bash
git add src/App.tsx src/components src/styles/global.css tests/components/appShell.test.tsx
git commit -m "feat: build crayon toolbar shell"
```

## Task 4: Render the Scene Canvas, Primitives, Selection, and Transform Controls

**Files:**
- Create: `src/scene/SceneCanvas.tsx`
- Create: `src/scene/SceneEnvironment.tsx`
- Create: `src/scene/PrimitiveMesh.tsx`
- Create: `src/scene/SelectionOutline.tsx`
- Modify: `src/App.tsx`
- Modify: `src/store/sceneStore.ts`

- [ ] **Step 1: Implement the scene environment and primitive renderer**

```tsx
// src/scene/SceneEnvironment.tsx
import { Grid } from '@react-three/drei';
import { useSceneStore } from '../store/sceneStore';

export function SceneEnvironment() {
  const lights = useSceneStore((state) => state.history.present.lights);

  return (
    <>
      <ambientLight intensity={lights.ambientIntensity} />
      <directionalLight
        castShadow
        intensity={1.2}
        position={[lights.directionalX, lights.directionalY, lights.directionalZ]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <Grid
        infiniteGrid
        position={[0, -2.25, 0]}
        cellSize={0.8}
        sectionSize={4}
        fadeDistance={32}
        cellColor="#d8c0a4"
        sectionColor="#b79674"
      />
    </>
  );
}
```

```tsx
// src/scene/SelectionOutline.tsx
import { Edges } from '@react-three/drei';

export function SelectionOutline() {
  return <Edges scale={1.02} color="#3a2e28" linewidth={2} />;
}
```

```tsx
// src/scene/PrimitiveMesh.tsx
import { useMemo, useRef } from 'react';
import { BufferAttribute, BufferGeometry, Mesh } from 'three';
import { TransformControls } from '@react-three/drei';
import { useSceneStore } from '../store/sceneStore';
import { SelectionOutline } from './SelectionOutline';
import type { PrimitiveObject } from '../types/scene';

function buildGeometry(primitive: PrimitiveObject) {
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(primitive.geometryData.positions), 3));
  geometry.setAttribute('normal', new BufferAttribute(new Float32Array(primitive.geometryData.normals), 3));
  geometry.setIndex(primitive.geometryData.indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function PrimitiveMesh({
  primitive,
  onTransformStart,
  onTransformEnd,
}: {
  primitive: PrimitiveObject;
  onTransformStart: () => void;
  onTransformEnd: (primitive: PrimitiveObject, mesh: Mesh) => void;
}) {
  const meshRef = useRef<Mesh>(null);
  const selectedId = useSceneStore((state) => state.history.present.selectionId);
  const activeTool = useSceneStore((state) => state.history.present.activeTool);
  const transformMode = useSceneStore((state) => state.history.present.transformMode);
  const selectEntity = useSceneStore((state) => state.selectEntity);

  const geometry = useMemo(() => buildGeometry(primitive), [primitive]);
  const isSelected = selectedId === primitive.id;

  const mesh = (
    <mesh
      ref={meshRef}
      geometry={geometry}
      castShadow
      receiveShadow
      position={primitive.position}
      rotation={primitive.rotation}
      scale={primitive.scale}
      onClick={(event) => {
        event.stopPropagation();
        selectEntity(primitive.id);
      }}
    >
      <meshToonMaterial color={primitive.color} />
      {isSelected && <SelectionOutline />}
    </mesh>
  );

  if (isSelected && activeTool === 'transform') {
    return (
      <>
        {mesh}
        <TransformControls
          object={meshRef}
          mode={transformMode}
          onMouseDown={onTransformStart}
          onMouseUp={() => {
            if (meshRef.current) onTransformEnd(primitive, meshRef.current);
          }}
        />
      </>
    );
  }

  return mesh;
}
```

```tsx
// src/scene/SceneCanvas.tsx
import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useSceneStore } from '../store/sceneStore';
import { PrimitiveMesh } from './PrimitiveMesh';
import { SceneEnvironment } from './SceneEnvironment';

export function SceneCanvas() {
  const snapshot = useSceneStore((state) => state.history.present);
  const selectEntity = useSceneStore((state) => state.selectEntity);
  const updateSelectionTransform = useSceneStore((state) => state.updateSelectionTransform);
  const [orbitEnabled, setOrbitEnabled] = useState(true);

  return (
    <div className="canvas-shell">
      <Canvas camera={{ position: [6, 5, 8], fov: 42 }} shadows>
        <color attach="background" args={['#f9eed7']} />
        <SceneEnvironment />
        {snapshot.primitives.map((primitive) => (
          <PrimitiveMesh
            key={primitive.id}
            primitive={primitive}
            onTransformStart={() => setOrbitEnabled(false)}
            onTransformEnd={(item, mesh) => {
              updateSelectionTransform(
                item.id,
                {
                  position: mesh.position.toArray() as [number, number, number],
                  rotation: [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z],
                  scale: mesh.scale.toArray() as [number, number, number],
                },
                true,
              );
              setOrbitEnabled(true);
            }}
          />
        ))}
        <mesh position={[0, -2.4, 0]} rotation={[-Math.PI / 2, 0, 0]} onClick={() => selectEntity(null)}>
          <planeGeometry args={[80, 80]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
        <OrbitControls makeDefault enabled={orbitEnabled} />
      </Canvas>
    </div>
  );
}
```

- [ ] **Step 2: Replace the placeholder workspace with the real canvas**

```tsx
// src/App.tsx
import { AppShell } from './components/layout/AppShell';
import { ActionPanel } from './components/panels/ActionPanel';
import { BrushPanel } from './components/panels/BrushPanel';
import { ColorPalette } from './components/panels/ColorPalette';
import { LightPanel } from './components/panels/LightPanel';
import { ShapePanel } from './components/panels/ShapePanel';
import { ToolPanel } from './components/panels/ToolPanel';
import { SceneCanvas } from './scene/SceneCanvas';

function Sidebar() {
  return (
    <>
      <header className="hero-card">
        <h1>3D Crayon Modeler</h1>
        <p>Squish, doodle, erase, and light waxy toy forms.</p>
      </header>
      <ShapePanel />
      <ToolPanel />
      <ColorPalette />
      <BrushPanel />
      <LightPanel />
      <ActionPanel />
    </>
  );
}

export default function App() {
  return <AppShell sidebar={<Sidebar />} canvas={<SceneCanvas />} />;
}
```

- [ ] **Step 3: Add canvas shell styling**

```css
/* append to src/styles/global.css */
.canvas-shell {
  height: calc(100vh - 48px);
  border-radius: 32px;
  overflow: hidden;
  border: 3px solid rgba(105, 77, 58, 0.12);
  box-shadow: 0 18px 44px rgba(122, 93, 57, 0.18);
  background: #f9eed7;
}

.workspace canvas {
  display: block;
}
```

- [ ] **Step 4: Manually verify primitive creation and transform controls**

Run: `npm run dev`

Expected manual result:
- The scene loads with a warm paper background and faint grid.
- Clicking a shape button adds a centered primitive.
- Clicking the primitive selects it.
- Choosing `Move` shows transform handles on the selected object.
- Orbit controls still work when not dragging a transform gizmo.

- [ ] **Step 5: Commit the scene canvas**

```bash
git add src/App.tsx src/scene src/styles/global.css
git commit -m "feat: render editable primitives in scene"
```

## Task 5: Add Waxy Crayon Materials and Chunky Stroke Rendering

**Files:**
- Create: `src/features/style/createCrayonTexture.ts`
- Create: `src/features/strokes/buildStrokeSegments.ts`
- Create: `src/scene/StrokeMesh.tsx`
- Modify: `src/scene/PrimitiveMesh.tsx`
- Modify: `src/scene/SceneCanvas.tsx`
- Test: `tests/features/buildStrokeSegments.test.ts`

- [ ] **Step 1: Write a failing test for crayon stroke segment generation**

```ts
// tests/features/buildStrokeSegments.test.ts
import { describe, expect, it } from 'vitest';
import { buildStrokeSegments } from '../../src/features/strokes/buildStrokeSegments';

describe('buildStrokeSegments', () => {
  it('turns a point path into chunky stroke segments', () => {
    const segments = buildStrokeSegments(
      [
        [0, 0, 0],
        [1, 0.2, 0],
        [2, 0.4, 0.1],
      ],
      0.18,
      42,
    );

    expect(segments.length).toBe(2);
    expect(segments[0].radius).toBeGreaterThan(0.1);
    expect(segments[0].length).toBeGreaterThan(0.5);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run tests/features/buildStrokeSegments.test.ts`

Expected: FAIL because the stroke builder does not exist yet.

- [ ] **Step 3: Implement a reusable crayon texture helper and the stroke segment builder**

```ts
// src/features/style/createCrayonTexture.ts
import { CanvasTexture, RepeatWrapping } from 'three';

export function createCrayonTexture(color: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d')!;

  context.fillStyle = color;
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let index = 0; index < 180; index += 1) {
    const alpha = 0.04 + (index % 7) * 0.01;
    context.strokeStyle = `rgba(255,255,255,${alpha})`;
    context.lineWidth = 1 + (index % 3);
    context.beginPath();
    context.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
    context.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
    context.stroke();
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}
```

```ts
// src/features/strokes/buildStrokeSegments.ts
import { Quaternion, Vector3 } from 'three';
import type { StrokeSegment, Vec3 } from '../../types/scene';

function seededNoise(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (1664525 * value + 1013904223) >>> 0;
    return value / 0xffffffff;
  };
}

export function buildStrokeSegments(points: Vec3[], thickness: number, jitterSeed: number): StrokeSegment[] {
  const random = seededNoise(jitterSeed);
  const up = new Vector3(0, 1, 0);

  return points.slice(0, -1).flatMap((point, index) => {
    const next = points[index + 1];
    const start = new Vector3(...point);
    const end = new Vector3(...next);
    const direction = end.clone().sub(start);
    const length = direction.length();

    if (length < 0.02) return [];

    const center = start.clone().lerp(end, 0.5);
    const quaternion = new Quaternion().setFromUnitVectors(up, direction.clone().normalize());
    const radius = thickness * (0.88 + random() * 0.26);

    return [
      {
        center: [center.x, center.y, center.z],
        rotation: [quaternion.x, quaternion.y, quaternion.z, quaternion.w],
        radius,
        length,
      },
    ];
  });
}
```

- [ ] **Step 4: Use the waxy texture for primitives and add a stroke mesh renderer**

```tsx
// src/scene/StrokeMesh.tsx
import { useMemo } from 'react';
import type { CrayonStroke } from '../types/scene';
import { createCrayonTexture } from '../features/style/createCrayonTexture';
import { useSceneStore } from '../store/sceneStore';

export function StrokeMesh({ stroke }: { stroke: CrayonStroke }) {
  const texture = useMemo(() => createCrayonTexture(stroke.color), [stroke.color]);
  const selectedId = useSceneStore((state) => state.history.present.selectionId);
  const selectEntity = useSceneStore((state) => state.selectEntity);

  return (
    <group
      onClick={(event) => {
        event.stopPropagation();
        selectEntity(stroke.id);
      }}
    >
      {stroke.segmentData.map((segment, index) => (
        <mesh
          key={`${stroke.id}-${index}`}
          position={segment.center}
          quaternion={segment.rotation}
          castShadow
          receiveShadow
        >
          <capsuleGeometry args={[segment.radius, Math.max(segment.length - segment.radius * 2, 0.02), 6, 10]} />
          <meshToonMaterial color={stroke.color} map={texture} />
        </mesh>
      ))}
      {selectedId === stroke.id ? (
        <mesh position={stroke.segmentData[0]?.center ?? [0, 0, 0]}>
          <sphereGeometry args={[0.08, 10, 10]} />
          <meshBasicMaterial color="#3a2e28" />
        </mesh>
      ) : null}
    </group>
  );
}
```

```tsx
// modify src/scene/PrimitiveMesh.tsx material section
import { createCrayonTexture } from '../features/style/createCrayonTexture';

const texture = useMemo(() => createCrayonTexture(primitive.color), [primitive.color]);

<meshToonMaterial color={primitive.color} map={texture} />
```

- [ ] **Step 5: Run the stroke generation test**

Run: `npm test -- --run tests/features/buildStrokeSegments.test.ts`

Expected: `1 passed`

- [ ] **Step 6: Commit the stroke rendering foundation**

```bash
git add src/features/style src/features/strokes src/scene/StrokeMesh.tsx src/scene/PrimitiveMesh.tsx tests/features/buildStrokeSegments.test.ts
git commit -m "feat: add waxy crayon materials and stroke segments"
```

## Task 6: Wire Select, Transform, and Crayon Drawing Interactions

**Files:**
- Create: `src/tools/workingPlane.ts`
- Create: `src/tools/useSceneInteractions.ts`
- Modify: `src/scene/SceneCanvas.tsx`
- Modify: `src/store/sceneStore.ts`

- [ ] **Step 1: Add the working-plane helper used by the crayon tool**

```ts
// src/tools/workingPlane.ts
import { Plane, Vector3 } from 'three';
import type { SceneSnapshot } from '../types/scene';

export function buildWorkingPlane(snapshot: SceneSnapshot, cameraPosition: Vector3, cameraDirection: Vector3) {
  if (snapshot.brush.drawingPlaneMode === 'ground') {
    return new Plane(new Vector3(0, 1, 0), 0);
  }

  const anchor =
    snapshot.primitives.find((primitive) => primitive.id === snapshot.selectionId)?.position ?? [0, 0, 0];

  const anchorPoint = new Vector3(...anchor).add(cameraDirection.clone().multiplyScalar(0.75));
  return new Plane().setFromNormalAndCoplanarPoint(cameraDirection.clone().normalize(), anchorPoint);
}
```

- [ ] **Step 2: Extend the store with stroke add/replace helpers**

```ts
// add to src/store/sceneStore.ts
import { buildStrokeSegments } from '../features/strokes/buildStrokeSegments';
import type { Vec3 } from '../types/scene';

// extend the SceneStore type
addStroke: (points: Vec3[]) => void;

// add this implementation next to addPrimitive
addStroke: (points) =>
  set((state) => {
    if (points.length < 2) return state;

    const next = structuredClone(state.history.present);
    const stroke = {
      id: crypto.randomUUID(),
      color: next.activeColor,
      points,
      thickness: 0.18,
      jitterSeed: Math.floor(Math.random() * 100000),
      segmentData: buildStrokeSegments(points, 0.18, Math.floor(Math.random() * 100000)),
    };

    next.strokes.push(stroke);
    next.selectionId = stroke.id;
    return { history: pushHistory(state.history, next) };
  }),
```

- [ ] **Step 3: Implement the canvas interaction hook for crayon strokes**

```ts
// src/tools/useSceneInteractions.ts
import { useMemo, useRef, useState } from 'react';
import { Raycaster, Vector2, Vector3 } from 'three';
import { useThree } from '@react-three/fiber';
import { buildWorkingPlane } from './workingPlane';
import { useSceneStore } from '../store/sceneStore';

export function useSceneInteractions() {
  const snapshot = useSceneStore((state) => state.history.present);
  const addStroke = useSceneStore((state) => state.addStroke);
  const { camera, gl } = useThree();
  const raycaster = useMemo(() => new Raycaster(), []);
  const activePoints = useRef<Vector3[]>([]);
  const [cursorPoint, setCursorPoint] = useState<[number, number, number] | null>(null);

  function projectPointer(clientX: number, clientY: number) {
    const rect = gl.domElement.getBoundingClientRect();
    const pointer = new Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );

    raycaster.setFromCamera(pointer, camera);
    const plane = buildWorkingPlane(snapshot, camera.position.clone(), camera.getWorldDirection(new Vector3()));
    const hit = new Vector3();
    return raycaster.ray.intersectPlane(plane, hit) ? hit : null;
  }

  return {
    onPointerDown(event: PointerEvent) {
      if (snapshot.activeTool !== 'crayon') return;
      const hit = projectPointer(event.clientX, event.clientY);
      activePoints.current = hit ? [hit.clone()] : [];
    },
    onPointerMove(event: PointerEvent) {
      const hit = projectPointer(event.clientX, event.clientY);
      setCursorPoint(hit ? [hit.x, hit.y, hit.z] : null);

      if (snapshot.activeTool !== 'crayon' || activePoints.current.length === 0) return;
      if (!hit) return;
      const last = activePoints.current[activePoints.current.length - 1];
      if (last.distanceTo(hit) > 0.12) activePoints.current.push(hit.clone());
    },
    onPointerUp() {
      if (snapshot.activeTool !== 'crayon' || activePoints.current.length < 2) return;
      addStroke(activePoints.current.map((point) => [point.x, point.y, point.z]));
      activePoints.current = [];
    },
    cursorPoint,
  };
}
```

- [ ] **Step 4: Attach the interaction hook and render saved strokes**

```tsx
// modify src/scene/SceneCanvas.tsx
import { useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { StrokeMesh } from './StrokeMesh';
import { useSceneInteractions } from '../tools/useSceneInteractions';

function InteractionBinder() {
  const interactions = useSceneInteractions();
  const { gl } = useThree();

  useEffect(() => {
    const dom = gl.domElement;

    dom.addEventListener('pointerdown', interactions.onPointerDown);
    dom.addEventListener('pointermove', interactions.onPointerMove);
    dom.addEventListener('pointerup', interactions.onPointerUp);

    return () => {
      dom.removeEventListener('pointerdown', interactions.onPointerDown);
      dom.removeEventListener('pointermove', interactions.onPointerMove);
      dom.removeEventListener('pointerup', interactions.onPointerUp);
    };
  }, [gl, interactions]);

  return null;
}

export function SceneCanvas() {
  const snapshot = useSceneStore((state) => state.history.present);
  const selectEntity = useSceneStore((state) => state.selectEntity);
  const updateSelectionTransform = useSceneStore((state) => state.updateSelectionTransform);
  const [orbitEnabled, setOrbitEnabled] = useState(true);

  return (
    <div className="canvas-shell">
      <Canvas camera={{ position: [6, 5, 8], fov: 42 }} shadows>
        <color attach="background" args={['#f9eed7']} />
        <InteractionBinder />
        <SceneEnvironment />
        {snapshot.primitives.map((primitive) => (
          <PrimitiveMesh
            key={primitive.id}
            primitive={primitive}
            onTransformStart={() => setOrbitEnabled(false)}
            onTransformEnd={(item, mesh) => {
              updateSelectionTransform(
                item.id,
                {
                  position: mesh.position.toArray() as [number, number, number],
                  rotation: [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z],
                  scale: mesh.scale.toArray() as [number, number, number],
                },
                true,
              );
              setOrbitEnabled(true);
            }}
          />
        ))}
        {snapshot.strokes.map((stroke) => (
          <StrokeMesh key={stroke.id} stroke={stroke} />
        ))}
        <mesh position={[0, -2.4, 0]} rotation={[-Math.PI / 2, 0, 0]} onClick={() => selectEntity(null)}>
          <planeGeometry args={[80, 80]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
        <OrbitControls makeDefault enabled={orbitEnabled} />
      </Canvas>
    </div>
  );
}
```

- [ ] **Step 5: Manually verify 3D crayon drawing**

Run: `npm run dev`

Expected manual result:
- Switching to `Crayon` allows dragging to create chunky 3D wax marks.
- New strokes use the selected palette color.
- Strokes remain visible while orbiting the camera.
- The drawing plane follows camera mode by default.

- [ ] **Step 6: Commit the crayon interaction path**

```bash
git add src/scene/SceneCanvas.tsx src/store/sceneStore.ts src/tools
git commit -m "feat: add crayon drawing interactions"
```

## Task 7: Add Approximate Eraser Logic for Strokes and Primitives

**Files:**
- Create: `src/features/eraser/applyEraser.ts`
- Create: `src/scene/ToolCursor.tsx`
- Modify: `src/tools/useSceneInteractions.ts`
- Modify: `src/components/panels/BrushPanel.tsx`
- Modify: `src/scene/SceneCanvas.tsx`
- Modify: `src/store/sceneStore.ts`
- Test: `tests/features/applyEraser.test.ts`

- [ ] **Step 1: Write failing tests for stroke erasing and primitive carving**

```ts
// tests/features/applyEraser.test.ts
import { describe, expect, it } from 'vitest';
import { applyEraserToGeometry, applyEraserToStroke } from '../../src/features/eraser/applyEraser';

describe('applyEraser', () => {
  it('removes stroke segments inside the brush radius', () => {
    const stroke = {
      segmentData: [
        { center: [0, 0, 0], rotation: [0, 0, 0, 1], radius: 0.2, length: 1 },
        { center: [3, 0, 0], rotation: [0, 0, 0, 1], radius: 0.2, length: 1 },
      ],
    };

    const next = applyEraserToStroke(stroke as never, [0.1, 0, 0], 'sphere', 0.6);
    expect(next.segmentData).toHaveLength(1);
  });

  it('pushes nearby vertices inward on editable geometry', () => {
    const geometry = {
      positions: [0, 0, 0, 1, 0, 0, 3, 0, 0],
      indices: [0, 1, 2],
      normals: [1, 0, 0, 1, 0, 0, 1, 0, 0],
      neighbors: [[1], [0, 2], [1]],
    };

    const carved = applyEraserToGeometry(geometry, [0, 0, 0], 'sphere', 1.2, 0.3);
    expect(carved.positions[0]).toBeLessThan(0);
    expect(carved.positions[6]).toBe(3);
  });
});
```

- [ ] **Step 2: Run the eraser tests to verify they fail**

Run: `npm test -- --run tests/features/applyEraser.test.ts`

Expected: FAIL because the eraser module does not exist yet.

- [ ] **Step 3: Implement stroke filtering and primitive carving helpers**

```ts
// src/features/eraser/applyEraser.ts
import type { CrayonStroke, EditableGeometryData, EraserShape, Vec3 } from '../../types/scene';

function distance(a: Vec3, b: Vec3) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function containsPoint(point: Vec3, center: Vec3, shape: EraserShape, radius: number) {
  if (shape === 'sphere') return distance(point, center) <= radius;

  if (shape === 'cube') {
    return (
      Math.abs(point[0] - center[0]) <= radius &&
      Math.abs(point[1] - center[1]) <= radius &&
      Math.abs(point[2] - center[2]) <= radius
    );
  }

  return (
    Math.hypot(point[0] - center[0], point[2] - center[2]) <= radius &&
    Math.abs(point[1] - center[1]) <= radius
  );
}

export function applyEraserToStroke(stroke: CrayonStroke, center: Vec3, shape: EraserShape, radius: number) {
  return {
    ...stroke,
    segmentData: stroke.segmentData.filter((segment) => !containsPoint(segment.center, center, shape, radius)),
  };
}

export function applyEraserToGeometry(
  geometry: EditableGeometryData,
  center: Vec3,
  shape: EraserShape,
  radius: number,
  strength: number,
): EditableGeometryData {
  const positions = [...geometry.positions];

  for (let index = 0; index < positions.length; index += 3) {
    const point: Vec3 = [positions[index], positions[index + 1], positions[index + 2]];
    if (!containsPoint(point, center, shape, radius)) continue;

    const direction: Vec3 = [point[0] - center[0], point[1] - center[1], point[2] - center[2]];
    const length = Math.max(Math.hypot(...direction), 0.0001);
    const falloff = 1 - Math.min(length / radius, 1);
    positions[index] -= (direction[0] / length) * strength * falloff;
    positions[index + 1] -= (direction[1] / length) * strength * falloff;
    positions[index + 2] -= (direction[2] / length) * strength * falloff;
  }

  return { ...geometry, positions };
}
```

- [ ] **Step 4: Wire the eraser brush into the interaction hook and show a cursor gizmo**

```tsx
// src/scene/ToolCursor.tsx
import { useSceneStore } from '../store/sceneStore';
import type { Vec3 } from '../types/scene';

export function ToolCursor({ point }: { point: Vec3 | null }) {
  const brush = useSceneStore((state) => state.history.present.brush);
  const activeTool = useSceneStore((state) => state.history.present.activeTool);

  if (!point || (activeTool !== 'eraser' && activeTool !== 'deform')) return null;

  const commonProps = {
    position: point,
    scale: [brush.eraserRadius * 2, brush.eraserRadius * 2, brush.eraserRadius * 2] as [number, number, number],
  };

  return (
    <mesh {...commonProps}>
      {brush.eraserShape === 'cube' ? <boxGeometry args={[1, 1, 1]} /> : <sphereGeometry args={[0.5, 18, 18]} />}
      <meshBasicMaterial color="#ff8fab" transparent opacity={0.18} wireframe />
    </mesh>
  );
}
```

```ts
// update src/tools/useSceneInteractions.ts
import { applyEraserToGeometry, applyEraserToStroke } from '../features/eraser/applyEraser';

// inside hook:
const replaceSnapshot = useSceneStore((state) => state.replaceSnapshot);

// inside onPointerMove:
if (snapshot.activeTool === 'eraser' && hit) {
  const next = structuredClone(snapshot);
  next.strokes = next.strokes
    .map((stroke) => applyEraserToStroke(stroke, [hit.x, hit.y, hit.z], snapshot.brush.eraserShape, snapshot.brush.eraserRadius))
    .filter((stroke) => stroke.segmentData.length > 0);
  next.primitives = next.primitives.map((primitive) => ({
    ...primitive,
    geometryData: applyEraserToGeometry(
      primitive.geometryData,
      [hit.x, hit.y, hit.z],
      snapshot.brush.eraserShape,
      snapshot.brush.eraserRadius,
      0.08,
    ),
  }));
  replaceSnapshot(next, false);
}

// inside onPointerUp:
if (snapshot.activeTool === 'eraser') {
  replaceSnapshot(structuredClone(useSceneStore.getState().history.present), true);
}
```

```tsx
// update src/scene/SceneCanvas.tsx interaction binder return
import { ToolCursor } from './ToolCursor';

function InteractionBinder() {
  const interactions = useSceneInteractions();
  const { gl } = useThree();

  useEffect(() => {
    const dom = gl.domElement;

    dom.addEventListener('pointerdown', interactions.onPointerDown);
    dom.addEventListener('pointermove', interactions.onPointerMove);
    dom.addEventListener('pointerup', interactions.onPointerUp);

    return () => {
      dom.removeEventListener('pointerdown', interactions.onPointerDown);
      dom.removeEventListener('pointermove', interactions.onPointerMove);
      dom.removeEventListener('pointerup', interactions.onPointerUp);
    };
  }, [gl, interactions]);

  return <ToolCursor point={interactions.cursorPoint} />;
}
```

```tsx
// extend src/components/panels/BrushPanel.tsx
<label>
  Eraser Shape
  <select
    value={brush.eraserShape}
    onChange={(event) => updateBrush({ eraserShape: event.target.value as 'sphere' | 'cube' | 'cylinder' })}
  >
    <option value="sphere">Sphere</option>
    <option value="cube">Cube</option>
    <option value="cylinder">Cylinder</option>
  </select>
</label>
```

- [ ] **Step 5: Run the eraser tests and manually verify the brush**

Run: `npm test -- --run tests/features/applyEraser.test.ts`

Expected: `2 passed`

Run: `npm run dev`

Expected manual result:
- Strokes get rubbed away segment-by-segment.
- Dragging over primitives visibly pushes nearby surface points inward.
- The eraser shape selector changes the cursor gizmo.

- [ ] **Step 6: Commit the eraser feature**

```bash
git add src/components/panels/BrushPanel.tsx src/features/eraser src/scene/ToolCursor.tsx src/store/sceneStore.ts src/tools/useSceneInteractions.ts tests/features/applyEraser.test.ts
git commit -m "feat: add eraser brush approximations"
```

## Task 8: Add Push/Pull, Inflate, and Smooth Deform Brushes

**Files:**
- Create: `src/features/deform/applyDeform.ts`
- Modify: `src/tools/useSceneInteractions.ts`
- Modify: `src/components/panels/BrushPanel.tsx`
- Test: `tests/features/applyDeform.test.ts`

- [ ] **Step 1: Write failing tests for deform brush modes**

```ts
// tests/features/applyDeform.test.ts
import { describe, expect, it } from 'vitest';
import { applyDeform } from '../../src/features/deform/applyDeform';

const geometry = {
  positions: [0, 0, 0, 1, 0, 0, 2, 0, 0],
  indices: [0, 1, 2],
  normals: [1, 0, 0, 1, 0, 0, 1, 0, 0],
  neighbors: [[1], [0, 2], [1]],
};

describe('applyDeform', () => {
  it('pushes vertices outward in inflate mode', () => {
    const next = applyDeform(geometry, [0, 0, 0], 'inflate', 1.5, 0.2);
    expect(next.positions[0]).toBeGreaterThan(0);
  });

  it('smooths vertices toward their neighbors', () => {
    const spiky = { ...geometry, positions: [0, 0, 0, 5, 0, 0, 2, 0, 0] };
    const next = applyDeform(spiky, [1, 0, 0], 'smooth', 3, 0.5);
    expect(next.positions[3]).toBeLessThan(5);
  });
});
```

- [ ] **Step 2: Run the deform tests to verify they fail**

Run: `npm test -- --run tests/features/applyDeform.test.ts`

Expected: FAIL because the deform module does not exist yet.

- [ ] **Step 3: Implement pure deform helpers for push/pull, inflate, and smooth**

```ts
// src/features/deform/applyDeform.ts
import type { DeformMode, EditableGeometryData, Vec3 } from '../../types/scene';

function distance(a: Vec3, b: Vec3) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

export function applyDeform(
  geometry: EditableGeometryData,
  center: Vec3,
  mode: DeformMode,
  radius: number,
  strength: number,
): EditableGeometryData {
  const positions = [...geometry.positions];

  for (let index = 0; index < positions.length; index += 3) {
    const point: Vec3 = [positions[index], positions[index + 1], positions[index + 2]];
    const dist = distance(point, center);
    if (dist > radius) continue;

    const falloff = 1 - dist / radius;
    const vertexIndex = index / 3;

    if (mode === 'smooth') {
      const neighbors = geometry.neighbors[vertexIndex];
      if (neighbors.length === 0) continue;

      const average = neighbors.reduce<Vec3>(
        (acc, neighbor) => {
          acc[0] += positions[neighbor * 3];
          acc[1] += positions[neighbor * 3 + 1];
          acc[2] += positions[neighbor * 3 + 2];
          return acc;
        },
        [0, 0, 0],
      );

      average[0] /= neighbors.length;
      average[1] /= neighbors.length;
      average[2] /= neighbors.length;

      positions[index] += (average[0] - point[0]) * strength * falloff;
      positions[index + 1] += (average[1] - point[1]) * strength * falloff;
      positions[index + 2] += (average[2] - point[2]) * strength * falloff;
      continue;
    }

    const direction: Vec3 = [point[0] - center[0], point[1] - center[1], point[2] - center[2]];
    const length = Math.max(Math.hypot(...direction), 0.0001);
    const signedStrength = mode === 'pushPull' ? -strength : strength;

    positions[index] += (direction[0] / length) * signedStrength * falloff;
    positions[index + 1] += (direction[1] / length) * signedStrength * falloff;
    positions[index + 2] += (direction[2] / length) * signedStrength * falloff;
  }

  return { ...geometry, positions };
}
```

- [ ] **Step 4: Wire deform mode selection into the brush panel and interaction hook**

```tsx
// extend src/components/panels/BrushPanel.tsx
<label>
  Deform Mode
  <select
    value={brush.deformMode}
    onChange={(event) => updateBrush({ deformMode: event.target.value as 'pushPull' | 'inflate' | 'smooth' })}
  >
    <option value="pushPull">Push / Pull</option>
    <option value="inflate">Inflate</option>
    <option value="smooth">Smooth</option>
  </select>
</label>
```

```ts
// update src/tools/useSceneInteractions.ts
import { applyDeform } from '../features/deform/applyDeform';

if (snapshot.activeTool === 'deform' && hit && snapshot.selectionId) {
  const next = structuredClone(snapshot);
  next.primitives = next.primitives.map((primitive) =>
    primitive.id !== snapshot.selectionId
      ? primitive
      : {
          ...primitive,
          geometryData: applyDeform(
            primitive.geometryData,
            [hit.x, hit.y, hit.z],
            snapshot.brush.deformMode,
            snapshot.brush.deformRadius,
            snapshot.brush.deformStrength,
          ),
        },
  );
  replaceSnapshot(next, false);
}

if (snapshot.activeTool === 'deform') {
  replaceSnapshot(structuredClone(useSceneStore.getState().history.present), true);
}
```

- [ ] **Step 5: Run the deform tests and manually verify sculpting**

Run: `npm test -- --run tests/features/applyDeform.test.ts`

Expected: `2 passed`

Run: `npm run dev`

Expected manual result:
- With a selected primitive, the deform brush visibly changes the mesh.
- `Push / Pull` dents the mesh.
- `Inflate` bulges the mesh.
- `Smooth` softens sharp edits.

- [ ] **Step 6: Commit the deform brushes**

```bash
git add src/components/panels/BrushPanel.tsx src/features/deform src/tools/useSceneInteractions.ts tests/features/applyDeform.test.ts
git commit -m "feat: add deform brushes"
```

## Task 9: Finish History Boundaries, Delete/Reset, Lighting Polish, and Viewport Export

**Files:**
- Create: `src/features/export/exportViewport.ts`
- Modify: `src/components/panels/ActionPanel.tsx`
- Modify: `src/scene/SceneCanvas.tsx`
- Modify: `src/App.tsx`
- Modify: `src/store/sceneStore.ts`
- Test: `tests/components/actionPanel.test.tsx`

- [ ] **Step 1: Write a failing component test for action buttons**

```tsx
// tests/components/actionPanel.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActionPanel } from '../../src/components/panels/ActionPanel';
import { useSceneStore } from '../../src/store/sceneStore';

describe('ActionPanel', () => {
  it('enables undo after a committed scene change', async () => {
    const user = userEvent.setup();
    useSceneStore.getState().addPrimitive('sphere');

    render(<ActionPanel />);
    await user.click(screen.getByRole('button', { name: /undo/i }));

    expect(useSceneStore.getState().history.present.primitives).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run the action panel test to verify it fails**

Run: `npm test -- --run tests/components/actionPanel.test.tsx`

Expected: FAIL because export wiring and robust action boundaries are incomplete.

- [ ] **Step 3: Add a viewport export helper**

```ts
// src/features/export/exportViewport.ts
export function exportViewport(canvas: HTMLCanvasElement, type: 'png' | 'jpg') {
  const mime = type === 'png' ? 'image/png' : 'image/jpeg';
  const dataUrl = canvas.toDataURL(mime, 0.92);
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `crayon-scene.${type}`;
  link.click();
}
```

- [ ] **Step 4: Wire export buttons and tighten action handling**

```tsx
// modify src/components/panels/ActionPanel.tsx
import { exportViewport } from '../../features/export/exportViewport';

export function ActionPanel({ getCanvas }: { getCanvas?: () => HTMLCanvasElement | null }) {
  const selectionId = useSceneStore((state) => state.history.present.selectionId);
  const canUndo = useSceneStore((state) => state.history.past.length > 0);
  const canRedo = useSceneStore((state) => state.history.future.length > 0);
  const undo = useSceneStore((state) => state.undo);
  const redo = useSceneStore((state) => state.redo);
  const deleteSelected = useSceneStore((state) => state.deleteSelected);
  const resetScene = useSceneStore((state) => state.resetScene);

  return (
    <section className="panel">
      <h2>Actions</h2>
      <div className="action-grid">
        <button type="button" onClick={undo} disabled={!canUndo}>Undo</button>
        <button type="button" onClick={redo} disabled={!canRedo}>Redo</button>
        <button type="button" onClick={deleteSelected} disabled={!selectionId}>Delete Selected</button>
        <button type="button" onClick={resetScene}>Reset Scene</button>
        <button type="button" onClick={() => getCanvas && getCanvas() && exportViewport(getCanvas()!, 'png')}>
          Export PNG
        </button>
        <button type="button" onClick={() => getCanvas && getCanvas() && exportViewport(getCanvas()!, 'jpg')}>
          Export JPG
        </button>
      </div>
    </section>
  );
}
```

```tsx
// modify src/scene/SceneCanvas.tsx
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useSceneStore } from '../store/sceneStore';
import { PrimitiveMesh } from './PrimitiveMesh';
import { SceneEnvironment } from './SceneEnvironment';
import { StrokeMesh } from './StrokeMesh';

export const SceneCanvas = forwardRef<{ getCanvas: () => HTMLCanvasElement | null }>(function SceneCanvas(_, ref) {
  const snapshot = useSceneStore((state) => state.history.present);
  const selectEntity = useSceneStore((state) => state.selectEntity);
  const updateSelectionTransform = useSceneStore((state) => state.updateSelectionTransform);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [orbitEnabled, setOrbitEnabled] = useState(true);

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
  }));

  return (
    <div className="canvas-shell">
      <Canvas
        shadows
        gl={{ preserveDrawingBuffer: true }}
        onCreated={({ gl }) => {
          canvasRef.current = gl.domElement;
        }}
        camera={{ position: [6, 5, 8], fov: 42 }}
      >
        <color attach="background" args={['#f9eed7']} />
        <InteractionBinder />
        <SceneEnvironment />
        {snapshot.primitives.map((primitive) => (
          <PrimitiveMesh
            key={primitive.id}
            primitive={primitive}
            onTransformStart={() => setOrbitEnabled(false)}
            onTransformEnd={(item, mesh) => {
              updateSelectionTransform(
                item.id,
                {
                  position: mesh.position.toArray() as [number, number, number],
                  rotation: [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z],
                  scale: mesh.scale.toArray() as [number, number, number],
                },
                true,
              );
              setOrbitEnabled(true);
            }}
          />
        ))}
        {snapshot.strokes.map((stroke) => (
          <StrokeMesh key={stroke.id} stroke={stroke} />
        ))}
        <mesh position={[0, -2.4, 0]} rotation={[-Math.PI / 2, 0, 0]} onClick={() => selectEntity(null)}>
          <planeGeometry args={[80, 80]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
        <OrbitControls makeDefault enabled={orbitEnabled} />
      </Canvas>
    </div>
  );
});
```

```tsx
// modify src/App.tsx
import { useRef } from 'react';
import { AppShell } from './components/layout/AppShell';
import { ActionPanel } from './components/panels/ActionPanel';
import { BrushPanel } from './components/panels/BrushPanel';
import { ColorPalette } from './components/panels/ColorPalette';
import { LightPanel } from './components/panels/LightPanel';
import { ShapePanel } from './components/panels/ShapePanel';
import { ToolPanel } from './components/panels/ToolPanel';
import { SceneCanvas } from './scene/SceneCanvas';

function Sidebar({ getCanvas }: { getCanvas: () => HTMLCanvasElement | null }) {
  return (
    <>
      <header className="hero-card">
        <h1>3D Crayon Modeler</h1>
        <p>Squish, doodle, erase, and light waxy toy forms.</p>
      </header>
      <ShapePanel />
      <ToolPanel />
      <ColorPalette />
      <BrushPanel />
      <LightPanel />
      <ActionPanel getCanvas={getCanvas} />
    </>
  );
}

export default function App() {
  const sceneRef = useRef<{ getCanvas: () => HTMLCanvasElement | null }>(null);

  return (
    <AppShell
      sidebar={<Sidebar getCanvas={() => sceneRef.current?.getCanvas() ?? null} />}
      canvas={<SceneCanvas ref={sceneRef} />}
    />
  );
}
```

- [ ] **Step 5: Run the action panel test and perform manual export verification**

Run: `npm test -- --run tests/components/actionPanel.test.tsx`

Expected: `1 passed`

Run: `npm run dev`

Expected manual result:
- Undo and redo traverse committed scene actions.
- Delete removes the selected primitive or stroke.
- Reset clears the scene and keeps the app responsive.
- Export PNG and Export JPG download the current camera view.
- Lighting sliders update the scene immediately while preserving the waxy look.

- [ ] **Step 6: Commit the polish pass**

```bash
git add src/components/panels/ActionPanel.tsx src/features/export src/scene/SceneCanvas.tsx src/store/sceneStore.ts tests/components/actionPanel.test.tsx
git commit -m "feat: wire lighting history and export"
```

## Task 10: Document Local Setup and Run the Full Verification Pass

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace the placeholder README with real setup and usage instructions**

````md
# 3D Crayon Modeler

A desktop-first playful 3D modeling toy built with React, React Three Fiber, and a wax-crayon cartoon style.

## Requirements

- Node.js 20+
- npm 10+

## Install

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Open the local Vite URL shown in the terminal.

## Test

```bash
npm test -- --run
```

## Build

```bash
npm run build
```

## Features

- Primitive creation: sphere, cube, box, cylinder, cone, capsule
- Select and transform with orbit camera navigation
- 12-color 3D crayon palette
- Chunky wax-like 3D stroke drawing
- Directional and ambient light controls
- Approximate eraser shapes for strokes and primitives
- Push/pull, inflate, and smooth deform brushes
- Undo / redo
- Delete selected and reset scene
- Export current view as PNG or JPG
```
````

- [ ] **Step 2: Run the full automated verification suite**

Run: `npm test -- --run`

Expected: all test files pass.

Run: `npm run build`

Expected: production build succeeds.

- [ ] **Step 3: Perform a final manual feature walkthrough**

Run: `npm run dev`

Expected manual result:
- Every primitive can be created, selected, transformed, recolored, and deleted.
- Crayon strokes render as chunky 3D wax marks.
- Light direction sliders give immediate visual feedback.
- Eraser and deform brushes visibly alter scene content.
- Undo and redo recover all major actions.
- Export PNG and JPG save the current viewpoint.

- [ ] **Step 4: Commit the docs and verified MVP**

```bash
git add README.md
git commit -m "docs: add local setup guide"
```
