import { Component } from "./component.mjs";

class Second extends Component {
    constructor(parent, anchor, secs) {
        super(parent, anchor);
        this.domElement = document.createElement("input");
        this.domElement.type = "number";
        this.domElement.obj = this;
        this.domElement.addEventListener("change", this.change.bind(this));
        this.domElement.valueAsNumber = secs;
        this.addToDom();
        window.myObject.second = this;
    }
    change() {
        if (isNaN(this.secs)) {
            this.domElement.style.backgroundColor = this.constructor.invalidColor;
        } else {
            this.domElement.style.backgroundColor = this.constructor.inputColor;
        }
        this.parent.setDirty();
    }
    get secs() {
        return this.domElement.valueAsNumber;
    }
}
export { Second };
