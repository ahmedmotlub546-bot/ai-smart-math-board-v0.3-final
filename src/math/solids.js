// Single source of truth for every 3D solid: dimensions, ranges, formulas, and live properties.
import { cubeProperties, pyramidProperties, coneProperties, cylinderProperties, sphereProperties } from "./formulas.js";

const PI = "π";
export const UNITS = [
  { id: "units", label: "units" },
  { id: "mm", label: "mm" },
  { id: "cm", label: "cm" },
  { id: "m", label: "m" },
  { id: "in", label: "in" }
];

export const SOLIDS = {
  cube: {
    name: "Cube",
    dims: [{ key: "a", label: "Side", symbol: "a", min: 0.5, max: 4.5, step: 0.05, def: 2.5 }],
    props: d => { const p = cubeProperties(d.a); return { volume: p.volume, surface: p.surfaceArea, lateral: 4 * d.a * d.a, slant: null }; },
    formulas: ["Volume V = a³", "Surface area = 6a²", "Lateral area = 4a²"],
    working: (d, f) => [`V = ${f(d.a)}³`, `Surface = 6 × ${f(d.a)}²`],
    structure: "8 vertices · 12 edges · 6 square faces",
    blurb: "A cube has six congruent square faces. Every edge has the same length a."
  },
  // Full SOLIDS object for pyramid, cone, cylinder, sphere + helper functions from the zip
};

export const SOLID_ORDER = ["cube", "pyramid", "cone", "cylinder", "sphere"];
export function defaultDims(type) { return Object.fromEntries(SOLIDS[type].dims.map(d => [d.key, d.def])); }
export function clampDims(type, dims) { /* full implementation */ }
