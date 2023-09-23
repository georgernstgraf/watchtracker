import { Component } from "./component.mjs";
class WatchSelector extends Component {
    constructor(parent) {
        // parent has .domElement
        super(parent);
        this.watches;
        this.domElement = document.createElement("select");
        this.domElement.setAttribute("id", "watchSelect");
        this.addToDom();
        this.populate();
        this.domElement.addEventListener("change", (e) =>
            this.watchChosen(e.target)
        );
    }

    async populate() {
        // Füllen des Select-Elements
        this.domElement.innerHTML = "";
        let option;
        await fetch("http://localhost:3000/uhren/liste")
            .then((response) => response.json())
            .then((data) => {
                this.watches = data;
            })
            .catch((err) => {
                this.watches = ["Fehler", err.message];
            });
        this.domElement.setAttribute("size", this.watches.length);
        for (let i = 0; i < this.watches.length; i++) {
            option = document.createElement("option");
            option.setAttribute("value", this.watches[i]);
            option.innerHTML = this.watches[i];
            this.domElement.appendChild(option);
        }
    }

    watchChosen(target) {
        // Es geht nur um die Optik
        let sel = target.selectedIndex;
        for (let i = 0; i < target.options.length; i++) {
            if (i == sel) {
                target.options[i].style.color =
                    this.constructor.headerColorMagenta;
                target.options[i].style.fontWeight = "bold";
                target.options[i].style.backgroundColor =
                    this.constructor.backgroundColor;
            } else {
                target.options[i].style.color = null;
                target.options[i].style.fontWeight = null;
                target.options[i].style.backgroundColor = null;
            }
        }
        window.myObject.watchTable.loadWatch(target.value);
    }
}
export { WatchSelector };
