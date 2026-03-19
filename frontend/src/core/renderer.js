import * as THREE from 'three';
import { isMobile } from '../input/mobileDetect.js';

/**
 * Creates and configures the WebGL renderer, appends it to #gameContainer.
 * Canvas is sized to fill the container.
 */
export function createRenderer() {
  const container = document.getElementById('gameContainer');
  const mobile = isMobile();

  const renderer = new THREE.WebGLRenderer({
    antialias: false,
    powerPreference: 'high-performance'
  });

  const width = mobile ? window.innerWidth : (container.clientWidth || window.innerWidth - 320);
  const height = mobile ? window.innerHeight : (container.clientHeight || window.innerHeight - 100);
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = !mobile;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setPixelRatio(mobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2));

  container.appendChild(renderer.domElement);
  return renderer;
}
