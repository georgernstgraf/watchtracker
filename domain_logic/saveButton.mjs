import { Component } from "./component.mjs";

class SaveButton extends Component {
    button;
    constructor(parent, anchor) {
        super(parent, anchor);
        this.domElement = document.createElement("td");
        this.button = document.createElement("button");
        this.button.innerHTML = "Speichern";
        this.button.addEventListener("click", async () => {
            await this.parent.save();
        });
        this.domElement.appendChild(this.button);
        this.addToDom();
    }
}
export { SaveButton };
