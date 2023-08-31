import { DateTimePicker } from "./dateTimePicker.mjs";
import { Second } from "./second.mjs";
import { Component } from "./component.mjs";
class WatchRecord extends Component {
    domElement; // domElementtype: <tr> (line)
    data; // json object
    picker;
    abw;
    dirty;
    constructor(parent, anchor, data) {
        super(parent, anchor);
        // domElement is a <tr> element
        // data is a json object
        if (data == undefined) {
            this.domElement = this.anchor.insertRow(0);
            this._id = undefined;
            this._date = new Date();
            this._date.setMinutes(
                this._date.getMinutes() - this._date.getTimezoneOffset()
            );
            this._offsetSecs = 0;
            this._uhr = this.parent.currentWatch;
            this._user = "Georg"; // TODO login
            this.setDirty();
        } else {
            this.domElement = this.anchor.insertRow();
            this.data = data;
            // zerlegen des JSON (5 Werte)
            this._id = data._id;
            this._date = new Date(data.dateMeasured);
            this._offsetSecs = data.offsetSecs;
            this._uhr = data.uhr;
            this._user = data.user;
            this.setDirty(false);
        }
        this.domElement.obj = this;

        this.fillTR();
    }

    setDirty(dirty) {
        super.setDirty(dirty);
        if (this.dirty) {
            this.domElement.style.backgroundColor = this.constructor.dirtyColor;
        } else {
            this.domElement.style.backgroundColor = null;
        }
        this.parent.setDirty(dirty);
    }
    async delete() {
        if (this._id != undefined) {
            console.log("Record.delete", this._id, "from db");
            await fetch(`/uhren/id/${this._id}`, {
                method: "DELETE",
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(
                            `Error: ${response.status} ${response.statusText}`
                        );
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log("Record.delete");
                })
                .catch((err) => {
                    console.log("Record.delete", err.message);
                });
        } else {
            console.log("Record.delete", "no id, i am safe!");
        }
        super.delete();
    }
    async save() {
        let method, url;
        console.log("Record.save called");
        if (!this.dirty) {
            console.warn("Record.save", "called, but no changes");
            return;
        }
        let data = {
            dateMeasured: this.picker.date,
            offsetSecs: this.abw.secs,
            uhr: this._uhr,
            user: this._user,
        };
        if (this._id == undefined) {
            method = "POST";
            url = "/uhren";
            console.log("Record.save NEW!");
        } else {
            method = "PATCH";
            url = `/uhren/id/${this._id}`;
            console.log("Record.save UPDATE!");
        }
        await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        `Error: ${response.status} ${response.statusText}`
                    );
                }
                return response.json();
            })
            .then((data) => {
                console.log("Record.save");
                this._id = data._id;
                this.setDirty(false);
            })
            .catch((err) => {
                console.error("Record.save", err.message);
            });
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
