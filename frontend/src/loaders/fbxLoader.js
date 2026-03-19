import * as THREE from 'three';
import { FBXLoader as ThreeFBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export class FBXLoader extends ThreeFBXLoader {
  constructor(manager) {
    super(manager);
  }
}
