import { LINKAGE, approachPose, clamp, constrainPose, degrees, forwardKinematics, inverseKinematics, radians, type Point, type Pose } from '../lib/kinematics';
import type { createLinkageRenderer } from './linkage-renderer';
import { DRAWING_FIELD, LINKAGE_BASE } from '../lib/linkage-view';

type Renderer = ReturnType<typeof createLinkageRenderer>;
const BASE = LINKAGE_BASE;
const screen = (point: Point): Point => ({ x: BASE.x + point.x, y: BASE.y - point.y });
const coordinate = (point: Point) => `${point.x.toFixed(3)} ${point.y.toFixed(3)}`;
const angleText = (angle: number) => `${degrees(angle).toFixed(1)}°`;

export function initLinkage(root: HTMLElement) {
  const viewport = root.querySelector<HTMLElement>('.linkage-viewport')!;
  const svg = root.querySelector<SVGSVGElement>('.linkage-drawing')!;
  const fieldset = root.querySelector<HTMLFieldSetElement>('fieldset')!;
  const shoulderInput = root.querySelector<HTMLInputElement>('#shoulder-angle')!;
  const elbowInput = root.querySelector<HTMLInputElement>('#elbow-angle')!;
  const status = root.querySelector<HTMLElement>('#linkage-status')!;
  const rendererStatus = root.querySelector<HTMLElement>('[data-renderer-status]')!;
  const description = root.querySelector<SVGDescElement>('#linkage-description')!;
  const abort = new AbortController();
  const { signal } = abort;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const element = <T extends SVGElement>(name: string) => root.querySelector<T>(`[data-${name}]`)!;
  const upper = element<SVGGElement>('upper');
  const lower = element<SVGGElement>('lower');
  const elbowJoint = element<SVGGElement>('elbow-joint');
  const wristJoint = element<SVGGElement>('wrist-joint');
  const tool = element<SVGGElement>('tool');
  const targetMarker = element<SVGGElement>('target');
  const requestedMarker = element<SVGGElement>('requested');
  const trace = element<SVGPolylineElement>('trace');
  const reachLine = element<SVGPathElement>('reach-line');
  let pose: Pose = { ...LINKAGE.initial };
  let target: Pose = { ...pose };
  let request = forwardKinematics(pose).tool;
  let limited = false;
  let renderer: Renderer | undefined;
  let rendererStarted = false;
  let destroyed = false;
  let visible = false;
  let dirty = true;
  let frame = 0;
  let previousTime = performance.now();
  let pointerId: number | null = null;
  let tracePoints: Point[] = [];
  const needsMotion = () => Math.abs(pose.shoulder-target.shoulder)+Math.abs(pose.elbow-target.elbow) > .00005;
  const attr = (node: Element, name: string, value: string) => node.setAttribute(name, value);
  const path = (name: string, value: string) => attr(element(name), 'd', value);
  const arc = (center: Point, radius: number, start: number, end: number) => {
    const point = (angle: number) => ({ x: center.x+radius*Math.cos(angle), y: center.y-radius*Math.sin(angle) });
    return `M${coordinate(point(start))}A${radius} ${radius} 0 0 ${end > start ? 0 : 1} ${coordinate(point(end))}`;
  };
  const dimension = (start: Point, end: Point, offset: number) => {
    const dx = end.x-start.x, dy = end.y-start.y;
    const length = Math.hypot(dx, dy);
    const normal = { x: dy/length, y: -dx/length };
    const a = { x: start.x+normal.x*offset, y: start.y+normal.y*offset };
    const b = { x: end.x+normal.x*offset, y: end.y+normal.y*offset };
    const tick = (point: Point) => `M${point.x-normal.x*5} ${point.y-normal.y*5}l${normal.x*10} ${normal.y*10}`;
    return { line: `M${coordinate(a)}L${coordinate(b)}${tick(a)}${tick(b)}`, middle: { x:(a.x+b.x)/2+normal.x*9, y:(a.y+b.y)/2+normal.y*9 } };
  };
  const setStatus = (text: string) => { if (status.textContent !== text) status.textContent = text; };

  const draw = (render3d = true) => {
    const { joint, tool: tip } = forwardKinematics(pose);
    const elbow = screen(joint), wrist = screen(tip), requested = screen(request);
    const firstAngle = -degrees(pose.shoulder), secondAngle = -degrees(pose.shoulder+pose.elbow);
    attr(upper, 'transform', `translate(260 480) rotate(${firstAngle})`);
    attr(lower, 'transform', `translate(${coordinate(elbow)}) rotate(${secondAngle})`);
    attr(elbowJoint, 'transform', `translate(${coordinate(elbow)})`);
    attr(wristJoint, 'transform', `translate(${coordinate(wrist)})`);
    attr(tool, 'transform', `translate(${coordinate(wrist)}) rotate(${secondAngle})`);
    path('skeleton', `M260 480L${coordinate(elbow)}L${coordinate(wrist)}`);
    path('elbow-sweep', arc(elbow, LINKAGE.second, pose.shoulder+pose.elbow-.18, pose.shoulder+pose.elbow+.7));
    path('shoulder-arc', arc(BASE, 65, 0, pose.shoulder));
    path('elbow-arc', arc(elbow, 70, pose.shoulder, pose.shoulder+pose.elbow));
    path('joint-rays', `M260 480h100M260 480l${Math.cos(pose.shoulder)*105} ${-Math.sin(pose.shoulder)*105}M${coordinate(elbow)}l${Math.cos(pose.shoulder)*100} ${-Math.sin(pose.shoulder)*100}M${coordinate(elbow)}l${Math.cos(pose.shoulder+pose.elbow)*105} ${-Math.sin(pose.shoulder+pose.elbow)*105}`);
    const first = dimension(BASE, elbow, 75), second = dimension(elbow, wrist, 74);
    path('length-lines', first.line+second.line);
    for (const [name, point, angle] of [['length-one', first.middle, firstAngle], ['length-two', second.middle, secondAngle]] as const) {
      attr(element(name), 'transform', `translate(${coordinate(point)}) rotate(${angle})`);
    }
    const placeAngle = (name: string, center: Point, angle: number, value: number) => {
      const point = { x: center.x+90*Math.cos(angle), y: center.y-90*Math.sin(angle) };
      attr(element(name), 'x', String(point.x)); attr(element(name), 'y', String(point.y));
      element(name).textContent = angleText(value);
    };
    placeAngle('angle-one', BASE, pose.shoulder/2, pose.shoulder);
    placeAngle('angle-two', elbow, pose.shoulder+pose.elbow/2, pose.elbow);
    path('elbow-leader', `M${elbow.x} ${elbow.y-43}L500 66H675`);
    attr(element('elbow-dot'), 'cx', String(elbow.x)); attr(element('elbow-dot'), 'cy', String(elbow.y-43));
    const label = { x: clamp(wrist.x-70, 500, 820), y: clamp(wrist.y+110, 100, 590) };
    path('tool-leader', `M${wrist.x+34} ${wrist.y}L${label.x+88} ${label.y-20}H${label.x}`);
    attr(element('tool-label'), 'x', String(label.x)); attr(element('tool-label'), 'y', String(label.y));
    attr(targetMarker, 'transform', `translate(${coordinate(wrist)})`);
    attr(requestedMarker, 'transform', `translate(${coordinate(requested)})`);
    requestedMarker.style.display = limited ? '' : 'none';
    reachLine.style.display = limited ? '' : 'none';
    attr(reachLine, 'd', `M${coordinate(requested)}L${coordinate(wrist)}`);
    const last = tracePoints.at(-1);
    if (!last || Math.hypot(last.x-wrist.x, last.y-wrist.y) > 2) {
      tracePoints.push(wrist);
      if (tracePoints.length > 64) tracePoints.shift();
      attr(trace, 'points', tracePoints.map(point => `${point.x},${point.y}`).join(' '));
    }
    shoulderInput.value = degrees(pose.shoulder).toFixed(2);
    elbowInput.value = degrees(pose.elbow).toFixed(2);
    for (const [name, angle] of [['shoulder', pose.shoulder], ['elbow', pose.elbow]] as const) {
      root.querySelector<HTMLOutputElement>(`#${name}-value`)!.value = angleText(angle);
    }
    description.textContent = `Illustrative planar mechanism. Shoulder ${angleText(pose.shoulder)}; elbow ${angleText(pose.elbow)}. Two rigid links of 366 and 345 drawing units. Adjust the angle sliders or drag the amber end joint. Joint travel is limited; this is kinematics, not a dynamics or collision simulation.`;
    root.dataset.limited = String(limited);
    root.dataset.shoulder = String(pose.shoulder);
    root.dataset.elbow = String(pose.elbow);
    if (render3d && visible && !document.hidden) renderer?.render(pose);
    dirty = false;
  };
  const animate = (time: number) => {
    frame = 0;
    if (destroyed || !visible || document.hidden) return;
    const delta = (time-previousTime)/1000;
    previousTime = time;
    if (reducedMotion.matches) pose = { ...target };
    else pose = approachPose(pose, target, delta);
    if (!needsMotion()) pose = { ...target };
    draw();
    if (needsMotion()) schedule();
  };
  function schedule() {
    if (!frame && !destroyed && visible && !document.hidden && (dirty || needsMotion())) {
      previousTime = performance.now();
      frame = requestAnimationFrame(animate);
    }
  }
  const update = (next: Pose, immediate = false) => {
    target = constrainPose(next);
    if (immediate || reducedMotion.matches || !visible || document.hidden) {
      pose = { ...target };
      // Controls remain truthful even if tabbing/scrolling puts the drawing offscreen.
      // Only the SVG/readouts update here; GPU work stays suspended offscreen.
      draw(false);
    }
    dirty = true;
    schedule();
  };
  const sliderInput = () => {
    limited = false;
    const next = constrainPose({ shoulder: radians(Number(shoulderInput.value)), elbow: radians(Number(elbowInput.value)) });
    request = forwardKinematics(next).tool;
    setStatus('Angles set directly. Drag the amber joint to solve for a target.');
    update(next, true);
  };
  shoulderInput.addEventListener('input', sliderInput, { signal });
  elbowInput.addEventListener('input', sliderInput, { signal });
  root.querySelector('[data-reset]')!.addEventListener('click', () => {
    limited = false;
    tracePoints = [];
    request = forwardKinematics(LINKAGE.initial).tool;
    setStatus('Pose reset. Drag the amber joint or use the angle controls.');
    update(LINKAGE.initial);
  }, { signal });

  const pointerPosition = (event: PointerEvent): Point | null => {
    const matrix = svg.getScreenCTM();
    if (!matrix) return null;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return { x: clamp(point.x, DRAWING_FIELD.x, DRAWING_FIELD.x+DRAWING_FIELD.width)-BASE.x, y: BASE.y-clamp(point.y, DRAWING_FIELD.y, DRAWING_FIELD.y+DRAWING_FIELD.height) };
  };
  const setPointerTarget = (event: PointerEvent) => {
    const point = pointerPosition(event);
    if (!point) return;
    const solution = inverseKinematics(point);
    request = point;
    limited = solution.limited;
    setStatus(limited ? 'Joint limit reached. Showing the closest reachable pose.' : 'Following target within joint travel.');
    update(solution.pose);
  };
  viewport.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary || event.button !== 0 || pointerId !== null) return;
    // On touch, only the large end-joint handle owns the gesture; the rest still scrolls.
    if (event.pointerType !== 'mouse' && !(event.target instanceof Element && event.target.closest('[data-target]'))) return;
    pointerId = event.pointerId;
    viewport.setPointerCapture(pointerId);
    viewport.classList.add('is-dragging');
    setPointerTarget(event);
    event.preventDefault();
  }, { signal });
  viewport.addEventListener('pointermove', (event) => { if (event.pointerId === pointerId) setPointerTarget(event); }, { signal });
  const release = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) return;
    pointerId = null;
    viewport.classList.remove('is-dragging');
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
  };
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture'] as const) viewport.addEventListener(name, release, { signal });

  const fallback = () => {
    const oldRenderer = renderer;
    renderer = undefined;
    oldRenderer?.dispose();
    viewport.classList.remove('is-three-ready');
    root.dataset.renderer = 'svg';
    rendererStatus.textContent = '2D view · Controls available';
    dirty = true;
    schedule();
  };
  const startRenderer = async () => {
    if (rendererStarted || destroyed) return;
    rendererStarted = true;
    try {
      const { createLinkageRenderer } = await import('./linkage-renderer');
      if (destroyed) return;
      renderer = createLinkageRenderer(viewport, fallback);
      renderer.render(pose);
      viewport.classList.add('is-three-ready');
      root.dataset.renderer = 'webgl';
      rendererStatus.textContent = '3D view · Planar kinematics';
    } catch { fallback(); }
  };
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) { void startRenderer(); schedule(); }
    else if (frame) { cancelAnimationFrame(frame); frame = 0; }
  }, { threshold: .01 });
  observer.observe(viewport);
  const resizeObserver = new ResizeObserver(() => { renderer?.resize(); dirty = true; schedule(); });
  resizeObserver.observe(viewport);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else schedule();
  }, { signal });
  reducedMotion.addEventListener('change', () => { dirty = true; schedule(); }, { signal });
  const dispose = () => {
    destroyed = true;
    abort.abort();
    cancelAnimationFrame(frame);
    observer.disconnect(); resizeObserver.disconnect();
    renderer?.dispose();
  };
  window.addEventListener('pagehide', event => {
    if (!event.persisted) dispose();
    else { cancelAnimationFrame(frame); frame = 0; }
  }, { signal });
  window.addEventListener('pageshow', () => { dirty = true; schedule(); }, { signal });
  fieldset.disabled = false;
  root.dataset.linkageReady = 'true';
  setStatus('Drag the amber joint, click a target, or use the angle controls.');
  draw();
}
