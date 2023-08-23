class WatchTable {
    constructor(dom) {
        this.dom = dom;
        this.dom.obj = this;
        this.entries;

        // Löschen des Inhalts von this.dom
        this.dom.innerHTML = "";

        // table

        this.table = document.createElement("table");
        this.dom.appendChild(this.table);
        this.caption = document.createElement("caption");
        this.table.appendChild(this.caption);
        this.thead = document.createElement("thead");
        this.table.appendChild(this.thead);
        this.tbody = document.createElement("tbody");
        this.table.appendChild(this.tbody);
        this.setInfo("Time to select a watch!");
    }

    setInfo(msg) {
        this.caption.innerHTML = msg;
    }

    makeTHeader(name) {
        // 2 Zeilen header  
        this.setInfo(`Bearbeite: ${name}`);
        this.thead.innerHTML = "";
        this.tbody.innerHTML = "";
        let tr, th;

        // 1. Zeile
        tr = document.createElement("tr");
        this.thead.appendChild(tr);
        th = document.createElement("th");
        th.setAttribute("scope", "col");
        th.innerHTML = "\uff0b";
        th.addEventListener("click", (e) => {
            console.log("click", e.target);
        });
        tr.appendChild(th);
        th = document.createElement("th");
        th.setAttribute("scope", "col");
        th.innerHTML = "Messzeitpunkt";
        tr.appendChild(th);
        th = document.createElement("th");
        th.setAttribute("scope", "col");
        th.innerHTML = "Abweichung";
        tr.appendChild(th);
    }
    async load_watch(name) {
        this.setInfo("Loading...");
        await fetch("http://localhost:3000/uhren/daten/" + name)
            .then(response => {
                window.myObjects.response = response;
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                this.entries = data
                this.makeTHeader(name);
                let tr, td;
                for (let i = 0; i < this.entries.length; i++) {
                    tr = document.createElement("tr");
                    this.tbody.appendChild(tr);
                    td = document.createElement("td");
                    td.setAttribute("scope", "row");
                    td.innerHTML = "\uff0d";
                    tr.appendChild(td);
                    td = document.createElement("td");
                    td.setAttribute("scope", "row");
                    td.innerHTML = this.entries[i].dateMeasured;
                    tr.appendChild(td);
                    td = document.createElement("td");
                    td.innerHTML = this.entries[i].offsetSecs;
                    tr.appendChild(td);
                }
            })
            .catch(err => { this.setInfo(`Fehler: ${err.message}`) });
        console.log("load_watch", name);
    }
}
export { WatchTable };