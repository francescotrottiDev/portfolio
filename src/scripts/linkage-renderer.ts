import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { LINKAGE, type Pose } from '../lib/kinematics';
import { DRAWING_FIELD, LINKAGE_BASE } from '../lib/linkage-view';

/** Orthographic XY mechanism. Camera and SVG share padded whole-silhouette framing. */
export function createLinkageRenderer(host: HTMLElement, onLost: () => void) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .95;
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.className = 'linkage-canvas';
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-DRAWING_FIELD.width/2, DRAWING_FIELD.width/2, DRAWING_FIELD.height/2, -DRAWING_FIELD.height/2, 1, 4000);
  const center = {x:DRAWING_FIELD.x+DRAWING_FIELD.width/2,y:-(DRAWING_FIELD.y+DRAWING_FIELD.height/2)};
  camera.position.set(center.x, center.y, 1500);
  camera.lookAt(center.x, center.y, 0);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .05, .1, 100, { size: 128 });
  scene.environment = environment.texture;
  scene.environmentIntensity = .9;
  room.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xe4e8dc, 0x181b19, 1.6));
  const key = new THREE.DirectionalLight(0xeef1e8, 3);
  key.position.set(-300, 500, 700);
  scene.add(key);
  const warm = new THREE.DirectionalLight(0xd7ad72, 1.4);
  warm.position.set(800, -200, 300);
  scene.add(warm);

  const metal = new THREE.MeshStandardMaterial({ color: 0xa3aaa2, metalness: .88, roughness: .3 });
  const side = new THREE.MeshStandardMaterial({ color: 0x3e4841, metalness: .8, roughness: .4 });
  const rim = new THREE.MeshStandardMaterial({ color: 0xcbd1c5, metalness: .9, roughness: .23 });
  const inset = new THREE.MeshStandardMaterial({ color: 0x222b25, metalness: .65, roughness: .4 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xc39b62, metalness: .8, roughness: .31 });
  const geometries = new Set<THREE.BufferGeometry>();
  const mesh = (geometry: THREE.BufferGeometry, material: THREE.Material | THREE.Material[], parent: THREE.Object3D) => {
    geometries.add(geometry);
    const object = new THREE.Mesh(geometry, material);
    parent.add(object);
    return object;
  };
  const box = (width: number, height: number, depth: number, material: THREE.Material, parent: THREE.Object3D, x: number, y: number, z: number) => {
    const object = mesh(new THREE.BoxGeometry(width, height, depth), material, parent);
    object.position.set(x, y, z);
    return object;
  };
  const beam = (length: number, radius: number, parent: THREE.Object3D) => {
    const shape = new THREE.Shape();
    shape.moveTo(0, -radius);
    shape.lineTo(length, -radius);
    shape.absarc(length, 0, radius, -Math.PI/2, Math.PI/2, false);
    shape.lineTo(0, radius);
    shape.absarc(0, 0, radius, Math.PI/2, Math.PI*1.5, false);
    const hole = new THREE.Path();
    hole.moveTo(70, -9);
    hole.absarc(70, 0, 9, -Math.PI/2, -Math.PI*1.5, true);
    hole.lineTo(length-70, 9);
    hole.absarc(length-70, 0, 9, Math.PI/2, -Math.PI/2, true);
    hole.lineTo(70, -9);
    shape.holes.push(hole);
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: 18, bevelEnabled: true, bevelSize: 2, bevelThickness: 2, bevelSegments: 2, curveSegments: 20, steps: 1 });
    const object = mesh(geometry, [metal, side], parent);
    object.position.z = -10;
  };
  const diskGeometry = new THREE.CylinderGeometry(1, 1, 1, 48);
  diskGeometry.rotateX(Math.PI/2);
  const torusGeometry = new THREE.TorusGeometry(1, .055, 8, 48);
  const boltGeometry = new THREE.CylinderGeometry(2.4, 2.4, 2, 6);
  boltGeometry.rotateX(Math.PI/2);
  geometries.add(boltGeometry);
  const bearing = (parent: THREE.Object3D, radius: number) => {
    const outer = mesh(diskGeometry, side, parent);
    outer.scale.set(radius, radius, 14);
    outer.position.z = 13;
    const face = mesh(diskGeometry, rim, parent);
    face.scale.set(radius-3, radius-3, 3);
    face.position.z = 22;
    const darkFace = mesh(diskGeometry, inset, parent);
    darkFace.scale.set(radius-10, radius-10, 4);
    darkFace.position.z = 25;
    const copper = mesh(torusGeometry, brass, parent);
    copper.scale.setScalar(radius-13);
    copper.position.z = 29;
    const spindle = mesh(diskGeometry, metal, parent);
    spindle.scale.set(radius-20, radius-20, 4);
    spindle.position.z = 28;
    const bolts = new THREE.InstancedMesh(boltGeometry, inset, 4);
    const matrix = new THREE.Matrix4();
    for (let index=0; index<4; index++) {
      const angle = Math.PI/4+index*Math.PI/2;
      matrix.makeTranslation(Math.cos(angle)*(radius-5), Math.sin(angle)*(radius-5), 25);
      bolts.setMatrixAt(index, matrix);
    }
    parent.add(bolts);
  };
  const upper = new THREE.Group();
  upper.position.set(LINKAGE_BASE.x, -LINKAGE_BASE.y, 0);
  scene.add(upper);
  beam(LINKAGE.first, 28, upper);
  bearing(upper, 39);
  const lower = new THREE.Group();
  lower.position.x = LINKAGE.first;
  upper.add(lower);
  beam(LINKAGE.second, 23, lower);
  bearing(lower, 38);
  const tool = new THREE.Group();
  tool.position.x = LINKAGE.second;
  lower.add(tool);
  bearing(tool, 25);
  box(38, 26, 15, metal, tool, 38, 0, 10);
  for (const sign of [-1, 1]) {
    const finger = box(31, 8, 14, rim, tool, 65, sign*17, 12);
    finger.rotation.z = sign*.35;
    box(23, 8, 14, rim, tool, 88, sign*22, 12);
  }
  box(100, 16, 40, side, scene, 260, -548, -2);
  box(75, 22, 30, metal, scene, 260, -530, 0);
  box(36, 35, 30, side, scene, 260, -502, 0);

  let disposed = false;
  const resize = () => {
    if (disposed) return;
    const { width, height } = host.getBoundingClientRect();
    if (width > 0 && height > 0) renderer.setSize(width, height, false);
  };
  const render = (pose: Pose) => {
    if (disposed) return;
    upper.rotation.z = pose.shoulder;
    lower.rotation.z = pose.elbow;
    renderer.render(scene, camera);
  };
  const onContextLost = (event: Event) => { event.preventDefault(); onLost(); };
  canvas.addEventListener('webglcontextlost', onContextLost);
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    canvas.removeEventListener('webglcontextlost', onContextLost);
    scene.traverse(object => { if (object instanceof THREE.InstancedMesh) object.dispose(); });
    geometries.forEach(geometry => geometry.dispose());
    [metal, side, rim, inset, brass].forEach(material => material.dispose());
    environment.dispose();
    renderer.dispose();
    canvas.remove();
  };
  resize();
  render(LINKAGE.initial);
  host.prepend(canvas);
  return { render, resize, dispose };
}
