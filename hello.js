"use strict";
// on changes in the DateFelds, the Abweichung is calculated

// ids aus dem HTML:
// h2
// zeit_0, zeit_1, messdauer, abweichung

let h2 = {
  dom: document.getElementById("h2"),
  val: document.getElementById("h2").innerHTML,
  setValid: function () {
    this.dom.innerHTML = this.val;
    this.dom.style.backgroundColor = null;
  },
  setError: function (msg) {
    this.dom.innerHTML = msg;
    this.dom.style.backgroundColor = "#500";
  }
}

class DateTimePicker {
  _date;
  constructor(id) {
    this.dom = document.getElementById(id);
    this.dom.obj = this;
    this.dom.addEventListener("change", (e) => this.change(e.target));
    this.dom.value = new Date().toJSON().slice(0, 16);
    this._date = new Date(this.dom.value);
  }
  change(target) {
    self = target.obj;
    this._date = new Date(target.value);
    if (isNaN(this._date)) {
      this.dom.style.backgroundColor = "#f55";
    } else {
      this.dom.style.backgroundColor = "#fff";
    }
    haupt();
  }
  get date() {
    return this._date;
  }
}

class Second {
  _secs = 0.0;
  constructor(id) {
    this.dom = document.getElementById(id);
    this.dom.obj = this;
    this.dom.addEventListener("change", (e) => this.change(e.target));
    this.dom.value = "0";
  }
  change(target) {
    self = target.obj;
    this._secs = parseFloat(target.value);
    if (isNaN(this._secs)) {
      this.dom.style.backgroundColor = "#f55";

    } else {
      this.dom.style.backgroundColor = "#fff";
    }
    haupt();
  }
  get secs() {
    return this._secs;
  }
}


function haupt() {
  console.log("haupt: " + Date());
  if (isNaN(zeit_0.date)
    || isNaN(zeit_1.date)
    || isNaN(zeit_0_sec.secs)
    || isNaN(zeit_1_sec.secs)) {
    h2.setError("Bitte alle Felder ausfüllen");
    return;
  }
  h2.setValid();
  let delta = (zeit_1.date - zeit_0.date) / 1000 / 60 / 60 / 24.0;
  let fehler = zeit_1_sec.secs - zeit_0_sec.secs;
  messdauer.innerHTML = `Messung: ${delta.toFixed(2)}days`;
  abweichung.innerHTML = `Abweichung: ${fehler / delta}s`;
}

let zeit_0 = new DateTimePicker("zeit_0");
let zeit_0_sec = new Second("zeit_0_sec");
let zeit_1 = new DateTimePicker("zeit_1");
let zeit_1_sec = new Second("zeit_1_sec");
let messdauer = document.getElementById("messdauer");
let abweichung = document.getElementById("abweichung");
let s, e, ss, ee;


