import { Component } from './component.mjs';
class WatchSelector extends Component {
    constructor(parent) {
        // parent has .domElement
        super(parent);
        this.watches;
        this.domElement = document.createElement('select');
        this.domElement.setAttribute('id', 'watchSelect');
        this.domElement.obj = this;
        this.addToDom();
        this.domElement.addEventListener('change', (e) =>
            this.watchChosen(e.target)
        );
    }
    async populate(username) {
        // Füllen des Select-Elements
        this.domElement.innerHTML = '';
        if (!username) {
            const nothing = document.createElement('option');
            nothing.innerHTML = 'nothing to show';
            this.domElement.appendChild(nothing);
            this.domElement.setAttribute('size', 1);
            this.domElement.selectedIndex = 0;
            return;
        }
        await fetch('uhren/liste', {
            credentials: 'include',
        })
            .then((response) => {
                if (!response.ok) {
                    if (response.status == 401) {
                        return window.app.unauthorized();
                    }
                    throw new Error(
                        `Error: ${response.status} ${response.statusText}`
                    );
                }
                return response.json();
            })
            .then((data) => {
                this.watches = data;
            })
            .catch((err) => {
                console.log('WatchSelector.populate', err.message);
                this.watches = ['Fehler', err.message];
            });
        if (!this.watches) return;
        this.domElement.setAttribute('size', this.watches.length);
        for (let i = 0; i < this.watches.length; i++) {
            const option = document.createElement('option');
            option.setAttribute('value', this.watches[i]);
            option.innerHTML = this.watches[i];
            this.domElement.appendChild(option);
        }
        if (this.watches.length == 1) {
            this.domElement.selectedIndex = 0;
            this.watchChosen(this.domElement);
        }
    }
    watchChosen(target) {
        // Es geht nur um die Optik
        let sel = target.selectedIndex;
        for (let i = 0; i < target.options.length; i++) {
            if (i == sel) {
                target.options[i].style.color =
                    this.constructor.headerColorMagenta;
                target.options[i].style.fontWeight = 'bold';
                target.options[i].style.backgroundColor =
                    this.constructor.backgroundColor;
            } else {
                target.options[i].style.color = null;
                target.options[i].style.fontWeight = null;
                target.options[i].style.backgroundColor = null;
            }
        }
        window.app.watchTable.loadWatch(target.value);
    }
}
export { WatchSelector };
