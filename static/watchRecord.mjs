import { DateTimePicker } from "./dateTimePicker.mjs";
import { Second } from "./second.mjs";
import { Component } from "./component.mjs";
class WatchRecord extends Component {
    domElement; // domElementtype: <tr> (line)
    data; // json object
    picker;
    abw;
    constructor(parent, anchor, data) {
        super(parent, anchor);
        // domElement is a <tr> element
        // data is a json object
        this.domElement = this.parentDomAnchor.insertRow();
        this.domElement.obj = this;
        if (data == undefined) {
            // TODO: new empty record
            this._id = undefined;
            this._date = new Date();
            this._offsetSecs = 0;
            this._uhr = undefined; // TODO suggest from watchSelector or from watchTable
            this._user = "Georg"; // TODO
        } else {
            this.data = data;
            // zerlegen des JSON (5 Werte)
            this._id = data._id;
            this._date = new Date(data.dateMeasured);
            this._offsetSecs = data.offsetSecs;
            this._uhr = data.uhr;
            this._user = data.user;
        }
        console.log("Record.constructor", this.data);
        window.myObject.record = this;
        this.fillTR();
    }

    delete() {
        if (this._id != undefined) {
            // TODO delete from database
        }
        super.delete();
    }

    fillTR() {
        let th, td, input, butt;
        // MINUS - Button
        th = document.createElement("th");
        th.setAttribute("scope", "row");
        this.domElement.appendChild(th);
        butt = document.createElement("button");
        butt.innerHTML = "\uff0d"; // Unicode für Minuszeichen
        butt.addEventListener("click", (e) => {
            e.target.parentElement.parentElement.obj.delete();
            // butt..th............tr (this.domElement)
        });
        th.appendChild(butt);

        // datum (mit picker)
        td = document.createElement("td");
        this.domElement.appendChild(td);
        this.picker = new DateTimePicker(this, td, this._date);

        // abweichung
        td = document.createElement("td");
        this.domElement.appendChild(td);
        this.abw = new Second(this, td, this._offsetSecs);
    }
}
export { WatchRecord };
