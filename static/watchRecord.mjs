import { DateTimePicker } from './dateTimePicker.mjs';
import { Second } from './second.mjs';
import { Component } from './component.mjs';
import { SekPerDay } from './sekPerDay.mjs';
import { SaveButton } from './saveButton.mjs';

class WatchRecord extends Component {
    domElement; // domElementtype: <tr> (line)
    data; // json object
    picker;
    abw;
    dirty;
    sekPerDay;
    saveButton;
    isNew;
    constructor(parent, anchor, data) {
        super(parent, anchor);
        // domElement is a <tr> element
        // data is a json object from db or undefined (if new record)
        let _date, _offsetSecs;
        if (data == undefined) {
            this.domElement = this.anchor.insertRow();
            this._id = undefined;
            _date = new Date();
            _date.setMinutes(_date.getMinutes() - _date.getTimezoneOffset());
            _date.setSeconds(0);
            _date.setMilliseconds(0);
            _offsetSecs = 0;
            this._uhr = this.parent.currentWatch;
            this._user = window.myObject.user;
            this.isNew = true;
        } else {
            this.domElement = this.anchor.insertRow();
            this.data = data;
            // zerlegen des JSON (5 Werte)
            this._id = data._id;
            _date = new Date(data.dateMeasured);
            _offsetSecs = data.offsetSecs;
            this._uhr = data.uhr;
            this._user = data.user;
            this.isNew = false;
        }
        this.domElement.obj = this;
        this.fillTR(_date, _offsetSecs);
        if (data == undefined) {
            this.setDirty();
        } else {
            this.setDirty(false);
        }
        this.addToDom();
    }
    get date() {
        return this.picker.date;
    }

    get offsetSecs() {
        return this.abw.secs;
    }

    setDirty(dirty) {
        super.setDirty(dirty);
        if (this.dirty) {
            this.domElement.style.backgroundColor = this.constructor.dirtyColor;
            this.sekPerDay.hide();
            this.saveButton.display();
        } else {
            this.domElement.style.backgroundColor = null;
            this.sekPerDay.display();
            this.saveButton.hide();
        }
        // this.parent.setDirty(dirty); // TODO check if this is necessary
    }
    async delete() {
        if (this._id != undefined) {
            console.log('Record.delete', this._id, 'from db');
            await fetch(`uhren/id/${this._id}`, {
                method: 'DELETE',
                credentials: 'include',
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
                    console.log('Record.delete');
                })
                .catch((err) => {
                    console.error('Record.delete', err.message);
                });
        } else {
            console.log('Record.delete', 'no id, i am safe!');
        }
        super.delete();
        this.parent.recalc();
    }
    async save() {
        let method, url;
        console.log('Record.save called');
        if (!this.dirty) {
            console.warn('Record.save', 'called, but no changes');
            return;
        }
        let data = {
            dateMeasured: this.picker.date,
            offsetSecs: this.abw.secs,
            uhr: this._uhr,
            user: this._user,
        };
        if (this._id == undefined) {
            method = 'POST';
            url = 'uhren';
            console.log('Record.save NEW!');
        } else {
            method = 'PATCH';
            url = `uhren/id/${this._id}`;
            console.log('Record.save UPDATE!');
        }
        await fetch(url, {
            method: method,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
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
                console.log('Record.save');
                this._id = data._id;
                this.setDirty(false);
                this.parent.recalc(this.isNew);
                this.parent.clearError();
            })
            .catch((err) => {
                console.error('Record.save', err.message);
                console.error('Record.save', err.stack);
                console.error(`dirty: ${this.dirty}`);
                this.parent.setInfo(`Fehler: ${err.message}`, true);
            });
    }

    fillTR(_date, _offsetSecs) {
        let th, td, input, butt;
        // MINUS - Button
        th = document.createElement('th');
        th.setAttribute('scope', 'row');
        this.domElement.appendChild(th);
        butt = document.createElement('button');
        butt.innerHTML = '\uff0d'; // Unicode für Minuszeichen
        butt.addEventListener('click', this.delete.bind(this));
        th.appendChild(butt);

        // datum (mit picker)
        td = document.createElement('td');
        this.domElement.appendChild(td);
        this.picker = new DateTimePicker(this, td, _date);

        // abweichung
        td = document.createElement('td');
        this.domElement.appendChild(td);
        this.abw = new Second(this, td, _offsetSecs);

        // Sek / Tag
        this.sekPerDay = new SekPerDay(this);
        this.sekPerDay.setContent('start');

        // save button
        this.saveButton = new SaveButton(this);
    }

    calcAfterLoad(prev) {
        if (this.abw.secs == 0) {
            this.sekPerDay.setContent('start');
        } else {
            this.sekPerDay.fill(prev);
        }
    }
}
export { WatchRecord };
