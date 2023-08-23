import { WatchSelector } from "./watchSelector.mjs";
import { WatchTable } from "./watchTable.mjs";  

window.myObjects = {};

console.log("frontend.js started @" + new Date().toLocaleTimeString());

let watchSelector = new WatchSelector(document.getElementById("watchSelector"));
window.myObjects.watchSelector = watchSelector;

let watchTable = new WatchTable(document.getElementById("watchTable"));
window.myObjects.watchTable = watchTable;

console.log("frontend.js finished @" + new Date().toLocaleTimeString());