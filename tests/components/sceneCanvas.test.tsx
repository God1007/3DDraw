import { act, render, screen } from '@testing-library/react';
import { Children, createElement, isValidElement } from 'react';
import type { ReactNode } from 'react';
import { PerspectiveCamera } from 'three';
import { vi } from 'vitest';

const mockDomElement = document.createElement('canvas');
mockDomElement.getBoundingClientRect = () =>
  ({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 800,
    bottom: 600,
    width: 800,
    height: 600,
    toJSON() {
      return {};
    },
  }) as DOMRect;

const mockCamera = new PerspectiveCamera(42, 800 / 600, 0.1, 100);
mockCamera.position.set(6, 5, 8);
mockCamera.lookAt(0, 0, 0);
mockCamera.updateProjectionMatrix();
mockCamera.updateMatrixWorld(true);

function renderCanvasChildren(children: ReactNode) {
  return Children.toArray(children).map((child) => {
    if (!isValidElement(child) || typeof child.type !== 'string') {
      return child;
    }

    return null;
  });
}

vi.mock('@react-three/fiber', () => ({
  Canvas: ({
    children,
    onCreated,
  }: {
    children?: ReactNode;
    onCreated?: (state: { gl: { domElement: HTMLCanvasElement } }) => void;
  }) => {
    onCreated?.({ gl: { domElement: mockDomElement } });
    return createElement('div', { 'data-testid': 'mock-r3f-canvas' }, renderCanvasChildren(children));
  },
  useThree: () => ({
    gl: { domElement: mockDomElement },
    camera: mockCamera,
  }),
}));

vi.mock('@react-three/drei', () => ({
  Edges: () => null,
  Grid: () => null,
  OrbitControls: ({ enabled = true }: { enabled?: boolean }) =>
    createElement('div', {
      'data-testid': 'orbit-controls',
      'data-enabled': String(enabled),
    }),
  TransformControls: () => null,
}));

vi.mock('../../src/scene/SceneEnvironment', () => ({
  SceneEnvironment: () => null,
}));

vi.mock('../../src/scene/PrimitiveMesh', () => ({
  PrimitiveMesh: () => null,
}));

vi.mock('../../src/scene/StrokeMesh', () => ({
  StrokeMesh: () => null,
}));

vi.mock('../../src/scene/ToolCursor', () => ({
  ToolCursor: () => null,
}));

import { SceneCanvas } from '../../src/scene/SceneCanvas';
import { useSceneStore } from '../../src/store/sceneStore';

describe('SceneCanvas shell', () => {
  it('disables orbit controls during a crayon drag and restores them on release', () => {
    useSceneStore.getState().resetScene();
    useSceneStore.getState().setTool('crayon');

    render(<SceneCanvas />);

    expect(screen.getByTestId('orbit-controls')).toHaveAttribute('data-enabled', 'true');

    act(() => {
      mockDomElement.dispatchEvent(
        new MouseEvent('pointerdown', {
          bubbles: true,
          clientX: 400,
          clientY: 300,
        })
      );
    });

    expect(screen.getByTestId('orbit-controls')).toHaveAttribute('data-enabled', 'false');

    act(() => {
      mockDomElement.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }));
    });

    expect(screen.getByTestId('orbit-controls')).toHaveAttribute('data-enabled', 'true');
  });

  it('mounts the interactive canvas shell inside the workspace', () => {
    useSceneStore.getState().resetScene();
    const { container } = render(<SceneCanvas />);

    expect(container.querySelector('.canvas-shell')).toBeInTheDocument();
  });
});
