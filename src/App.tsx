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
