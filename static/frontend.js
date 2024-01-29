import { WatchSelector } from './watchSelector.mjs';
import { WatchTable } from './watchTable.mjs';
import { AddWatch } from './addWatch.mjs';

window.addEventListener('error', function (event) {
    console.error('Window Event Error:', event.error);
});

/* GENERELL
 * Jedes meiner Objekte bekommt im Konstruktor eine Referenz auf das domElement-Element, in dem es angezeigt werden soll.
 * Sein eigenes HTML Element muß es selber erzeugen (und in das domElement-Element einfügen).
 * Das domElement-Element bekommt eine Referenz auf das Objekt, entweder ist "obj" ein Array oder ein einzelnes Objekt.
 */

window.myObject = new Object();

console.log('frontend.js started @' + new Date().toLocaleTimeString());

window.myObject.watchSelector = new WatchSelector({
    domElement: document.getElementById('watchSelector'),
});

window.myObject.addWatch = new AddWatch({
    domElement: document.getElementById('addWatch'),
});

window.myObject.watchTable = new WatchTable({
    domElement: document.getElementById('watchTable'),
});

document.getElementById('logout_button').addEventListener('click', function () {
    fetch('/logout', { method: 'GET' })
        .then((response) => {
            if (!response.ok) throw new Error('Logout failed');
            return response.json();
        })
        .then((data) => {
            console.log(`logout: ${data.message}`);
            window.location.href = '/login.html';
        })
        .catch((error) => console.error('Error:', error));
});
console.log('frontend.js finished @' + new Date().toLocaleTimeString());
