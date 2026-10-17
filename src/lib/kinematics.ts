/** Planar two-revolute-joint kinematics. Lengths are drawing units, not hardware dimensions. */
export interface Point { x: number; y: number; }
export interface Pose { shoulder: number; elbow: number; }
export const radians = (degrees: number) => degrees * Math.PI / 180;
export const degrees = (angle: number) => angle * 180 / Math.PI;
export const LINKAGE = Object.freeze({
  first: 366,
  second: 345,
  // Deliberate fixture travel limits keep this illustrative study within its drawing field.
  shoulder: Object.freeze({ min: radians(40), max: radians(65) }),
  elbow: Object.freeze({ min: radians(-95), max: radians(-45) }),
  initial: Object.freeze({ shoulder: radians(55), elbow: radians(-71.86) }),
});
export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function constrainPose(pose: Pose): Pose {
  if (!Number.isFinite(pose.shoulder) || !Number.isFinite(pose.elbow)) throw new RangeError('Joint angles must be finite.');
  return { shoulder: clamp(pose.shoulder, LINKAGE.shoulder.min, LINKAGE.shoulder.max), elbow: clamp(pose.elbow, LINKAGE.elbow.min, LINKAGE.elbow.max) };
}

export function forwardKinematics(pose: Pose) {
  const joint = { x: LINKAGE.first * Math.cos(pose.shoulder), y: LINKAGE.first * Math.sin(pose.shoulder) };
  const tool = { x: joint.x + LINKAGE.second * Math.cos(pose.shoulder + pose.elbow), y: joint.y + LINKAGE.second * Math.sin(pose.shoulder + pose.elbow) };
  return { joint, tool };
}

/** Exact closest position in the joint-limited workspace, not an arbitrary radial clamp.
 * An interior solution is analytical IK. A constrained optimum must lie on one of
 * the four joint-limit edges; each edge is a circular arc with an analytic optimum.
 * Edge endpoints include all four corners. This branch excludes singular elbows.
 */
export function inverseKinematics(target: Point): { pose: Pose; achieved: Point; limited: boolean; error: number } {
  if (!Number.isFinite(target.x) || !Number.isFinite(target.y)) throw new RangeError('Target coordinates must be finite.');
  const candidates: Pose[] = [];
  const add = (shoulder: number, elbow: number) => candidates.push(constrainPose({ shoulder, elbow }));
  const periodic = (angle: number) => [-2, -1, 0, 1, 2].map(turn => angle + turn * Math.PI * 2);
  const cosine = (target.x ** 2 + target.y ** 2 - LINKAGE.first ** 2 - LINKAGE.second ** 2) / (2 * LINKAGE.first * LINKAGE.second);
  if (cosine >= -1 && cosine <= 1) {
    const elbow = -Math.acos(clamp(cosine, -1, 1));
    const shoulder = Math.atan2(target.y, target.x) - Math.atan2(LINKAGE.second * Math.sin(elbow), LINKAGE.first + LINKAGE.second * Math.cos(elbow));
    for (const angle of periodic(shoulder)) add(angle, elbow);
  }
  for (const shoulder of [LINKAGE.shoulder.min, LINKAGE.shoulder.max]) {
    const joint = forwardKinematics({ shoulder, elbow: 0 }).joint;
    const angle = Math.atan2(target.y - joint.y, target.x - joint.x) - shoulder;
    for (const elbow of periodic(angle)) add(shoulder, elbow);
  }
  for (const elbow of [LINKAGE.elbow.min, LINKAGE.elbow.max]) {
    const offset = Math.atan2(LINKAGE.second * Math.sin(elbow), LINKAGE.first + LINKAGE.second * Math.cos(elbow));
    for (const shoulder of periodic(Math.atan2(target.y, target.x) - offset)) add(shoulder, elbow);
  }
  let pose = candidates[0];
  let squaredError = Infinity;
  for (const candidate of candidates) {
    const position = forwardKinematics(candidate).tool;
    const error = (position.x - target.x) ** 2 + (position.y - target.y) ** 2;
    if (error < squaredError) { squaredError = error; pose = candidate; }
  }
  const achieved = forwardKinematics(pose).tool;
  const error = Math.sqrt(squaredError);
  return { pose, achieved, error, limited: error > .01 };
}

/** Interpolate angles, not independent endpoints: rigid lengths remain invariant. */
export function approachPose(current: Pose, target: Pose, delta: number): Pose {
  const amount = 1 - Math.exp(-18 * clamp(delta, 0, .05));
  return { shoulder: current.shoulder + (target.shoulder - current.shoulder) * amount, elbow: current.elbow + (target.elbow - current.elbow) * amount };
}
