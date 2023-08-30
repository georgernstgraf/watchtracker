import { WatchSelector } from "./watchSelector.mjs";
import { WatchTable } from "./watchTable.mjs";

/* GENERELL
 * Jedes meiner Objekte bekommt im Konstruktor eine Referenz auf das domElement-Element, in dem es angezeigt werden soll.
 * Sein eigenes HTML Element muß es selber erzeugen (und in das domElement-Element einfügen).
 * Das domElement-Element bekommt eine Referenz auf das Objekt, entweder ist "obj" ein Array oder ein einzelnes Objekt.
 */

window.myObject = new Object();

console.log("frontend.js started @" + new Date().toLocaleTimeString());

window.myObject.watchSelector = new WatchSelector({
    domElement: document.getElementById("watchSelector"),
});

window.myObject.watchTable = new WatchTable({
    domElement: document.getElementById("watchTable"),
});

console.log("frontend.js finished @" + new Date().toLocaleTimeString());
