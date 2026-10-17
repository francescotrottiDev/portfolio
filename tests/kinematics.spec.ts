import { expect, test } from '@playwright/test';
import { LINKAGE, approachPose, constrainPose, degrees, forwardKinematics, inverseKinematics, radians } from '../src/lib/kinematics';
import { DRAWING_FIELD, mechanismBounds } from '../src/lib/linkage-view';

test('the entire mechanism silhouette has padding across fixture travel in both renderers', () => {
  for (let shoulder=40; shoulder<=65; shoulder+=.5) for (let elbow=-95; elbow<=-45; elbow+=.5) {
    const box = mechanismBounds({shoulder:radians(shoulder),elbow:radians(elbow)});
    expect(box.left).toBeGreaterThanOrEqual(DRAWING_FIELD.x+16);
    expect(box.right).toBeLessThanOrEqual(DRAWING_FIELD.x+DRAWING_FIELD.width-16);
    expect(box.top).toBeGreaterThanOrEqual(DRAWING_FIELD.y+16);
    expect(box.bottom).toBeLessThanOrEqual(DRAWING_FIELD.y+DRAWING_FIELD.height-16);
  }
});

test('forward kinematics preserves both rigid link lengths across the full fixture range', () => {
  for (let shoulder = 40; shoulder <= 65; shoulder += 1) {
    for (let elbow = -95; elbow <= -45; elbow += 1) {
      const points = forwardKinematics({ shoulder: radians(shoulder), elbow: radians(elbow) });
      expect(Math.hypot(points.joint.x, points.joint.y)).toBeCloseTo(LINKAGE.first, 9);
      expect(Math.hypot(points.tool.x-points.joint.x, points.tool.y-points.joint.y)).toBeCloseTo(LINKAGE.second, 9);
    }
  }
});

test('analytical inverse kinematics round-trips reachable targets including all boundaries', () => {
  for (let shoulder = 40; shoulder <= 65; shoulder += 2.5) {
    for (let elbow = -95; elbow <= -45; elbow += 2.5) {
      const original = { shoulder: radians(shoulder), elbow: radians(elbow) };
      const target = forwardKinematics(original).tool;
      const solved = inverseKinematics(target);
      expect(solved.error).toBeLessThan(.000001);
      expect(solved.limited).toBe(false);
      expect(degrees(solved.pose.shoulder)).toBeCloseTo(shoulder, 7);
      expect(degrees(solved.pose.elbow)).toBeCloseTo(elbow, 7);
    }
  }
});

test('unreachable targets use the nearest feasible boundary pose, verified against a dense grid', () => {
  const targets = [{x:0,y:0}, {x:2000,y:0}, {x:-2000,y:-1000}, {x:200,y:800}, {x:600,y:-300}, {x:600,y:500}, {x:-100,y:0}, {x:400,y:280}];
  for (const target of targets) {
    const solved = inverseKinematics(target);
    expect(solved.pose.shoulder).toBeGreaterThanOrEqual(LINKAGE.shoulder.min);
    expect(solved.pose.shoulder).toBeLessThanOrEqual(LINKAGE.shoulder.max);
    expect(solved.pose.elbow).toBeGreaterThanOrEqual(LINKAGE.elbow.min);
    expect(solved.pose.elbow).toBeLessThanOrEqual(LINKAGE.elbow.max);
    let sampledBest = Infinity;
    for (let shoulder=40; shoulder<=65; shoulder+=.25) {
      for (let elbow=-95; elbow<=-45; elbow+=.25) {
        const position = forwardKinematics({ shoulder:radians(shoulder), elbow:radians(elbow) }).tool;
        sampledBest = Math.min(sampledBest, Math.hypot(position.x-target.x, position.y-target.y));
      }
    }
    expect(solved.error).toBeLessThanOrEqual(sampledBest+.000001);
    expect(Math.abs(Math.hypot(solved.achieved.x-target.x, solved.achieved.y-target.y)-solved.error)).toBeLessThan(.000001);
  }
});

test('angle interpolation remains bounded and keeps rigid geometry at every frame', () => {
  let current = { shoulder: LINKAGE.shoulder.min, elbow: LINKAGE.elbow.min };
  const target = { shoulder: LINKAGE.shoulder.max, elbow: LINKAGE.elbow.max };
  for (let frame=0; frame<120; frame++) {
    current = approachPose(current, target, 1/60);
    expect(constrainPose(current)).toEqual(current);
    const { joint, tool } = forwardKinematics(current);
    expect(Math.hypot(tool.x-joint.x, tool.y-joint.y)).toBeCloseTo(LINKAGE.second, 9);
  }
  expect(current.shoulder).toBeCloseTo(target.shoulder, 8);
  expect(current.elbow).toBeCloseTo(target.elbow, 8);
});

test('non-finite inputs are rejected and extreme joint inputs cannot exceed travel', () => {
  expect(() => inverseKinematics({x:NaN,y:0})).toThrow(RangeError);
  expect(() => inverseKinematics({x:0,y:Infinity})).toThrow(RangeError);
  expect(() => constrainPose({shoulder:Infinity,elbow:0})).toThrow(RangeError);
  expect(constrainPose({shoulder:1000,elbow:-1000})).toEqual({shoulder:LINKAGE.shoulder.max,elbow:LINKAGE.elbow.min});
});
