import * as THREE from 'three';

/**
 * Create a spotlight + target pair for a remote player.
 */
export function createPlayerSpotlight() {
  const spotlight = new THREE.SpotLight(
    0xffffff, 6, 200, Math.PI / 3, 0.3, 0.1
  );
  spotlight.castShadow = false;
  const target = new THREE.Object3D();
  spotlight.target = target;
  return { spotlight, target };
}

/**
 * Position and aim a player's spotlight based on character yaw.
 */
export function updateSpotlightForPlayer(spotlight, target, x, y, z, yaw) {
  const forwardDistance = -1;
  const heightOffset = 10;
  const forwardX = x - Math.sin(yaw) * forwardDistance;
  const forwardZ = z - Math.cos(yaw) * forwardDistance;
  spotlight.position.set(forwardX, y + heightOffset, forwardZ);

  const angleOffset = Math.PI; // 180°
  const targetYaw = yaw + angleOffset;
  const targetDistance = 50;
  const downwardAngle = Math.PI / 12;
  const horizontalDist = targetDistance * Math.cos(downwardAngle);
  const verticalDrop = targetDistance * Math.sin(downwardAngle);
  const targetX = x - Math.sin(targetYaw) * horizontalDist;
  const targetZ = z - Math.cos(targetYaw) * horizontalDist;
  target.position.set(targetX, y - verticalDrop, targetZ);
}
