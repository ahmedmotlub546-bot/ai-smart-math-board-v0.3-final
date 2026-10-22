// Pure geometry + measurement-mark builders for each solid. Coordinates are centred on the origin.
import * as THREE from "three";

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const SEG = 64;

export const builders = {
  cube(d) {
    const a = d.a, h = a / 2;
    const geometry = new THREE.BoxGeometry(a, a, a);
    // Full cube, pyramid, cone, cylinder, sphere builders from the source zip
    return { geometry, edgeThreshold: 20, bottom: -h };
  }
  // ... other builders
};
