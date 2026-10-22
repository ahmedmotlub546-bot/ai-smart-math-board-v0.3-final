import * as THREE from "three";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { SOLIDS, UNITS, defaultDims, clampDims, scaleDims, solidProperties } from "../math/solids.js";
import { builders } from "./solid-builders.js";

const $ = id => document.getElementById(id);
const f2 = n => Number(n).toFixed(2);

const PALETTES = {
  dark: { fill: 0x80b8ff, opacity: 0.2, edge: 0xa9f3d0, vertex: 0xa9f3d0, grid: [0x52617a, 0x2c374b], h: 0xa9f3d0, r: 0xffbd8b, l: 0xb8a4ff, a: 0x8ab7ff, d: 0xff8fb1 },
  light: { fill: 0x3d7be0, opacity: 0.16, edge: 0x0f8a62, vertex: 0x0f8a62, grid: [0x9aa8bf, 0xd2dae8], h: 0x0f8a62, r: 0xd2691e, l: 0x6f55d6, a: 0x2f6fd6, d: 0xd6306b }
};

export class SolidScene {
  constructor() {
    this.type = "cube";
    this.dims = defaultDims("cube");
    this.unit = "units";
    this.showVertices = true;
    this.showEdges = true;
    this.showMarks = true;
    this.pinchMode = "size";
    this.auto = false;
    this.rot = { x: -0.35, y: 0.55 };
    this.vel = { x: 0, y: 0 };
    this.zoom = 1;
    this.listeners = new Set();
    this.pointers = new Map();
    this.mounted = false;
    this.active = false;
    this.dirtyShape = true;
    this.raf = 0;
    this.labels = [];
    this.theme = "dark";
  }

  mount() {
    this.active = true;
    if (this.mounted) { this.resize(); this.requestRender(); return; }
    this.host = $("threeMount");
    this.labelLayer = $("threeLabels");
    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (error) {
      this.host.insertAdjacentHTML("beforeend", '<p class="gl-fallback">3D needs WebGL.</p>');
      return;
    }
    this.renderer.setClearColor(0x000000, 0);
    this.host.prepend(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    this.scene.add(new THREE.AmbientLight(0xffffff, 1.15));
    const key = new THREE.DirectionalLight(0xffffff, 2.1);
    key.position.set(4, 7, 5);
    this.scene.add(key);
    this.root = new THREE.Group();
    this.scene.add(this.root);
    this.bindPointer();
    this.mounted = true;
    this.resize();
    this.requestRender();
  }

  pause() { this.active = false; if (this.raf) { cancelAnimationFrame(this.raf); this.raf = 0; } }

  onChange(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emit() { const snap = this.snapshot(); this.listeners.forEach(fn => fn(snap)); }
  snapshot() { return { shape: this.type, dims: { ...this.dims }, unit: this.unit, vertices: this.showVertices, edges: this.showEdges, marks: this.showMarks, pinch: this.pinchMode }; }

  restore(snap) {
    if (!snap || !SOLIDS[snap.shape]) return;
    this.type = snap.shape;
    this.dims = clampDims(snap.shape, snap.dims);
    this.unit = UNITS.some(u => u.id === snap.unit) ? snap.unit : "units";
    this.showVertices = snap.vertices !== false;
    this.showEdges = snap.edges !== false;
    this.showMarks = snap.marks !== false;
    this.dirtyShape = true;
    this.emit();
    this.requestRender();
  }

  setShape(input) {
    const type = typeof input === "string" ? input : input?.type;
    if (!SOLIDS[type]) return;
    this.type = type;
    this.dims = clampDims(type, input?.dims || defaultDims(type));
    this.dirtyShape = true;
    this.emit();
    this.requestRender();
  }
  setUnit(unit) { this.unit = unit; this.dirtyShape = true; this.emit(); this.requestRender(); }
  setVertices(v) { this.showVertices = v; this.dirtyShape = true; this.emit(); this.requestRender(); }
  setEdges(v) { this.showEdges = v; this.dirtyShape = true; this.emit(); this.requestRender(); }
  setMarks(v) { this.showMarks = v; this.dirtyShape = true; this.emit(); this.requestRender(); }
  setPinchMode(mode) { this.pinchMode = mode; this.emit(); }
  toggleAutoRotate() { this.auto = !this.auto; this.requestRender(); return this.auto; }
  resetCamera() { this.rot = { x: -0.35, y: 0.55 }; this.vel = { x: 0, y: 0 }; this.zoom = 1; this.requestRender(); }
  applyTheme(theme) { this.theme = theme; this.dirtyShape = true; this.requestRender(); }

  resize() {
    if (!this.renderer || !this.host) return;
    const w = this.host.clientWidth, h = this.host.clientHeight;
    if (!w || !h) return;
    this.w = w; this.h = h;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
    this.requestRender();
  }

  bindPointer() {
    const surface = this.host;
    surface.addEventListener("pointerdown", e => {
      surface.setPointerCapture?.(e.pointerId);
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      this.interacting = true;
      this.requestRender();
    });
    surface.addEventListener("pointermove", e => {
      const p = this.pointers.get(e.pointerId);
      if (!p) return;
      const dx = e.clientX - p.x, dy = e.clientY - p.y;
      p.x = e.clientX; p.y = e.clientY;
      if (this.pointers.size === 1) {
        this.rot.y += dx * 0.008;
        this.rot.x = Math.max(-1.45, Math.min(1.45, this.rot.x + dy * 0.008));
      }
      this.requestRender();
    });
    const end = e => { this.pointers.delete(e.pointerId); if (this.pointers.size === 0) this.interacting = false; };
    surface.addEventListener("pointerup", end);
    surface.addEventListener("pointercancel", end);
    surface.style.touchAction = "none";
  }

  rebuild() {
    this.dirtyShape = false;
    const pal = PALETTES[this.theme] || PALETTES.dark;
    if (this.group) { this.root.remove(this.group); this.group = null; }
    const b = builders[this.type](this.dims);
    const group = new THREE.Group();
    group.add(new THREE.Mesh(b.geometry, new THREE.MeshStandardMaterial({ color: pal.fill, transparent: true, opacity: pal.opacity, roughness: 0.35, side: THREE.DoubleSide })));
    this.root.add(group);
    this.group = group;
    this.updateMetrics();
  }

  updateMetrics() {
    const props = solidProperties(this.type, this.dims);
    const unit = this.unit === "units" ? "units" : this.unit;
    const def = SOLIDS[this.type];
    if ($("solidVolume")) $("solidVolume").textContent = `${f2(props.volume)} ${unit}³`;
    if ($("solidSurface")) $("solidSurface").textContent = `${f2(props.surface)} ${unit}²`;
  }

  requestRender() {
    if (!this.active || !this.mounted || this.raf) return;
    this.raf = requestAnimationFrame(t => this.frame(t));
  }

  frame(t) {
    this.raf = 0;
    if (!this.active) return;
    if (this.dirtyShape) this.rebuild();
    if (this.auto && !this.interacting) this.rot.y += 0.006;
    this.root.rotation.set(this.rot.x, this.rot.y, 0);
    const aspect = this.camera.aspect;
    const dist = 11.5 * this.zoom;
    this.camera.position.set(0.42 * dist, 0.34 * dist, 0.84 * dist);
    this.camera.lookAt(0, 0, 0);
    this.renderer.render(this.scene, this.camera);
    if (this.interacting || this.auto) this.requestRender();
  }
}
