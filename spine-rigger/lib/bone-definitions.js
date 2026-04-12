// Default Spine bone hierarchy
// Each bone: { name, parent, landmarkIndex (MediaPipe), defaultOffset }
// MediaPipe Pose landmarks: https://developers.google.com/mediapipe/solutions/vision/pose_landmarker

export const BONE_HIERARCHY = [
  { name: 'root', parent: null, landmark: null },
  { name: 'hip', parent: 'root', landmark: null }, // derived: midpoint of 23,24
  { name: 'spine', parent: 'hip', landmark: null }, // derived: 1/3 between hip and chest
  { name: 'chest', parent: 'spine', landmark: null }, // derived: midpoint of 11,12
  { name: 'neck', parent: 'chest', landmark: null }, // derived: midpoint of 11,12 shifted up
  { name: 'head', parent: 'neck', landmark: 0 },
  { name: 'left_shoulder', parent: 'chest', landmark: 11 },
  { name: 'left_upper_arm', parent: 'left_shoulder', landmark: 13 },
  { name: 'left_forearm', parent: 'left_upper_arm', landmark: 15 },
  { name: 'right_shoulder', parent: 'chest', landmark: 12 },
  { name: 'right_upper_arm', parent: 'right_shoulder', landmark: 14 },
  { name: 'right_forearm', parent: 'right_upper_arm', landmark: 16 },
  { name: 'left_thigh', parent: 'hip', landmark: 23 },
  { name: 'left_leg', parent: 'left_thigh', landmark: 25 },
  { name: 'left_foot', parent: 'left_leg', landmark: 27 },
  { name: 'right_thigh', parent: 'hip', landmark: 24 },
  { name: 'right_leg', parent: 'right_thigh', landmark: 26 },
  { name: 'right_foot', parent: 'right_leg', landmark: 28 },
];

// Colors for bone visualization
export const BONE_COLORS = {
  root: '#888888',
  hip: '#FF6B6B',
  spine: '#FF9F43',
  chest: '#FECA57',
  neck: '#48DBFB',
  head: '#FF6348',
  left_shoulder: '#1DD1A1', left_upper_arm: '#10AC84', left_forearm: '#0A8967',
  right_shoulder: '#5F27CD', right_upper_arm: '#341F97', right_forearm: '#2C1A7A',
  left_thigh: '#54A0FF', left_leg: '#2E86DE', left_foot: '#1B6CB0',
  right_thigh: '#FF9FF3', right_leg: '#F368E0', right_foot: '#C44DBE',
};

// Convert MediaPipe landmarks (normalized 0-1) to pixel coordinates
export function landmarksToPixels(landmarks, width, height) {
  if (!landmarks || !landmarks.length) return null;

  const lm = landmarks;
  const px = (i) => lm[i] ? { x: lm[i].x * width, y: lm[i].y * height } : null;

  // Derived points
  const leftHip = px(23);
  const rightHip = px(24);
  const leftShoulder = px(11);
  const rightShoulder = px(12);

  const hip = leftHip && rightHip
    ? { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 }
    : null;

  const chest = leftShoulder && rightShoulder
    ? { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 }
    : null;

  const spine = hip && chest
    ? { x: (hip.x * 2 + chest.x) / 3, y: (hip.y * 2 + chest.y) / 3 }
    : null;

  const neck = chest
    ? { x: chest.x, y: chest.y - (chest.y - (px(0)?.y || chest.y)) * 0.3 }
    : null;

  const positions = {};
  for (const bone of BONE_HIERARCHY) {
    if (bone.name === 'root') {
      positions.root = hip || { x: width / 2, y: height * 0.6 };
    } else if (bone.name === 'hip') {
      positions.hip = hip || { x: width / 2, y: height * 0.55 };
    } else if (bone.name === 'spine') {
      positions.spine = spine || { x: width / 2, y: height * 0.45 };
    } else if (bone.name === 'chest') {
      positions.chest = chest || { x: width / 2, y: height * 0.35 };
    } else if (bone.name === 'neck') {
      positions.neck = neck || { x: width / 2, y: height * 0.28 };
    } else if (bone.landmark !== null) {
      const p = px(bone.landmark);
      if (p) positions[bone.name] = p;
    }
  }

  return positions;
}

// Generate default positions when no detection available
export function defaultPositions(width, height) {
  const cx = width / 2;
  return {
    root: { x: cx, y: height * 0.58 },
    hip: { x: cx, y: height * 0.55 },
    spine: { x: cx, y: height * 0.45 },
    chest: { x: cx, y: height * 0.35 },
    neck: { x: cx, y: height * 0.27 },
    head: { x: cx, y: height * 0.15 },
    left_shoulder: { x: cx - width * 0.12, y: height * 0.33 },
    left_upper_arm: { x: cx - width * 0.2, y: height * 0.42 },
    left_forearm: { x: cx - width * 0.22, y: height * 0.52 },
    right_shoulder: { x: cx + width * 0.12, y: height * 0.33 },
    right_upper_arm: { x: cx + width * 0.2, y: height * 0.42 },
    right_forearm: { x: cx + width * 0.22, y: height * 0.52 },
    left_thigh: { x: cx - width * 0.07, y: height * 0.65 },
    left_leg: { x: cx - width * 0.08, y: height * 0.78 },
    left_foot: { x: cx - width * 0.09, y: height * 0.9 },
    right_thigh: { x: cx + width * 0.07, y: height * 0.65 },
    right_leg: { x: cx + width * 0.08, y: height * 0.78 },
    right_foot: { x: cx + width * 0.09, y: height * 0.9 },
  };
}
