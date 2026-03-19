import * as THREE from 'three';

const PLAYER_COLORS = [
  0x000000, 0x8B00FF, 0xFF0000, 0x00FF00,
  0xFFFF00, 0x0000FF, 0xFFFFFF, 0xFFA500
];

export function generateRandomColor() {
  return PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)];
}

/**
 * Color the player model by bone influence (targets torso/shoulders).
 */
export function applyPlayerColor(model, color) {
  model.traverse((child) => {
    if (child.isMesh && child.material && child.skeleton) {
      colorByBoneInfluence(child, ['spine', 'shoulder'], color);
    }
  });
}

function colorByBoneInfluence(mesh, bonePatterns, color) {
  const { geometry, skeleton } = mesh;
  if (!skeleton?.bones || !geometry.attributes.skinIndex) return;

  // Find bone indices matching the patterns
  const boneIndices = new Set();
  skeleton.bones.forEach((bone, idx) => {
    const name = bone.name.toLowerCase();
    if (bonePatterns.some(p => name.includes(p.toLowerCase()))) {
      boneIndices.add(idx);
    }
  });

  // Initialize vertex colors if missing
  if (!geometry.attributes.color) {
    const colors = new Float32Array(geometry.attributes.position.count * 3);
    colors.fill(1);
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  }

  const vertexColors = geometry.attributes.color.array;
  const skinIndex = geometry.attributes.skinIndex.array;
  const skinWeight = geometry.attributes.skinWeight.array;
  const { r, g, b } = new THREE.Color(color);

  // Blend color based on bone influence per vertex
  for (let i = 0; i < skinIndex.length; i += 4) {
    let influence = 0;
    for (let j = 0; j < 4; j++) {
      if (boneIndices.has(skinIndex[i + j])) {
        influence += skinWeight[i + j];
      }
    }

    if (influence > 0.1) {
      const ci = Math.floor(i / 4) * 3;
      const inv = 1 - influence;
      vertexColors[ci] = r * influence + vertexColors[ci] * inv;
      vertexColors[ci + 1] = g * influence + vertexColors[ci + 1] * inv;
      vertexColors[ci + 2] = b * influence + vertexColors[ci + 2] * inv;
    }
  }

  geometry.attributes.color.needsUpdate = true;
  mesh.material.vertexColors = true;
  mesh.material.needsUpdate = true;
}
