class Component {
    parentDomAnchor; // DOM-Element, in das ich mich einhänge
    parent; // Component
    children; // Component[]

    domElement; // wird in child-klasse mit createElement selbst erzeugt

    constructor(parent, parentDomAnchor) {
        // parent has .domElement
        if (parentDomAnchor == undefined) {
            this.parentDomAnchor = parent.domElement;
        } else {
            this.parentDomAnchor = parentDomAnchor;
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
        this.parentDomAnchor.appendChild(this.domElement);
    }
    hide() {
        this.parentDomAnchor.removeChild(this.domElement);
    }
}
export { Component };
