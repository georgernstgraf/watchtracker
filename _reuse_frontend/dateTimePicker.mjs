import { Component } from "./component.mjs";

class DateTimePicker extends Component {
    static timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    domElement;

    constructor(parent, anchor, date) {
        super(parent, anchor);
        this.domElement = document.createElement("input");
        this.domElement.obj = this;
        this.domElement.type = "datetime-local";
        this.domElement.addEventListener("change", this.change.bind(this));
        this.domElement.valueAsDate = date;
        this.addToDom();
    }

    change() {
        this.parent.setDirty();
    }

    get date() {
        return this.domElement.valueAsDate;
    }
}
export { DateTimePicker };
