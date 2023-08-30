import { Component } from "./component.mjs";

class DateTimePicker extends Component {
    _date;
    domElement;

    constructor(parent, anchor, date) {
        super(parent, anchor);
        this.domElement = document.createElement("input");
        this.domElement.obj = this;
        this.domElement.type = "datetime-local";
        this.domElement.addEventListener("change", this.change);
        this.domElement.valueAsDate = date;
        this.display();
    }

    change() {
        this._date = this.domElement.valueAsDate;
        // TODO implement logic
    }

    get date() {
        return this._date;
    }
}
export { DateTimePicker };
