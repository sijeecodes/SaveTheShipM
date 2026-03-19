import * as THREE from 'three';

export class AnimationManager {
  constructor(model) {
    this.model = model;
    this.mixer = null;
    this.animations = new Map();
    this.activeAction = null;

    if (model) {
      this.mixer = new THREE.AnimationMixer(model);
    }
  }

  addAnimation(name, clip) {
    if (clip && this.mixer) {
      this.animations.set(name, clip);
    }
  }

  playAnimationWithBlend(name, duration = 0.5, loop = true) {
    if (!this.animations.has(name) || !this.mixer) return;

    const clip = this.animations.get(name);
    const newAction = this.mixer.clipAction(clip);

    newAction.reset();
    newAction.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
    newAction.clampWhenFinished = !loop;
    newAction.enabled = true;

    if (this.activeAction && this.activeAction !== newAction) {
      newAction.play();
      this.activeAction.crossFadeTo(newAction, duration, false);
    } else {
      newAction.play();
    }

    this.activeAction = newAction;
  }

  update(deltaTime = 0.016) {
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }
  }

  dispose() {
    if (this.mixer) {
      this.mixer.uncacheRoot(this.model);
    }
  }
}
