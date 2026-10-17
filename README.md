# The Living Engineering Notebook

Francesco Trotti's Astro + TypeScript engineering portfolio. **Phase 3 adds an interactive Three.js robotic linkage to the approved notebook foundation.** Later page recomposition and scroll/background choreography remain deferred. No accounts, tracking, external font requests, or backend are required.

## Run

```sh
npm install
npm run dev
```

The dev server runs at `http://localhost:4321`. A project-local Node 22 runtime is included as a dev dependency because current Astro needs Node 22.22 or newer.

```sh
npm run build
npm run preview
npm test
```

Deploy the generated `dist/` directory to any static host. A deployment provider and custom domain have not been selected.

## Make it yours

- Edit `src/data/portfolio.ts` for the public name, introduction, T labs description, and project slots.
- Replace the placeholder project descriptions and illustrations with your real projects. Update the placeholder labels in `src/pages/index.astro` only when genuine content is present.
- Add actual contact links when ready; none are invented or rendered as dead buttons.
- Colors, type, layouts, and breakpoints live in `src/styles/global.css`.
- `src/components/LinkageStudy.astro` contains the progressive SVG, native sliders, and markup. `src/scripts/linkage.ts` synchronizes input, the geometry annotations, and rendering. `src/scripts/linkage-renderer.ts` contains the dimensional Three.js model.
- `src/lib/kinematics.ts` is the framework-independent analytical solver. Existing project illustrations and content remain in `src/components/ProjectArt.astro` and `src/data/portfolio.ts`.
- The previous actuator implementation is retained in `src/scripts/mechanism.ts` for reference but is not imported, rendered, or downloaded by the page.

## The mechanism

- Click a target in the desktop drawing field, or drag the amber end-joint handle. On touch screens, dragging the handle moves the arm; swiping elsewhere still scrolls the page.
- The native shoulder/elbow sliders support touch and keyboard input. **Reset pose** restores the starting joint angles and clears the trace.
- Forward kinematics enforces rigid lengths of 366 and 345 **drawing units**, not physical millimeters. The illustrative fixture's travel is shoulder 40–65° and elbow −95–−45°. Those constraints keep all poses within the composition; they are not specifications of a real robot.
- Inverse kinematics uses the analytic two-link solution and exact closest-point candidates on all four joint-limit boundaries. Unreachable targets get a visible marker, a connector to the achieved position, and an explanatory status message.
- Only joint angles are interpolated. Endpoints and annotations are recomputed from forward kinematics, so links cannot stretch. A bounded 64-point trace records actual end-joint movement.
- This is planar kinematics, not rigid-body dynamics or collision simulation. The model is illustrative, not evidence of a completed project.

## Accessibility and rendering

The small controller initializes SVG and native controls independently of Three.js. The 3D module is imported near the drawing viewport; the already-visible SVG avoids a blank loading stage. GPU failure, context loss, or a failed module download leaves fully interactive 2D kinematics. Without JavaScript, the static SVG and ordinary page/disclosures remain available; the angle controls are clearly disabled.

Three.js uses an orthographic view registered to the same SVG coordinate system, reusable geometry, instanced bearing bolts, and a pixel-ratio cap of 1.5. It draws only after changes or while a requested pose settles, suspends offscreen/in background tabs, and disposes GPU resources on exit. There is no autonomous movement. Reduced motion snaps to requested poses rather than interpolating, and also removes smooth scrolling/CSS transitions.

The stronger dotted field is still one registered, document-wide CSS gradient, not a canvas or thousands of elements. All four navigation anchors remain visible on mobile. Fonts are self-hosted through Fontsource packages (Archivo Variable and Manrope, SIL Open Font License).

Browser tests use Playwright against the production build on a loopback-only test server. Run `npx playwright install chromium` once if a browser is not already installed.

The suite also verifies rigid lengths throughout fixture travel, analytical FK/IK round-trips, closest constrained poses against a dense reference grid, bounded interpolation, touch dragging and scrolling, fallback modes, and idle rendering suspension. These checks are not a substitute for hardware validation or measured production Core Web Vitals.
