import { Component } from './component.mjs';
class DeleteWatch extends Component {
    constructor(parent) {
        // parent has domElement (<div>)
        super(parent);
        this.domElement = this.getButton();
        this.addToDom();
    }
    getButton() {
        let button;
        button = document.createElement('button');
        button.innerHTML = 'Uhr löschen';
        button.addEventListener('click', this.handleClick.bind(this));
        return button;
    }
    handleClick() {
        // TODO
    }
}
export { DeleteWatch };
