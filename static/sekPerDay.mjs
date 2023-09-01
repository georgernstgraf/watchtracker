import { Component } from "./component.mjs";
class SekPerDay extends Component {
    durationInDays;
    diffSecs;
    diffSekPerDay;
    speedType;
    outText;
    constructor(parent, anchor) {
        super(parent, anchor);
        this.domElement = document.createElement("td");
        this.domElement.classList.add("sekPerDay");
        this.anchor.appendChild(this.domElement);
        this.domElement.obj = this;
    }
    calculate(prev) {
        let mine = this.parent;
        this.durationInDays = (mine.date - prev.date) / 86400000; // ms per day
        this.diffSecs = mine.offsetSecs - prev.offsetSecs;
        this.diffSekPerDay = this.diffSecs / this.durationInDays;
        this.speedType = this.diffSekPerDay > 0 ? "schnell" : "langsam";
        this.diffSekPerDay = Math.abs(this.diffSekPerDay);
        this.outText = this.diffSekPerDay.toFixed(1);
    }
    fill(prev) {
        this.calculate(prev);
        this.domElement.innerHTML = `${this.speedType} ${this.outText}`;
    }
    fullFill(prev) {
        this.calculate(prev);
        let dauer = this.durationInDays.toFixed(1);
        this.domElement.setAttribute("colspan", "3");
        this.domElement.style.textAlign = "center";
        this.domElement.style.color = "#d33682";
        this.domElement.style.fontSize = "larger";
        this.domElement.style.fontWeight = "bold";
        this.domElement.innerHTML = `(Dauer: ${dauer} Tage, Gang: ${this.diffSecs}   =>   ${this.speedType} ${this.outText} / Tag)`;
    }
}
export { SekPerDay };
