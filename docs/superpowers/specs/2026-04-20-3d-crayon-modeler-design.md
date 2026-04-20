# 3D Crayon Modeler Design

## Summary

Build a desktop-first web-based 3D creative toy with a playful wax-crayon cartoon style. Users can add simple 3D primitives, transform them, recolor them with a fixed 12-color crayon palette, draw chunky 3D crayon strokes in the scene, adjust soft stylized lighting, erase geometry with an approximate brush-based eraser, deform selected objects with tactile wax-like sculpting brushes, undo and redo major actions, and export the current view as a PNG or JPG image.

This is intentionally not a CAD application. The product goal is expressive, approachable, and visually cohesive interaction rather than geometric precision.

## Product Scope

### In Scope

- Desktop-first browser experience
- Primitive creation for:
  - Sphere
  - Cube
  - Box / cuboid
  - Cylinder
  - Cone
  - Capsule
- Object selection
- Move, rotate, and scale controls
- 12-color crayon palette
- 3D crayon drawing with volumetric-looking strokes
- Directional light control on X / Y / Z
- Ambient light intensity control
- Stylized crayon-cartoon rendering
- Brush-based eraser with multiple eraser shapes
- Brush-based deform tools
- Undo / redo
- Reset scene
- Delete selected object
- Export current viewport to PNG / JPG
- Orbit camera interaction

### Out of Scope

- Precise CAD measurements
- Boolean-accurate mesh subtraction
- Engineering-grade mesh editing
- Mobile-first editing gestures
- Scene file import/export formats
- Multi-user collaboration
- Realistic physically based rendering

## Core Experience Goals

### Feel

- Playful, soft, handmade, and toy-like
- Like sculpting and doodling with wax crayons in 3D
- Low-friction interaction for beginners

### Visual Direction

- Paper-like background with warm tone
- Matte wax surfaces with subtle noise and crayon-fill variation
- Soft toon-style shading instead of realistic highlights
- Slightly imperfect edges and stroke thickness
- Friendly UI panels that feel like crayon boxes rather than technical tool palettes

## Technical Stack

- Vite
- React
- TypeScript
- React Three Fiber
- Drei
- Zustand
- Vitest
- Testing Library

## Architecture

The application is split into five main modules.

### 1. UI Shell

Responsible for all controls outside the canvas:

- Shape creation panel
- 12-color palette
- Tool switcher
- Light controls
- Undo / redo
- Delete selected
- Reset scene
- Export PNG / JPG
- Brush settings for eraser and deform tools

### 2. Scene Canvas

Responsible for all 3D rendering and pointer-driven interactions:

- Camera and orbit controls
- Soft stylized lighting
- Grid and drawing plane helpers
- Selected-object highlight
- Primitive rendering
- Crayon stroke rendering
- Tool gizmos
- Pointer routing to the active tool

### 3. Scene Store

Global serializable application state managed in Zustand:

- Primitive objects
- Crayon strokes
- Current tool
- Current selected object or stroke
- Current active color
- Light settings
- Brush settings
- Undo / redo history

### 4. Tool System

Interaction logic is separated by tool mode:

- `select`
- `transform`
- `crayon`
- `eraser`
- `deform`

Each tool handles its own pointer lifecycle, hit testing, state updates, and completion events.

### 5. Geometry and Style Utilities

Shared helpers for:

- Primitive geometry creation
- Editable mesh conversion
- Vertex deformation
- Eraser hit application
- Crayon stroke generation
- Crayon style material setup
- Canvas export helpers

## Data Model

State should remain serializable. Three.js runtime objects must not be stored directly in the global store.

### Primitive Object

Each primitive entry stores:

- `id`
- `type`
- `color`
- `position`
- `rotation`
- `scale`
- `geometryData`
- `meshResolution`

`geometryData` contains editable vertex and index arrays used to rebuild the mesh after deform and erase operations.

### Crayon Stroke

Each stroke entry stores:

- `id`
- `color`
- `points`
- `thickness`
- `jitterSeed`
- `segmentData`

`points` are the sampled 3D path points captured during drawing. `segmentData` stores the reconstructed chunky stroke segments used for rendering and erasing.

### Light Settings

- `directionalX`
- `directionalY`
- `directionalZ`
- `ambientIntensity`

### Tool Settings

- `activeTool`
- `eraserShape`
- `eraserRadius`
- `deformMode`
- `deformRadius`
- `deformStrength`

### History State

- `past`
- `present`
- `future`

Snapshots store scene data only, never live Three.js objects.

## Feature Design

### Primitive Creation

The shape creation panel adds a new primitive at scene center with:

- Default transform
- Current selected palette color
- Medium geometry density suitable for deformation

New objects are auto-selected after creation.

Supported primitive constructors:

- Sphere
- Cube
- Box
- Cylinder
- Cone
- Capsule

### Selection and Transform

Selection behavior:

- Click object or stroke to select
- Click empty space to clear selection
- Selected items show a stylized outline or glow

Transform behavior:

- Use `TransformControls` for move, rotate, and scale
- Disable orbit controls while dragging transform gizmos
- Commit a history snapshot only when a transform interaction completes

### 3D Crayon Drawing

The crayon tool draws in 3D space with solid-looking strokes instead of flat screen-space lines.

#### Drawing Surface

For the first version, drawing happens on a working plane:

- Default plane sits in front of the camera
- Optional snapping to the ground plane
- If an object is selected, the plane can align near the selected object to keep drawing close to scene content

This keeps interaction predictable while still producing true 3D scene geometry.

#### Stroke Generation

During pointer drag:

- Sample 3D points at distance-based intervals
- Ignore tiny jitter between points
- Build a chunky stroke from short volumetric segments along the sampled path

Each segment gets:

- Slight radius variation
- Small directional wobble
- Surface noise
- Softer rounded ends

This makes the stroke feel like wax crayon buildup rather than a mathematically perfect tube.

#### Palette

The application uses a fixed 12-color crayon palette:

- Red `#ef476f`
- Orange `#f78c35`
- Yellow `#ffd166`
- Light Green `#9adf6d`
- Green `#43aa5c`
- Cyan `#48c6c2`
- Light Blue `#7cc7ff`
- Blue `#3a86ff`
- Purple `#8e6ad8`
- Pink `#ff86c8`
- Brown `#9c6644`
- Black `#2d2a32`

The selected color is always visible in the UI.

### Lighting Direction Control

The lighting panel exposes:

- Directional light X
- Directional light Y
- Directional light Z
- Ambient intensity

All controls update the scene immediately. Lighting remains soft and stylized to preserve the wax-crayon look.

### Crayon Cartoon Rendering Style

The project should avoid realistic rendering.

#### Surface Style

Primitive and stroke materials should use:

- Matte shading
- Soft stepped or gently compressed toon-like light response
- Subtle noise or hatch-like wax fill variation
- Minimal or no sharp specular highlights

#### Edge Style

Selected objects receive a cartoony highlight treatment. General scene readability may also be improved with light outline rendering or edge enhancement if it remains cohesive with the style.

#### Scene Atmosphere

- Warm paper-like background
- Faint helper grid
- Rounded UI panels
- Soft shadows or shadow-like contrast without harsh realism

### Eraser Tool

The eraser is intentionally approximate rather than boolean-accurate.

#### Eraser Shapes

Supported visible eraser gizmos and hit volumes:

- Sphere eraser
- Cube eraser
- Cylinder eraser

#### Stroke Erasing

When the eraser passes over a crayon stroke:

- Remove or split stroke segments that intersect the eraser volume
- Rebuild remaining stroke data

This creates the feeling of physically rubbing away wax marks.

#### Primitive Erasing

When the eraser passes over a primitive:

- Detect vertices inside or near the eraser influence region
- Push affected vertices inward
- Recompute normals

This visually approximates carving or rubbing away wax without expensive mesh booleans.

### Deform / Squish / Knead Tool

The deform tool operates only on selected primitives and modifies their editable vertex data directly.

#### Supported Modes

- `PushPull`
- `Inflate`
- `Smooth`

#### Push / Pull

Moves vertices near the brush center inward or outward along a derived direction, using surface normal or camera-relative direction depending on the interaction context.

#### Inflate

Pushes nearby vertices outward to create a soft swollen wax effect.

#### Smooth

Moves vertices toward neighboring averages to soften hard distortions and recover rounded shapes.

#### Interaction Model

- User selects a primitive
- User chooses deform mode
- User drags over the object
- Brush radius and strength are adjustable
- The mesh updates live during drag
- History snapshot is saved when the brush stroke ends

This gives a tactile sculpting feel without implementing full sculpting infrastructure.

### Undo / Redo

Undo and redo are snapshot-based.

History entries are created when these actions finish:

- Add object
- Delete object
- Complete transform
- Complete crayon stroke
- Complete eraser stroke
- Complete deform stroke
- Reset scene

History is not updated every render frame or pointer move.

### Delete Selected

The selected object or stroke can be deleted from the toolbar. This action is added to history.

### Reset Scene

Reset clears all user-created content and restores:

- Default light values
- Default active tool
- Default palette selection
- Default scene helpers

Reset is also undoable.

### Export Image

The current WebGL canvas view can be exported as:

- PNG
- JPG

Export uses the current camera view so the user can frame the artwork manually before saving.

## Interaction Model

### Camera

- Orbit around scene center
- Zoom in and out
- Pan if supported by orbit controls

### Desktop Priority

The first version is optimized for mouse interaction on desktop. Mobile devices may load the UI but are not guaranteed full editing usability.

### Pointer Rules

- One active tool at a time
- Orbit controls disabled during conflicting drag interactions
- Empty-space click clears selection when appropriate
- Tool-specific pointers or gizmos show current mode clearly

## UI Layout

A single beginner-friendly side toolbar is sufficient for the first release.

Recommended layout:

- Top: app title and quick actions
- Shape creation panel
- Tool switcher
- Color palette
- Brush settings
- Light controls
- Bottom: undo, redo, reset, export

The UI should feel handcrafted:

- Rounded cards
- Soft shadows
- Bold but friendly labels
- Strong current-tool and current-color feedback

## File and Module Plan

The implementation should keep modules narrow and readable. Expected responsibility split:

- App shell and layout
- Store definitions and history helpers
- Scene canvas and environment
- Primitive renderer
- Stroke renderer
- Tool controllers
- Geometry editing utilities
- Export utilities
- UI components by panel

Exact file names can be chosen during planning, but the separation above should be preserved.

## Error Handling and Guardrails

- Disable deform actions if no primitive is selected
- Reject crayon strokes with too few sampled points
- Throttle brush-heavy updates if needed
- Handle export failures with visible UI feedback
- Prevent invalid tool operations from silently failing

## Performance Strategy

- Use medium-resolution meshes for default primitives
- Only process vertices inside the brush influence radius
- Sample crayon strokes by distance to avoid excessive points
- Keep history snapshots data-only
- Avoid unnecessary per-frame React state churn

## Testing Strategy

This project is highly interactive, so testing should focus on stable logic and light UI verification.

### Unit Tests

- Primitive factory helpers
- History reducer or history actions
- Vertex deform functions
- Eraser influence functions
- Crayon stroke sampling and segment generation

### Component Tests

- Tool switching
- Palette selection
- Light slider to store updates
- Undo / redo button behavior

### Manual Verification

- Create each primitive type
- Select and transform objects
- Draw 3D crayon strokes
- Erase strokes and primitives
- Deform selected primitives with each mode
- Change lighting direction
- Undo and redo all core actions
- Export PNG and JPG from chosen viewpoints

## Risks and Trade-offs

### Accepted Trade-offs

- Eraser is approximate, not boolean-accurate
- Deformation is brush-based and localized, not full sculpt topology editing
- Drawing is plane-guided rather than unrestricted volumetric freehand in all directions
- Mobile editing is not a first-release requirement

### Priority Order

If implementation trade-offs are needed, prioritize:

1. Basic 3D scene and primitive creation
2. Crayon cartoon rendering style and palette
3. 3D crayon drawing
4. Lighting controls
5. Eraser functionality
6. Deformation tools
7. Undo / redo
8. Export image

## Success Criteria

The first version is successful if a desktop user can:

- Add and recolor multiple primitives
- Move, rotate, and scale them
- Draw chunky 3D crayon strokes with the 12-color palette
- Adjust lighting direction and see the change immediately
- Erase parts of strokes and visibly carve primitives
- Deform selected primitives in a wax-like way
- Undo and redo major actions
- Export the current view to PNG or JPG

The final impression should feel like a coherent wax-crayon cartoon toy rather than a technical modeling package.
