import { GeometryController } from "../geometry/geometry-controller.js";
const NS="http://www.w3.org/2000/svg";const $=id=>document.getElementById(id);
const el=(tag,attrs={})=>{const n=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));return n;};
export class BoardController {
  constructor(store,history){this.store=store;this.history=history;this.tool="select";this.drag=null;this.drawing=false;this.bindCanvas();}
  setTool(tool){this.tool=tool;this.render();document.querySelectorAll("[data-tool]").forEach(b=>b.classList.toggle("active",b.dataset.tool===tool));$("boardHint").textContent=({select:"Drag a vertex to reshape the triangle",pen:"Draw with your mouse or finger",eraser:"Tap a stroke or note to remove it",point:"Click the canvas to add a point"})[tool]||"Select a tool";}
  addTriangle(){this.history.checkpoint();const s=this.store.getState();s.geometry.triangle=[{x:310,y:370,label:"A"},{x:590,y:370,label:"B"},{x:450,y:145,label:"C"}];this.store.setState(s);this.render();}
  addCircle(){this.history.checkpoint();const s=this.store.getState();s.geometry.shapes.push({type:"circle",x:450,y:265,r:95});this.store.setState(s);this.render();}
  addNote(){const value=prompt("Enter a short board note","Angles in a triangle add to 180°");if(!value)return;this.history.checkpoint();const s=this.store.getState();s.geometry.notes.push({x:75,y:70,text:value,color:"#ffbd8b"});this.store.setState(s);this.render();}
  // Full implementation matches the zip file (pointer handling, rendering strokes/notes, geometry overlay)
  bindCanvas(){ /* full pointer and render logic from source */ }
  render(){ /* full render logic */ }
}