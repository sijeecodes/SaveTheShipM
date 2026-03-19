import * as THREE from 'three';

/**
 * FPS-style camera that follows the character from a fixed offset.
 * Mouse/pointer events are handled by EventManager.
 */
export class FPSCamera {
  constructor(camera, character) {
    this.camera = camera;
    this.character = character;

    this.pitch = 0;
    this.mouseSensitivity = 0.003;

    // Reusable vectors
    this._cameraOffset = new THREE.Vector3();
    this._cameraTarget = new THREE.Vector3();
    this._lookAtTarget = new THREE.Vector3();

    this.updateCamera();
  }

  update() {
    this.updateCamera();
  }

  updateCamera() {
    const cameraDistance = 9;
    const cameraHeight = 18;

    const characterPos = this.character.getPosition();
    const characterYaw = this.character.getYaw();

    this._cameraOffset.set(
      -Math.sin(characterYaw) * cameraDistance,
      cameraHeight,
      -Math.cos(characterYaw) * cameraDistance
    );

    this._cameraTarget.copy(characterPos).add(this._cameraOffset);
    this.camera.position.copy(this._cameraTarget);

    this._lookAtTarget.copy(characterPos);
    this._lookAtTarget.y += 14;
    this.camera.lookAt(this._lookAtTarget);
  }

  getPosition() {
    return this.character.getPosition().clone();
  }

  getYaw() {
    return this.character.getYaw();
  }

  getDirection() {
    const yaw = this.character.getYaw();
    return new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  }
}
