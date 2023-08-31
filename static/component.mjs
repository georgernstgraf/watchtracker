class Component {
    static dirtyColor = "rgb(255, 144, 85)";
    anchor; // DOM-Element, in das ich mich einhänge
    parent; // Component
    children; // Component[]
    dirty; // boolean
    domElement; // wird in child-klasse mit createElement selbst erzeugt

    constructor(parent, anchor) {
        // parent has .domElement
        if (anchor == undefined) {
            this.anchor = parent.domElement;
        } else {
            this.anchor = anchor;
        }
        this.parent = parent;
        this.children = [];
    }
    delete() {
        // tell the parent: remove me
        this.parent.remove(this);
    }
    remove(child) {
        // 1. from domElement
        child.hide();
        // 2. from children array
        let index = this.children.indexOf(child);
        if (index > -1) {
            this.children.splice(index, 1); // 1 -> deleteCount
        }
    }
    display() {
        this.anchor.appendChild(this.domElement);
    }
    hide() {
        this.anchor.removeChild(this.domElement);
    }
    setDirty(dirty = true) {
        this.dirty = dirty;
    }
}
export { Component };
