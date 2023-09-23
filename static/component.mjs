class Component {
    static dirtyColor = "#ff9055";
    static headerColorMagenta = "#d33682"; /* magenta,  */
    static inputColor = "#f3d283"; /* yellow,  */
    static headerColorGreen = "#859900"; /* green, */
    static invalidColor = "#ff5555"; /* red,  */
    static backgroundColor = "#002b36"; /* dark blue,  */
    anchor; // DOM-Element, in das ich mich einhänge
    parent; // Component
    children; // Component[]
    dirty; // boolean
    domElement; // wird in child-klasse mit document.createElement selbst erzeugt
    isDomChild; // boolean

    constructor(parent, anchor) {
        // parent has .domElement
        if (anchor == undefined) {
            this.anchor = parent.domElement;
        } else {
            this.anchor = anchor;
        }
        this.parent = parent;
        this.children = [];
        this.isDomChild = false;
    }

    delete() {
        // tell the parent: remove me
        this.parent.remove(this);
    }
    remove(child) {
        // WARN not usable in a loop
        // 1. from domElement
        child.removeFromDom();
        // 2. from children array
        let index = this.children.indexOf(child);
        if (index > -1) {
            this.children.splice(index, 1); // 1 -> deleteCount
        }
    }
    display() {
        this.domElement.hidden = false;
    }
    hide() {
        this.domElement.hidden = true;
    }
    addToDom() {
        this.anchor.appendChild(this.domElement);
        this.isDomChild = true;
    }
    removeFromDom() {
        if (this.isDomChild) {
            this.anchor.removeChild(this.domElement);
            this.isDomChild = false;
        } else {
            console.warn("Component.removeFromDom: was not a dom child:");
            console.warn(this.domElement);
        }
    }

    setDirty(dirty = true) {
        this.dirty = dirty;
    }
}
export { Component };
