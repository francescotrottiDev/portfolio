import { forwardKinematics, type Point, type Pose } from './kinematics';

/** One drawing field shared by the SVG, camera, pointer mapping, and silhouette tests. */
export const DRAWING_FIELD = Object.freeze({ x: -20, y: -52, width: 1040, height: 712 });
export const LINKAGE_BASE = Object.freeze({ x: 260, y: 480 });

/** Conservative silhouette envelope for BOTH authored renderers, including tool fingers.
 * 40-unit circles contain link capsules, bearing faces and bolts. The tool rectangle
 * contains every SVG finger and Three box after its local finger rotation. The fixed
 * mounting plate and SVG ground line are included, not just moving joint centers.
 */
export function mechanismBounds(pose: Pose) {
  const { joint, tool } = forwardKinematics(pose);
  const points: Point[] = [{x:154,y:559},{x:366,y:559}];
  const screen = (point: Point) => ({x:LINKAGE_BASE.x+point.x,y:LINKAGE_BASE.y-point.y});
  for (const [point, radius] of [[{x:0,y:0},40],[joint,40],[tool,26]] as const) {
    const center = screen(point);
    points.push({x:center.x-radius,y:center.y-radius},{x:center.x+radius,y:center.y+radius});
  }
  const angle = pose.shoulder+pose.elbow;
  for (const x of [20,101]) for (const y of [-28,28]) {
    points.push(screen({x:tool.x+x*Math.cos(angle)-y*Math.sin(angle),y:tool.y+x*Math.sin(angle)+y*Math.cos(angle)}));
  }
  return {left:Math.min(...points.map(point=>point.x)),right:Math.max(...points.map(point=>point.x)),top:Math.min(...points.map(point=>point.y)),bottom:Math.max(...points.map(point=>point.y))};
}
