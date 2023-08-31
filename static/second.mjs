import { Component } from "./component.mjs";

class Second extends Component {
    constructor(parent, anchor, secs) {
        super(parent, anchor);
        this.domElement = document.createElement("input");
        this.domElement.type = "number";
        this.domElement.obj = this;
        this.domElement.addEventListener("change", this.change.bind(this));
        this.domElement.valueAsNumber = secs;
        this.display();
        window.myObject.second = this;
    }
    change() {
        if (isNaN(this.secs)) {
            this.domElement.style.backgroundColor = "#f55";
        } else {
            this.domElement.style.backgroundColor = "#fff";
        }
        this.parent.setDirty();
    }
    get secs() {
        return this.domElement.valueAsNumber;
    }
}
export { Second };
