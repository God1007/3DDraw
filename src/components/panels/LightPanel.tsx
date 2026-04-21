import { useSceneStore } from '../../store/sceneStore';
import type { LightSettings } from '../../types/scene';

const LIGHT_KEYS: Array<keyof LightSettings> = [
  'directionalX',
  'directionalY',
  'directionalZ',
  'ambientIntensity',
];

export function LightPanel() {
  const lights = useSceneStore((state) => state.history.present.lights);
  const updateLights = useSceneStore((state) => state.updateLights);

  return (
    <section className="panel">
      <h2>Lights</h2>
      <div className="control-stack">
        {LIGHT_KEYS.map((key) => (
          <label key={key}>
            {key}
            <input
              type="range"
              min={key === 'ambientIntensity' ? '0.1' : '-10'}
              max={key === 'ambientIntensity' ? '1.5' : '10'}
              step="0.05"
              value={lights[key]}
              onChange={(event) =>
                updateLights({ [key]: Number(event.target.value) } as Partial<LightSettings>)
              }
            />
          </label>
        ))}
      </div>
    </section>
  );
}
