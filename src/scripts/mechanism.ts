import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/** Original illustrative geometry. This is a visual study, not a simulated or real product. */
export function initMechanism(stage: HTMLElement) {
  const status = document.getElementById('mechanism-status');
  const controls = [...document.querySelectorAll<HTMLButtonElement>('[data-view]')];
  const pauseButton = document.getElementById('motion-control') as HTMLButtonElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch {
    if (status) status.textContent = 'Illustrative study · Static view (3D unavailable)';
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(31, 1, .1, 60);
  camera.position.set(5, 4.5, 8.5);
  camera.lookAt(0, .1, 0);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04);
  scene.environment = environment.texture;
  scene.environmentIntensity = .8;
  room.dispose();
  pmrem.dispose();
  scene.add(new THREE.AmbientLight(0xb8d0e1, .3));
  const key = new THREE.DirectionalLight(0xe4f1ff, 3);
  key.position.set(-3, 7, 5);
  scene.add(key);
  const warm = new THREE.DirectionalLight(0xe5ad71, 2);
  warm.position.set(5, 1, -2);
  scene.add(warm);
  const rim = new THREE.DirectionalLight(0x89c5ed, 3);
  rim.position.set(-4, -1, -5);
  scene.add(rim);

  const metal = new THREE.MeshStandardMaterial({ color: 0x627b8b, metalness: .96, roughness: .28 });
  const edge = new THREE.MeshStandardMaterial({ color: 0xb8c9d3, metalness: .94, roughness: .2 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x25333d, metalness: .85, roughness: .32 });
  const copper = new THREE.MeshStandardMaterial({ color: 0xbf793e, metalness: .85, roughness: .3 });
  const black = new THREE.MeshStandardMaterial({ color: 0x111b24, metalness: .35, roughness: .43 });
  const model = new THREE.Group();
  model.rotation.z = -.55;
  model.rotation.y = -.3;
  scene.add(model);
  const parts: { group: THREE.Group; base: number; offset: number }[] = [];
  const geometries = new Set<THREE.BufferGeometry>();
  const mesh = (geometry: THREE.BufferGeometry, material: THREE.Material, parent: THREE.Object3D, y = 0) => {
    geometries.add(geometry);
    const object = new THREE.Mesh(geometry, material);
    object.position.y = y;
    parent.add(object);
    return object;
  };
  const cylinder = (radius: number, height: number, material: THREE.Material, parent: THREE.Object3D, y = 0) => mesh(new THREE.CylinderGeometry(radius, radius, height, 96), material, parent, y);
  const ring = (inner: number, outer: number, height: number, material: THREE.Material, parent: THREE.Object3D, y = 0) => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, outer, 0, Math.PI*2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, inner, 0, Math.PI*2, true);
    shape.holes.push(hole);
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .018, bevelThickness: .018, curveSegments: 64 });
    geometry.rotateX(-Math.PI/2);
    geometry.translate(0, -height/2, 0);
    return mesh(geometry, material, parent, y);
  };
  const torus = (radius: number, tube: number, material: THREE.Material, parent: THREE.Object3D, y = 0) => {
    const geometry = new THREE.TorusGeometry(radius, tube, 10, 96);
    geometry.rotateX(Math.PI/2);
    return mesh(geometry, material, parent, y);
  };
  const layer = (base: number, offset: number) => {
    const group = new THREE.Group();
    group.position.y = base;
    model.add(group);
    parts.push({ group, base, offset });
    return group;
  };
  const bolts = (parent: THREE.Object3D, radius: number, y: number, count = 8) => {
    const geometry = new THREE.CylinderGeometry(.065, .065, .07, 6);
    for (let i = 0; i < count; i++) {
      const bolt = mesh(geometry, dark, parent, y);
      bolt.position.x = Math.cos(i/count*Math.PI*2)*radius;
      bolt.position.z = Math.sin(i/count*Math.PI*2)*radius;
      const recess = cylinder(.025, .006, black, parent, y+.038);
      recess.position.x = bolt.position.x;
      recess.position.z = bolt.position.z;
    }
  };

  const base = layer(-.8, -1.2);
  ring(.32, 1.26, .16, metal, base);
  ring(.38, 1.12, .07, edge, base, -.09);
  cylinder(.35, .4, dark, base, -.24);
  bolts(base, 1.07, .1, 10);
  const housing = layer(-.27, -.55);
  ring(.96, 1.16, .85, dark, housing);
  for (let i = 0; i < 8; i++) torus(1.17, .025, metal, housing, -.36+i*.105);
  ring(.92, 1.22, .07, edge, housing, .45);
  const winding = layer(.03, .1);
  ring(.66, .98, .4, black, winding);
  for (let i = 0; i < 36; i++) {
    const coil = new THREE.Group();
    coil.position.set(Math.cos(i/36*Math.PI*2)*.84, 0, Math.sin(i/36*Math.PI*2)*.84);
    coil.rotation.y = -i/36*Math.PI*2;
    winding.add(coil);
    for (let j = 0; j < 4; j++) {
      const turn = mesh(new THREE.TorusGeometry(.16, .018, 6, 16), copper, coil);
      turn.scale.set(.75, 1.6, 1);
      turn.position.z = (j-1.5)*.04;
    }
  }
  const rotor = layer(.42, .65);
  cylinder(.6, .3, metal, rotor);
  for (let i = 0; i < 18; i++) {
    const tooth = mesh(new THREE.BoxGeometry(.13, .28, .13), edge, rotor);
    tooth.position.set(Math.cos(i/18*Math.PI*2)*.6, 0, Math.sin(i/18*Math.PI*2)*.6);
    tooth.rotation.y = -i/18*Math.PI*2;
  }
  cylinder(.2, 1.05, edge, rotor, .28);
  ring(.15, .28, .06, dark, rotor, .83);
  const lid = layer(.72, 1.45);
  ring(.32, 1.18, .12, metal, lid);
  ring(.82, 1.2, .045, edge, lid, .08);
  ring(.32, .56, .12, dark, lid, .1);
  ring(.32, .44, .035, copper, lid, .18);
  bolts(lid, 1.02, .14, 8);
  for (let i = 0; i < 8; i++) {
    const cut = mesh(new THREE.BoxGeometry(.07, .018, .25), black, lid, .075);
    const angle = i/8*Math.PI*2;
    cut.position.set(Math.cos(angle)*.7, .075, Math.sin(angle)*.7);
    cut.rotation.y = -angle+Math.PI/2;
  }

  let target = .42;
  let separation = .42;
  let userPaused = reducedMotion.matches;
  let visible = true;
  let frame = 0;
  let lastTime = 0;
  let destroyed = false;
  const resize = () => {
    const { width, height } = stage.getBoundingClientRect();
    renderer.setSize(width, height);
    camera.aspect = width/height;
    camera.position.setLength(width < 550 ? 10.9 : 9.7);
    camera.updateProjectionMatrix();
    schedule();
  };
  const draw = (time: number) => {
    frame = 0;
    if (destroyed || !visible || document.hidden) return;
    const delta = Math.min((time-lastTime)/1000, .05);
    lastTime = time;
    separation = reducedMotion.matches ? target : THREE.MathUtils.damp(separation, target, 5, delta);
    parts.forEach(({ group, base: position, offset }) => { group.position.y = position+offset*separation; });
    if (!userPaused) model.rotation.y += delta*.09;
    renderer.render(scene, camera);
    if (!userPaused || Math.abs(separation-target) > .001) schedule();
  };
  function schedule() { if (!frame && !destroyed && visible && !document.hidden) frame = requestAnimationFrame(draw); }
  const updatePause = () => {
    pauseButton.textContent = userPaused ? 'Resume rotation' : 'Pause rotation';
    pauseButton.setAttribute('aria-pressed', String(userPaused));
    schedule();
  };
  const onPause = () => { userPaused = !userPaused; updatePause(); };
  pauseButton.hidden = false;
  pauseButton.addEventListener('click', onPause);
  controls.forEach(button => {
    button.disabled = false;
    button.addEventListener('click', () => {
      target = button.dataset.view === 'exploded' ? 1 : 0;
      controls.forEach(control => control.setAttribute('aria-pressed', String(control === button)));
      if (status) status.textContent = `Illustrative 3D study · ${target ? 'Exploded view' : 'Assembled view'}`;
      schedule();
    });
  });
  // Start assembled; the small initial separation exposes the copper winding without hiding the fit.
  target = 0;
  const onMotion = () => { userPaused = reducedMotion.matches; updatePause(); };
  reducedMotion.addEventListener('change', onMotion);
  const onVisibility = () => { lastTime = performance.now(); schedule(); };
  document.addEventListener('visibilitychange', onVisibility);
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; lastTime = performance.now(); schedule(); });
  observer.observe(stage);
  const sizeObserver = new ResizeObserver(resize);
  sizeObserver.observe(stage);
  stage.classList.add('is-ready');
  if (status) status.textContent = 'Illustrative 3D study · Assembled view';
  updatePause();
  resize();

  renderer.domElement.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    destroyed = true;
    cancelAnimationFrame(frame);
    stage.classList.remove('is-ready');
    controls.forEach(button => { button.disabled = true; });
    pauseButton.hidden = true;
    if (status) status.textContent = 'Illustrative study · Static view (3D unavailable)';
  });
  const cleanup = () => {
    destroyed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    sizeObserver.disconnect();
    reducedMotion.removeEventListener('change', onMotion);
    document.removeEventListener('visibilitychange', onVisibility);
    geometries.forEach(geometry => geometry.dispose());
    [metal, edge, dark, copper, black].forEach(material => material.dispose());
    environment.dispose();
    renderer.dispose();
  };
  window.addEventListener('pagehide', event => { if (!event.persisted) cleanup(); }, { once: true });
}
