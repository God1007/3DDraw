import type { ReactNode } from 'react';

interface AppShellProps {
  sidebar: ReactNode;
  canvas: ReactNode;
}

export function AppShell({ sidebar, canvas }: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">{sidebar}</aside>
      <main aria-label="workspace" className="workspace">
        {canvas}
      </main>
    </div>
  );
}
