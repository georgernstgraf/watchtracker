import { Component } from "./component.mjs";
class SekPerDay extends Component {
    durationInDays;
    diffSecs;
    diffSekPerDay;
    speedType;
    diffSekPerDayFixed;
    constructor(parent, anchor) {
        super(parent, anchor);
        this.domElement = document.createElement("td");
        this.domElement.classList.add("sekPerDay");
        this.anchor.appendChild(this.domElement);
        this.domElement.obj = this;
    }
    calculate(prev) {
        const mine = this.parent;
        this.diffSecs = mine.offsetSecs - prev.offsetSecs;
        this.calculateFromVals(
            mine.date - prev.date,
            mine.offsetSecs - prev.offsetSecs
        );
    }
    calculateFromVals(periodLen, drift) {
        this.durationInDays = periodLen / 86400000;
        this.durationInHours = (periodLen / 3600000).toFixed(0);
        this.dauer = this.durationInDays.toFixed(1);
        this.diffSecs = drift;
        this.diffSekPerDay = this.diffSecs / this.durationInDays;
        this.speedType = this.diffSekPerDay > 0 ? "schnell" : "langsam";
        this.diffSekPerDay = Math.abs(this.diffSekPerDay);
        this.diffSekPerDayFixed = this.diffSekPerDay.toFixed(1);
    }
    setContent(text) {
        this.domElement.innerHTML = text;
    }
    fill(prev) {
        this.calculate(prev);
        this.setContent(
            `${this.diffSekPerDayFixed} s/d (${this.durationInHours}h) ${this.speedType}`
        );
    }
    makeBold() {
        this.domElement.colSpan = 4;
        this.domElement.style.textAlign = "center";
        this.domElement.style.color = this.constructor.headerColorMagenta;
        this.domElement.style.fontSize = "larger";
        this.domElement.style.fontWeight = "bold";
    }
    fullFill(periodLen, drift) {
        this.calculateFromVals(periodLen, drift);
        this.setContent(
            `(Dauer: ${this.dauer} Tage, Drift: ${this.diffSecs} Sek   =>   ${this.diffSekPerDayFixed} s/d ${this.speedType})`
        );
    }
}
export { SekPerDay };
