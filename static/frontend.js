import { WatchSelector } from './watchSelector.mjs';
import { WatchTable } from './watchTable.mjs';
import { AddWatch } from './addWatch.mjs';
import { DeleteWatch } from './deleteWatch.mjs';
import { LoginForm } from './loginForm.mjs';
import { Profile } from './profile.mjs';

/* GENERELL
 * Jedes meiner Objekte bekommt im Konstruktor eine Referenz auf das domElement-Element, in dem es angezeigt werden soll.
 * Sein eigenes HTML Element muß es selber erzeugen (und in das domElement-Element einfügen).
 * Das domElement-Element bekommt eine Referenz auf das Objekt, entweder ist "obj" ein Array oder ein einzelnes Objekt.
 */

class App {
    constructor() {
        this.watchSelector = new WatchSelector({
            domElement: document.getElementById('watchSelector'),
        });
        this.addWatch = new AddWatch({
            domElement: document.getElementById('addWatch'),
        });
        this.deleteWatch = new DeleteWatch({
            domElement: document.getElementById('deleteWatch'),
        });
        this.watchTable = new WatchTable({
            domElement: document.getElementById('watchTable'),
        });
        this.loginForm = new LoginForm({
            domElement: document.getElementById('loginForm'),
        });
        this.profile = new Profile({
            domElement: document.getElementById('profile'),
        });
        this.profile.setApp(this);
        this.profile.whoami();
        //window.app.watchSelector.autoChoose();
    }
    handleLogin(user) {
        this.profile.populate(user);
        this.watchSelector.populate(user);
        this.watchTable.setCaption('Wählen oder anlegen');
    }
    handleLogout() {
        this.profile.populate();
        this.watchSelector.populate();
        this.watchTable.logout();
    }
    unauthorized() {
        this.showLoginForm();
    }
    handleError(err) {
        console.error(err);
        alert(err.message);
        // TODO alert / modal
    }
    showLoginForm() {
        this.loginForm.display();
    }
    hideLoginForm() {
        this.loginForm.hide();
    }
}

window.app = new App(); // for storing the apps global Objects

console.log('frontend.js starting @' + new Date().toLocaleTimeString());

console.log('frontend.js finished @' + new Date().toLocaleTimeString());
