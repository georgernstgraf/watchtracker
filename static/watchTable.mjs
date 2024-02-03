import { WatchRecord } from './watchRecord.mjs';
import { Component } from './component.mjs';
import { SekPerDay } from './sekPerDay.mjs';

class WatchTable extends Component {
    currentWatch;
    saveButton;
    dirty;
    stats;
    infoTxt;
    constructor(parent) {
        // parent has domElement (<div>)
        // Ich muß mich immer mit appendChild in das domElement des Parents hineinerzeugen
        super(parent);
        // table, caption, thead, tbody erzeugen
        this.domElement = document.createElement('table');
        this.domElement.obj = this;
        this.addToDom();

        this.caption = document.createElement('caption');
        this.domElement.appendChild(this.caption);

        this.thead = document.createElement('thead');
        this.domElement.appendChild(this.thead);
        this.thead.hidden = true;
        this.fillThead();

        this.tbody = document.createElement('tbody');
        this.domElement.appendChild(this.tbody);

        this.tfoot = document.createElement('tfoot');
        this.domElement.appendChild(this.tfoot);
        this.tfoot.hidden = true;
        this.fillTfoot();
    }

    clear() {
        this.thead.hidden = true;
        this.tfoot.hidden = true;
        this.setInfo('Wählen oder erstellen');
    }

    setInfo(msg, error = false) {
        if (!error) {
            this.caption.style.backgroundColor = null;
            this.infoTxt = msg;
        } else {
            this.caption.style.backgroundColor = this.constructor.invalidColor;
        }
        this.caption.innerHTML = msg;
    }

    clearError() {
        this.setInfo(this.infoTxt);
    }

    fillThead() {
        // 2 Zeilen header
        this.thead.innerHTML = '';
        let tr, th, butt;

        // Headerzeile
        tr = document.createElement('tr');
        this.thead.appendChild(tr);

        // plus button
        th = document.createElement('th');
        th.setAttribute('scope', 'rowgroup');
        th.style.width = '5%';
        tr.appendChild(th);
        butt = document.createElement('button');
        th.appendChild(butt);
        butt.innerHTML = '\uff0b'; // Unicode für Pluszeichen
        butt.addEventListener('click', this.addRecord.bind(this));

        th = document.createElement('th');
        th.setAttribute('scope', 'col');
        th.style.width = '30%';
        th.innerHTML = 'Messzeitpunkt';
        tr.appendChild(th);

        th = document.createElement('th');
        th.setAttribute('scope', 'col');
        th.style.width = '10%';
        th.innerHTML = 'Abweichung';
        tr.appendChild(th);

        th = document.createElement('th');
        th.setAttribute('scope', 'col');
        th.style.width = '55%';
        th.innerHTML = 'Sek / Tag';
        tr.appendChild(th);
    }
    fillTfoot() {
        let tr, th, td;
        this.tfoot.innerHTML = '';
        tr = document.createElement('tr');
        this.tfoot.appendChild(tr);
        this.stats = new SekPerDay(this, tr);
        this.stats.makeBold();
    }

    loadCommon(name) {
        this.currentWatch = name;
        this.thead.hidden = false;
        this.tfoot.hidden = false;
    }

    loadNew(name) {
        this.removeAllChildren();
        this.loadCommon(name);
        this.setInfo(`Aktuell: ${name}`);
        this.addRecord();
        this.setDirty();
    }

    async loadWatch(name) {
        console.log('loadWatch', name);
        this.loadCommon(name);
        this.setInfo('Loading...');
        await fetch(`uhren/daten/${name}`, {
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
                this.removeAllChildren();
                this.setInfo(`Aktuell: ${name}`);
                this.setDirty(false);
                for (let entry of data) {
                    this.addRecord(entry);
                }
                this.recalc();
                this.thead.hidden = false;
                this.tfoot.hidden = false;
            })
            .catch((err) => {
                this.setInfo(`Fehler: ${err.message}`, true);
            });
    }

    recalc(fresh = false) {
        // wird aufgerufen von
        // - loadWatch() Methode (hier)
        // - save() Methode von WatchRecord
        // - delete() Methode von WatchRecord
        if (fresh && this.children.length == 1) {
            window.myObject.watchSelector.populate();
        }
        for (let i = 1; i < this.children.length; i++) {
            this.children[i].calcAfterLoad(this.children[i - 1]);
        }
        if (this.children.length > 1) {
            this.stats.fullFill(...this.driftPerDay);
        } else {
            this.stats.setContent('(noch keine Daten)');
        }
    }

    get driftPerDay() {
        this.sort();
        let periodLen = 0;
        let drift = 0;
        let startIndex = 0;
        let lastIndex = this.children.length - 1;
        for (let i = 1; i <= lastIndex; i++) {
            if (
                // Wenn Nullwert oder letzter Eintrag muss ich was machen, sonst nicht
                this.children[i].offsetSecs == 0 ||
                i == lastIndex
            ) {
                let indexToCalcWith;
                if (i == lastIndex && this.children[i].offsetSecs != 0) {
                    indexToCalcWith = i; // if it's the last record and it's not zero, take it
                } else {
                    indexToCalcWith = i - 1; // otherwise the record before
                }
                periodLen +=
                    this.children[indexToCalcWith].date -
                    this.children[startIndex].date;
                drift +=
                    this.children[indexToCalcWith].offsetSecs -
                    this.children[startIndex].offsetSecs;
                startIndex = i;
            }
        }
        return [periodLen, drift];
    }

    sort() {
        this.children.sort((a, b) => {
            return a.date.getTime() - b.date.getTime();
        });
        this.reRender();
    }

    reRender() {
        for (let child of this.children) {
            child.removeFromDom();
        }
        for (let child of this.children) {
            child.addToDom();
        }
    }
    removeAllChildren() {
        while (this.children.length > 0) {
            this.remove(this.children[0], false);
        }
    }
    remove(child, notifySelector = true) {
        super.remove(child);
        if (this.children.length == 0 && notifySelector) {
            this.clear();
            window.myObject.watchSelector.populate();
        }
        let dirty = false;
        for (let child of this.children) {
            if (child.dirty) {
                dirty = true;
                break;
            }
        }
        this.setDirty(dirty);
    }
    addRecord(data) {
        if (data instanceof Event) {
            data = undefined;
        }
        if (data == undefined) {
            this.setDirty();
        } else {
            this.setDirty(false);
        }
        console.log('addRecord');
        this.children.push(new WatchRecord(this, this.tbody, data));
    }
}
export { WatchTable };
