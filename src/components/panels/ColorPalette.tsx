import { CRAYON_COLORS } from '../../constants/palette';
import { useSceneStore } from '../../store/sceneStore';

export function ColorPalette() {
  const activeColor = useSceneStore((state) => state.history.present.activeColor);
  const setColor = useSceneStore((state) => state.setColor);

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Crayon Colors</h2>
        <span
          aria-label="selected color"
          className="selected-color"
          style={{ background: activeColor }}
        />
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
