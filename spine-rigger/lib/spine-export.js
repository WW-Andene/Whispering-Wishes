import { BONE_HIERARCHY } from './bone-definitions';

/**
 * Generate a Spine JSON skeleton from bone positions.
 * Spine uses local coordinates relative to parent bone.
 * Y-axis in Spine is UP (positive), but in screen coords it's DOWN.
 * We flip Y during export.
 */
export function generateSpineJSON(bonePositions, imageWidth, imageHeight, imageName = 'sprite') {
  // Convert screen coords to Spine coords (flip Y, origin at bottom-center)
  const toSpine = (screenPos) => ({
    x: screenPos.x - imageWidth / 2,
    y: imageHeight - screenPos.y, // flip Y
  });

  // Build bones array with local coordinates
  const bones = [];
  const spinePositions = {};

  for (const boneDef of BONE_HIERARCHY) {
    const screenPos = bonePositions[boneDef.name];
    if (!screenPos) continue;

    const worldPos = toSpine(screenPos);
    spinePositions[boneDef.name] = worldPos;

    if (!boneDef.parent) {
      // Root bone - world position
      bones.push({
        name: boneDef.name,
        x: worldPos.x,
        y: worldPos.y,
      });
    } else {
      const parentWorld = spinePositions[boneDef.parent];
      if (!parentWorld) continue;

      // Local offset from parent
      const localX = worldPos.x - parentWorld.x;
      const localY = worldPos.y - parentWorld.y;

      // Calculate bone length (distance to parent)
      const length = Math.sqrt(localX * localX + localY * localY);

      // Calculate rotation (angle from parent to this bone)
      const rotation = Math.atan2(localY, localX) * (180 / Math.PI);

      bones.push({
        name: boneDef.name,
        parent: boneDef.parent,
        length: Math.round(length * 100) / 100,
        rotation: Math.round(rotation * 100) / 100,
        x: Math.round(localX * 100) / 100,
        y: Math.round(localY * 100) / 100,
      });
    }
  }

  // Build slots (one per bone for potential mesh attachment)
  const slots = bones
    .filter(b => b.name !== 'root')
    .map(b => ({
      name: b.name,
      bone: b.name,
      attachment: null,
    }));

  // Build the Spine JSON
  const spineData = {
    skeleton: {
      hash: generateHash(),
      spine: '4.1',
      x: -imageWidth / 2,
      y: 0,
      width: imageWidth,
      height: imageHeight,
      images: './images/',
      audio: '',
    },
    bones,
    slots,
    skins: [
      {
        name: 'default',
        attachments: {},
      },
    ],
    events: {},
    animations: {
      idle: {
        bones: {},
      },
    },
  };

  return spineData;
}

/**
 * Generate Spine project structure info
 */
export function generateProjectInfo(imageName, imageWidth, imageHeight) {
  return {
    note: 'Place your sprite in the images/ folder relative to the .json file',
    structure: [
      `${imageName}.json    (this file)`,
      `images/`,
      `  ${imageName}.png  (your sprite)`,
    ],
    importInstructions: [
      '1. Open Spine Editor',
      '2. File → Import Data → select the .json file',
      '3. The skeleton will load with bones positioned',
      '4. Add mesh attachments to bones as needed',
      '5. Create animations by keying bone transforms',
    ],
  };
}

function generateHash() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let hash = '';
  for (let i = 0; i < 8; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

/**
 * Download JSON as file
 */
export function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
