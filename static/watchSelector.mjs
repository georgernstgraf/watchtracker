class WatchSelector {
    constructor(dom) {
        
        // Kümmert sich um die wechselseitige Referenzierung
        this.dom = dom;
        this.dom.obj = this;
        this.watches;
        
        // Löschen des Inhalts von this.dom
        this.dom.innerHTML = "";
        
        // Label für Select-Element
        let label = document.createElement("label");
        label.innerHTML = "Wähle: ";
        label.setAttribute("for", "watchSelector");
        this.dom.appendChild(label);

        // Select-Element
        this.select = document.createElement("select");
        this.select.setAttribute("id", "watchSelector");
        this.dom.appendChild(this.select);
        this.populate_select();
        this.select.addEventListener("change", (e) => this.change(e.target));
    }
    async populate_select() {
        // Füllen des Select-Elements
        this.select.innerHTML = "";
        let option;
        await fetch("http://localhost:3000/uhren/liste")
        .then(response => response.json())
        .then(data => {this.watches = data})
        .catch(err => {this.watches = ["Fehler", err.message]});
        this.select.setAttribute("size", this.watches.length);
        for (let i = 0; i < this.watches.length; i++) {
            option = document.createElement("option");
            option.setAttribute("value", this.watches[i]);
            option.innerHTML = this.watches[i];
            this.select.appendChild(option);
        }
    }
    change(target) {
        window.myObjects.watchTable.load_watch(target.value);
    }
}
export { WatchSelector };