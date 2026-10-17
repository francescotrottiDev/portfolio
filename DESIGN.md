---
version: alpha
name: The Living Engineering Notebook
description: A continuous charcoal drawing field with oversized questioning type, interactive fixed-link mechanics, and readable engineering notes.
colors:
  ground: "#111214"
  ink: "#f1f1ed"
  muted: "#b0b1ac"
  line: "#40413e"
  accent: "#d7ad72"
  ice: "#d1d2cb"
  grid-dot: "#ffffff40"
typography:
  display:
    fontFamily: "'Archivo Variable', sans-serif"
    fontWeight: 900
    lineHeight: 0.79
    letterSpacing: "-0.04em"
  display-mobile:
    fontFamily: "'Archivo Variable', sans-serif"
    fontWeight: 900
    lineHeight: 0.8
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "'Archivo Variable', sans-serif"
    fontWeight: 750
    lineHeight: 1.06
    letterSpacing: "-0.04em"
  title:
    fontFamily: "'Archivo Variable', sans-serif"
    fontSize: "25px"
    fontWeight: 750
    lineHeight: 1.06
    letterSpacing: "-0.025em"
  body:
    fontFamily: "'Manrope', sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.7
  body-compact:
    fontFamily: "'Manrope', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.7
  body-large:
    fontFamily: "'Manrope', sans-serif"
    fontSize: "21px"
    fontWeight: 400
    lineHeight: 1.6
  navigation:
    fontFamily: "'Manrope', sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.7
  link:
    fontFamily: "'Manrope', sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.7
  caption:
    fontFamily: "'Manrope', sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.7
  control-label:
    fontFamily: "'Manrope', sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.7
  control-status:
    fontFamily: "'Manrope', sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  none: "0px"
spacing:
  compact: "8px"
  small: "12px"
  medium: "16px"
  related: "24px"
  stack: "36px"
  link-gap: "40px"
  grid-pitch: "24px"
  grid-pitch-mobile: "20px"
components:
  navigation:
    textColor: "{colors.ink}"
    typography: "{typography.navigation}"
    padding: "10px 0px"
  text-link:
    textColor: "{colors.ink}"
    typography: "{typography.link}"
    padding: "0px 0px 10px"
  text-link-hover:
    textColor: "{colors.accent}"
  project-disclosure:
    textColor: "{colors.ink}"
    typography: "{typography.body-compact}"
  project-placeholder:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.none}"
    padding: "3px 8px"
  drawing-caption:
    textColor: "{colors.muted}"
    typography: "{typography.caption}"
  reset-button:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
  reset-button-hover:
    textColor: "{colors.accent}"
  joint-slider:
    backgroundColor: "transparent"
    height: "36px"
  linkage-status:
    textColor: "{colors.muted}"
    typography: "{typography.control-status}"
  linkage-status-limited:
    textColor: "{colors.accent}"
---

# Design System: The Living Engineering Notebook

## Overview

**Creative North Star: "The Living Engineering Notebook"**

One continuous charcoal drawing surface: chalk-white questions, heavy condensed lettering, and a material linkage integrated with construction geometry. Manrope keeps the engineering notes approachable. The interface recedes so the drawing and the owner's interdisciplinary practice carry the character; amber marks joints, small emphasis, and usable states rather than a second theme.

This merges the approved Phase 1–2 foundation with the explicitly authorized Phase 3 interactive Three.js linkage, the confirmed public name Francesco Trotti, and brighter dots. The notebook ground and typography extend through the preserved portfolio sections. Phase 4 section recomposition and Phase 5 background/scroll choreography remain deferred; this is not a completed six-phase redesign. Only requested mechanism movement animates; the drawing sheet remains static.

**Key Characteristics:**
- Neutral charcoal with a continuous, registered white dotted field.
- Oversized Archivo Variable questions paired with readable Manrope notes.
- Original SVG mechanics progressively enhanced with registered Three.js geometry and real fixed-link kinematics.
- Native angle controls with interactive SVG fallback; reading, anchors, and disclosures work without JavaScript.

Ground truth: `src/pages/index.astro`, `src/styles/global.css`, `src/components/LinkageStudy.astro`, `src/scripts/linkage.ts`, `src/scripts/linkage-renderer.ts`, `src/lib/kinematics.ts`, and `src/lib/linkage-view.ts`. Product facts remain in `PRODUCT.md`; surface composition and the phase boundary remain in `.impeccable/surfaces/src-pages-index-astro.md`. The approved notebook identity supersedes the previous workshop fonts, blue-toned colors, brass panel, and actuator UI; the new controls belong to this notebook, not a restoration of that system. Francesco Trotti appears in the header, about signature, footer, and document title; no contact destinations are invented.

## Colors

Neutral charcoal and chalk establish a drawing sheet; restrained amber supports physical detail and interaction feedback.

### Primary
- **Joint amber (`accent`)**: focus outlines, hover feedback, selection background, navigation dot, punctuation, computed angle readouts, native slider accent, end-joint handle, requested-target crosshair, and reach-limit feedback. Bearings use related local material shades, not another interface palette.

### Neutral
- **Notebook charcoal (`ground`)**: the document and opaque placeholder-label ground.
- **Chalk ink (`ink`)**: principal text and headlines.
- **Pencil gray (`muted`)**: explanatory prose, metadata, secondary captions, and notes.
- **Drawing seam (`line`)**: thin section, artwork, header/footer, and disclosure rules.
- **Soft chalk (`ice`)**: neutral emphasis in inherited headings and footer text. The historical CSS alias is retained, but it is not blue.
- **Grid white (`grid-dot`)**: translucent dots over charcoal, not a foreground text color.

The unused `--surface` declaration is not canonized. SVG/Three.js metals, construction strokes, and translucent project-art grounds remain artifact-local. Sidecar tonal ramps are synthesized swatch aids, not additional shipped colors.

**The Continuous Sheet Rule.** Keep the document's dotted ground continuous through transparent section grounds; do not restore the former blue bench or brass venture panel.

## Typography

**Display Font:** Archivo Variable, with sans-serif fallback. **Body Font:** Manrope, with sans-serif fallback. Both are self-hosted via Fontsource; no remote font service is used. Archivo's `standard.css` declares weight (100–900) and width (62%–125%) axes. Manrope imports weights 400, 500, and 600. There is no separate terminal or mono face.

### Hierarchy
- **Display:** `clamp(140px, 16vw, 240px)`, condensed with `font-stretch: 68%`. At 1100px and below it uses `clamp(140px, 17vw, 190px)`; at 700px and below it uses `clamp(110px, 29vw, 190px)` with the `display-mobile` role and 72% stretch. The user-pinned two-line “WHAT IF?” deliberately exceeds 96px; that is intentional hierarchy, not a size defect to normalize.
- **Headline:** `clamp(34px, 4vw, 60px)`, heavy section lettering with 85% stretch. Approach uses `clamp(45px, 4.7vw, 70px)` and 49px on mobile; work uses 35px on mobile. About retains its smaller local heading variant.
- **Title:** project titles; mobile becomes 26px. Default third-level headings are 27px, with local discipline and venture overrides.
- **Body / body-compact:** ordinary reading and project/section copy. Project descriptions cap at 54ch; about prose at 58ch; venture prose at 42ch.
- **Body-large:** approach statement, capped at 40ch and reduced to 18px on mobile.
- **Navigation / link / caption:** ordinary navigation, semibold underlined actions, and readable secondary notes. Drawing caption lead-in is 13px; renderer/disclaimer lines, Reset, and project art captions use the caption size. SVG annotation sizes are viewBox units, not reusable CSS text sizes.
- **Control-label / control-status:** joint labels and actual angle outputs use the former; compact status feedback uses the latter. Outputs use tabular numerals and amber, not a terminal-style telemetry face.

The local T labs wordmark uses weight 850, `clamp(70px, 8vw, 118px)`, and unit leading (74px on mobile). The footer uses weight 800, 80% stretch, `clamp(40px, 5.3vw, 76px)`, and 1.04 leading (48px on mobile; 38px at 360px and below). These are expressive local roles, not extra universal heading levels.

Portable frontmatter omits `fontSize` only for fluid roles: the official validator accepts simple dimensions, not CSS functions. Exact source clamps are recorded above and in sidecar purpose metadata, never replaced with a misleading fixed size. Width-axis settings also remain prose because the typography schema has no `fontStretch` property.

**The Two Voices Rule.** Use heavy, width-variable Archivo for expressive headings and Manrope for reading, captions, navigation, and actions; do not restore the former display face.

## Layout

The statically generated `/` document retains Work, Approach, T labs, and About anchors, plus skip/main and top links. Existing project data, section order, disclosures, and footer composition remain intact. Native joint controls are the only new input group; there are no project-detail routes, submission forms, dialogs, or invented contact workflows.

The body itself owns the repeating radial-dot gradient: a 0.9px dot fades to transparent at 1.25px, repeats at the frontmatter grid pitch, and registers at `background-position: var(--gutter) 0`. The brighter `grid-dot` replaces the former lower-opacity dot by user request. The pitch becomes the mobile value at 700px and below. Faint vertical registration lines sit 20px outside the fluid gutters. This is a static CSS pattern, not an animated or pointer-reactive layer.

Shared sections cap at 1600px with the source fluid gutter `clamp(24px, 5.3vw, 88px)`, recorded here rather than as a nonportable dimension token. The desktop header and hero also cap there on wide screens. Spacing is observed rather than an invented strict scale: small component insets coexist with 32–45px project gaps, 100px two-column gaps, and approximately 100–120px section rhythm. Mobile section padding is approximately 63–67px.

- **Desktop hero:** absolute, nonsticky 96px header; hero height `min(980px, 100svh)` with a 940px minimum to accommodate controls. Question and identity sit upper-left; a large diagonal linkage occupies the central field, with caption lower-right. A ruled control group sits lower-left, 86px above the hero base, at `min(440px, 37%)` width. Content and drawing overlap spatially without a floating product card.
- **At 1100px and below:** hero type and drawing placement adapt; projects become equal columns and secondary project text moves below its illustration. Approach/about gaps reduce to 55px.
- **At 700px and below:** the 120px header stacks brand above all four navigation items; only the navigation arrow is hidden. Hero uses natural height and source order: question, identity, work link, drawing, caption, then controls. The drawing viewport is 118% wide with a −9% left margin; sliders become 44px high. Detailed SVG labels and callout leaders are hidden, but the accessible description remains. Work, Approach, T labs, and About stack without restructuring their content.
- **At 360px and below:** footer display and small hero-bottom metadata tighten locally; these are not general reading sizes.

The existing lower-page grids are preserved, not claimed as Phase 4 recomposition. T labs is now an open, ruled, transparent section rather than a contrasting inset; project SVGs are desaturated with CSS while remaining explicitly illustrative.

One padded drawing field (`x: −20`, `y: −52`, `width: 1040`, `height: 712`, in drawing units) owns SVG viewBox, orthographic camera, CSS aspect ratio, and pointer mapping. It includes the full mechanism silhouette—gripper fingers, bearings, links, and mounting base—across the permitted travel, not merely the wrist coordinates. Do not adjust these registrations independently.

## Elevation & Depth

The interface is flat: fine rules, type contrast, and continuous registration establish hierarchy, with no CSS box-shadow system. Depth belongs to the linkage: original SVG metal gradients, bearing rings and hatching progressively yield to extruded Three.js links, metal materials, and dimensional bearings. Construction geometry remains in SVG over the transparent canvas. These are depicted material, not floating interface chrome. Do not prohibit gradients universally: both the notebook dots and SVG material use them natively.

A small core controller initializes SVG and native controls independently of the viewport-lazy Three.js module. Input-driven joint damping uses `1 − exp(−18 × clamp(delta, 0, 0.05))`; endpoints and annotations are recomputed with forward kinematics rather than interpolated independently. Direct slider changes snap. Reduced motion makes every requested pose snap, disables smooth scrolling, and zeroes CSS transition/animation durations. There is no autonomous mechanism or background movement and no pause control is needed.

Rendering is demand-driven: GPU frames stop when settled, offscreen, or in a hidden tab. Pixel ratio is capped at 1.5; bearing bolts are instanced and geometry is shared. GPU resources are disposed on exit. CSS retains 180ms color/background/border feedback, a 200ms ease-out up-right link-arrow shift, and a 180ms ease-out disclosure indicator. The old actuator code in `src/scripts/mechanism.ts` is retained but not imported or downloaded.

## Shapes

Interface geometry is square-cornered and open, with one-pixel rules rather than elevated cards. Circular navigation dots, bearing rings, rounded physical links, and SVG construction arcs belong to their depicted roles, not a rounded-card vocabulary. Range controls retain browser-native track/thumb shapes; do not apply the square-container rule to their affordances. Arrows are inline stroked SVG; the native disclosure plus is drawn with CSS strokes rather than a glyph icon.

## Components

### Navigation and text links

Four ordinary section anchors remain visible at every shipped layout. Desktop navigation uses a 38px gap; mobile distributes links across a full row without a hamburger. Navigation, brand, text actions, and the back-to-top link have at least 44px minimum height; native summaries have 48px. No active-section tracking is implemented.

Text links use semibold Manrope, a thin bottom stroke, 40px arrow gap, and 10px bottom padding. Hover turns text and rule amber; up-right arrows shift 2px right/up. Focus uses the global amber outline (2px, 6px offset), not hover alone.

### Project placeholders and native disclosures

Projects remain open editorial articles, not clickable case-study cards. Every illustration retains “Project placeholder” and “Illustrative study — not project imagery.” The square placeholder label is informational, not an action or category eyebrow. Discipline appears after the title and description as trailing metadata.

Native `details`/`summary` exposes “What will go here” without JavaScript. Its top seam, 48px summary, and CSS plus/minus indicate the disclosure; the body explicitly says no project is published. Placeholder data stays in `src/data/portfolio.ts` until real owner-supplied material exists.

### Joint controls and Reset

Quiet native controls, not a simulation dashboard. A seam and opaque charcoal ground separate the two-column input group from the drawing; each joint has a visible label, actual angle output, and native range input. Shoulder travel is 40–65°; elbow travel is −95–−45°; slider steps are 0.1°. Outputs round actual angles to one decimal and use `aria-live="off"` to avoid streaming announcements; native control values and a separate `role="status"` provide feedback. The fieldset has an accessible legend and shared status/limit descriptions.

Ranges are 36px high on desktop and 44px on mobile, with amber native accent. Reset is a square, transparent, one-pixel seam-bordered button, padded 8px/12px with at least 44px height. Hover makes border/text amber; global focus remains visible. Disabled inputs retain native semantics; disabled buttons use 0.45 opacity and a not-allowed cursor. Reset restores the initial 55° / −71.86° pose and clears the bounded movement history (a fresh initial point may be recorded).

### Interactive linkage and caption

An original inline SVG depicts fixed shoulder, elbow, two rigid links, and end effector. The small controller activates native inputs and SVG before the dimensional renderer loads; the orthographic Three.js scene replaces only the solid drawing, leaving annotations and interaction registered in SVG. There is no view switch. Failed WebGL creation, dynamic import failure, or context loss preserves fully interactive SVG kinematics. With no JavaScript, the original static SVG remains visible and the fieldset is disabled with an explanatory status.

Rigid links are 366 and 345 drawing units, not hardware measurements. Forward kinematics and analytical inverse kinematics share the same joint bounds. IK considers the interior solution and exact closest-point candidates along all four joint-limit boundaries, including corners, rather than arbitrarily clamping a target radius. Damping changes joint angles only, preserving both lengths throughout motion. A trace stores at most 64 actual end-joint positions.

Mouse click/drag selects targets in the field. On touch (and other non-mouse pointers), only the amber end-joint handle owns the drag; the rest of the viewport retains vertical page panning. The enlarged SVG hit region is not a keyboard button: labelled native sliders provide the keyboard alternative. A constrained target shows an amber requested-position crosshair, a connector to the achieved wrist, and explanatory reach-limit status; color is not the only signal.

A real `figure`/`figcaption`, SVG image role, title, and dynamic description identify an illustrative planar kinematics study, not a completed project or dynamics/collision simulator. The caption retains “Two links. One chain of motion.” and “Fixed lengths · No dynamics simulation”; its renderer line reports static, interactive 2D, or 3D mode. Mobile hides detailed visible drawing annotations, not the accessible description or caption. Angle values are computed, not invented telemetry.

### Accessibility and evidence

English language, landmarks, labelled sections/controls, a keyboard-visible skip link, native anchors/disclosures, and visible focus are implemented. Selection reverses to charcoal on amber; scrollbar colors are explicitly neutral charcoal and gray. Reduced-motion handling spans global CSS and the linkage controller. Reading, navigation, and disclosures never depend on JavaScript or WebGL.

The Phase 1–2 foundation retains its prior approval; it does not establish Phase 3 approval. `.impeccable/review/linkage-finish-review.md` owns the Phase 3 evidence and latest disposition. Its first full review requested one implementation fix: the gripper silhouette clipped at the travel boundary. The geometry verdict marks that fix **resolved** using the shared padded field, with no further material implementation work or recapture requested. Documentation was pending at that verdict; this handoff records the corrected system without claiming fresh full-surface approval. The geometry verdict scored the framing batch only, and documentation verification is a separate check.

The reviewer validated six existing full-page captures: `.impeccable/review/linkage-desktop.png` (1440×1000 viewport; 1440×3999 full page), `linkage-mobile.png` (390×844 viewport; final 390×5094 full page), and `linkage-limit-webgl-desktop.png`, `linkage-limit-webgl-mobile.png`, `linkage-limit-svg-desktop.png`, `linkage-limit-svg-mobile.png` (matching desktop/mobile full-page dimensions). Upper-limit captures show the complete silhouette at 65° / −45° in both renderers. The review initially reported a 390×5068 mobile capture before the framing recapture. These are reviewer-validated artifacts, not new screenshots or a visual review performed by this documenter.

The parent reports 23 passing tests covering rigid math, FK/IK and constrained targets, the full fixture envelope at 0.5° increments and actual SVG bounds, keyboard/touch/click/limits, failure paths, no-JS, overflow at eight sizes, desktop/mobile axe checks, and idle RAF suspension. A passing build/check with zero type errors is reported; the deferred Three.js chunk still carries a greater-than-500 kB build advisory. A pre-final-small-fix gzip estimate was approximately 4.2 kB for the core and 131 kB for the renderer. None was rerun here; these are not fresh Core Web Vitals, production performance measurements, hardware validation, or exhaustive accessibility certification.

The detector ran once before the framing fix and documentation merge; only font/color advisories against old documented roles were reported. It was not rerun and is not a reason to restore the discarded world. The previous provenance scan reported zero shipping rasters: SVG artwork and procedural Three.js geometry remain the shipping materials; review PNGs are evidence, not deployed artwork. No new provenance scan is claimed. Unused old actuator code and the chunk-size advisory are disclosed, not canonized as design rules or repaired by this documentation-only increment.

Official `@google/design.md` v0.4.0 token/schema validation reports zero errors and four warnings: no literal `primary` key, and `line`, `ice`, and `grid-dot` lack frontmatter component references. The established `accent` name and source-used neutral tokens are preserved; border/background roles outside the eight portable component properties remain in prose and sidecar CSS rather than introducing aliases to silence the linter.

## Do's and Don'ts

### Do:
- **Do** preserve neutral charcoal, registered dots, transparent section grounds, and square interface geometry.
- **Do** retain the intentionally oversized question and the Archivo/Manrope division of roles.
- **Do** keep illustration captions, factual placeholders, native navigation/disclosures, visible focus, and reduced-motion handling.
- **Do** preserve all four navigation anchors and trailing project discipline metadata on mobile.
- **Do** keep joint controls truthful, link lengths rigid, the complete silhouette within one shared field, and SVG usable when 3D fails.
- **Do** stop at authorized Phase 3; keep Phase 4 section recomposition and Phase 5 background/scroll choreography deferred.

### Don't:
- **Don't** restore obsolete blue accents, former fonts, brass panels, or actuator bench controls from the superseded system.
- **Don't** animate the dotted field, add autonomous mechanism motion, or claim a completed six-phase redesign.
- **Don't** invent projects, results, identity, measurements, telemetry, startup traction, delivered impact, or contact destinations.
- **Don't** make reading, navigation, or project disclosures depend on JavaScript or WebGL.
- **Don't** turn explanatory notes into reusable decorative eyebrows or treat review screenshots as shipped imagery.
