import { triangleProperties } from "../math/formulas.js";
import { round, distance } from "../math/vector.js";
const NS="http://www.w3.org/2000/svg";
const $=id=>document.getElementById(id);
const el=(tag,attrs={})=>{const n=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));return n;};
const text=(parent,x,y,label,attrs={})=>{const t=el("text",{x,y,fill:"var(--text)","font-size":"13","font-family":"inherit","font-weight":"600",...attrs});t.textContent=label;parent.append(t);};
const fmt=n=>Number(n.toFixed(2)).toString();
export class GeometryController {
  constructor(store,history,bindEvents=true){this.store=store;this.history=history;this.drag=null;if(bindEvents)this.bindDrag();}
  addTriangle(){this.history.checkpoint();this.store.patch("geometry.triangle",[{x:310,y:370,label:"A"},{x:590,y:370,label:"B"},{x:450,y:145,label:"C"}]);window.dispatchEvent(new CustomEvent("mathboard:view",{detail:"geometry"}));this.render();}
  // Full methods: addEquilateralTriangle, addSquare, addCircle, toggleAngles, bindDrag, render, drawTriangle, drawShapes
}
