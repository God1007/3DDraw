import '@testing-library/jest-dom/vitest';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { Vector3 } from 'three';
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
mockDomElement.toDataURL = vi.fn(() => 'data:image/png;base64,mock');

if (!('ResizeObserver' in globalThis)) {
  class ResizeObserver {
    observe() {}

    unobserve() {}

    disconnect() {}
  }

  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    writable: true,
    value: ResizeObserver,
  });
}

vi.mock('@react-three/fiber', () => ({
  Canvas: ({
    onCreated,
  }: {
    children?: ReactNode;
    onCreated?: (state: { gl: { domElement: HTMLCanvasElement } }) => void;
  }) => {
    onCreated?.({ gl: { domElement: mockDomElement } });
    return createElement('div', { 'data-testid': 'mock-r3f-canvas' });
  },
  useThree: () => ({
    gl: { domElement: mockDomElement },
    camera: {
      position: new Vector3(6, 5, 8),
      getWorldDirection: (target: Vector3) => target.set(0, 0, -1),
    },
  }),
}));

vi.mock('@react-three/drei', () => ({
  Edges: () => null,
  Grid: () => null,
  OrbitControls: () => null,
  TransformControls: () => null,
}));
