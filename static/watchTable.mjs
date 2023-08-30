import { WatchRecord } from "./watchRecord.mjs";
import { Component } from "./component.mjs";

class WatchTable extends Component {
    currentWatch;
    constructor(parent) {
        // parent has domElement (<div>)
        // Ich muß mich immer mit appendChild in das domElement des Parents hineinerzeugen
        super(parent);

        // table, caption, thead, tbody erzeugen
        this.domElement = document.createElement("table");
        this.display();

        this.caption = document.createElement("caption");
        this.domElement.appendChild(this.caption);
        this.setInfo("Time to select a watch!");

        this.thead = document.createElement("thead");
        this.domElement.appendChild(this.thead);
        this.fillTHeader();

        this.tbody = document.createElement("tbody");
        this.domElement.appendChild(this.tbody);
    }

    setInfo(msg) {
        this.caption.innerHTML = msg;
    }

    fillTHeader() {
        // 2 Zeilen header
        this.thead.innerHTML = "";
        let tr, th, butt;

        // Headerzeile
        tr = document.createElement("tr");
        this.thead.appendChild(tr);

        // plus button
        th = document.createElement("th");
        th.setAttribute("scope", "rowgroup");
        tr.appendChild(th);
        butt = document.createElement("button");
        th.appendChild(butt);
        butt.innerHTML = "new"; // Unicode für Pluszeichen
        butt.addEventListener("click", this.newEmpty.bind(this));

        th = document.createElement("th");
        th.setAttribute("scope", "col");
        th.innerHTML = "Messzeitpunkt";
        tr.appendChild(th);

        th = document.createElement("th");
        th.setAttribute("scope", "col");
        th.innerHTML = "Abweichung";
        tr.appendChild(th);
    }

    newEmpty() {
        this.children.push(new WatchRecord(this, this.tbody)); // TOFO
    }

    async load_watch(name) {
        this.currentWatch = name;
        this.tbody.innerHTML = "";
        this.setInfo("Loading...");
        await fetch("http://localhost:3000/uhren/daten/" + name)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        `Error: ${response.status} ${response.statusText}`
                    );
                }
                return response.json();
            })
            .then((data) => {
                this.children = [];
                for (let entry of data) {
                    this.children.push(
                        new WatchRecord(this, this.tbody, entry)
                    );
                }
                this.setInfo(`Bearbeite: ${name}`);
            })
            .catch((err) => {
                this.setInfo(`Fehler: ${err.message}`);
            });
        console.log("load_watch", name);
    }
}
export { WatchTable };
