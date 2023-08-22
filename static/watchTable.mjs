class WatchTable {
    constructor(dom) {
        this.dom = dom;
        this.dom.obj = this;
        this.watches;
        
        // Löschen des Inhalts von this.dom
        this.dom.innerHTML = "";
        
        // Label für Select-Element
        this.table = document.createElement("table");
        this.dom.appendChild(this.table);
        this.tbody = document.createElement("tbody");
        this.tbody.innerHTML = "Time to select a watch!"
        this.table.appendChild(this.tbody);
            }
    load_watch(name) {
        console.log("load_watch", name);
    }
}
export { WatchTable };