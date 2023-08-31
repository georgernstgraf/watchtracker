import { Component } from "./component.mjs";
class AddWatch extends Component {
    constructor(parent) {
        // parent has domElement (<div>)
        super(parent);
        this.domElement = document.createElement("div");

        this.init(); // handles appendChild
    }
    init() {
        this.domElement.innerHTML = "";
        this.domElement.appendChild(this.getAddButton());
        this.display();
    }

    getAddButton() {
        let button;
        button = document.createElement("button");
        button.innerHTML = "Uhr anlegen";
        button.addEventListener("click", this.showInput.bind(this));
        return button;
    }
    getCreateButton() {
        let button;
        button = document.createElement("button");
        button.innerHTML = "anlegen";
        button.addEventListener("click", (e) => {
            this.create(e.target.previousSibling.value);
        });
        return button;
    }
    showInput() {
        let input;
        console.log("showInput", new Date().toLocaleTimeString());
        this.domElement.innerHTML = "";

        input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Name der Uhr";
        input.addEventListener("change", (e) => {
            this.create(e.target.value);
        });
        this.domElement.appendChild(input);

        this.domElement.appendChild(this.getCreateButton());
        input.focus();
    }
    create(name) {
        console.log("create", name, new Date().toLocaleTimeString());
        this.init();
        window.myObject.watchTable.loadNew(name);
    }
}

export { AddWatch };
