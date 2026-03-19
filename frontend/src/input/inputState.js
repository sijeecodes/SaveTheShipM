/**
 * Centralized input state tracker.
 * Stores keyboard and pointer lock state for the entire app.
 */
export class InputState {
  constructor() {
    this.keys = {};
    this.isPointerLocked = false;
  }

  getKeys() {
    return this.keys;
  }

  reset() {
    this.keys = {};
    this.isPointerLocked = false;
  }
}
