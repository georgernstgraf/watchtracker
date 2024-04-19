const { prisma } = require('../lib/db');
const ms = require('ms');
class Measurement {
    #data;
    constructor(data) {
        this.#data = data;
        this.keys = new Set(Object.keys(data));
        this.updates = {};
    }
    updateField(field, value) {
        if (!this.keys.has(field)) {
            throw new Error(`unknown field in Measurement: ${field}`);
        }
        this.updates[field] = value;
    }
    getField(field) {
        return this.#data[field];
    }
    setField(field, value) {
        this.#data[field] = value;
    }
    getData() {
        return { ...this.#data };
    }
    getChangedFields() {
        return Object.keys(this.updates).reduce((changes, key) => {
            if (this.updates[key] !== this.#data[key]) {
                changes[key] = this.updates[key];
            }
            return changes;
        }, {});
    }
    isDirty() {
        const changes = this.getChangedFields();
        return Object.keys(changes).length > 0;
    }
    updateAfterSave(data) {
        this.#data = data;
        this.updates = {};
    }
    static async save(measurement) {
        if (!measurement.isDirty()) {
            console.info(`save measurement: not dirty`);
            return;
        }
        const changes = measurement.getChangedFields();
        const updatedMeasurement = await prisma.measurement.update({
            where: { id: measurement.data.id },
            data: changes
        });
        measurement.updateAfterSave(updatedMeasurement);
    }
}
function calculateDrifts(measurements) {
    if (measurements.length == 0) return;
    measurements[0].updateField('isStart', true);
    for (let i = 1; i < measurements.length; i++) {
        // compare with predecessors
        if (measurements[i].getField('isStart')) continue;
        const measureSpanMS =
            measurements[i].getField('createdAt') -
            measurements[i - 1].getField('createdAt');
        const measureDriftSecs =
            measurements[i].getField('value') -
            measurements[i - 1].getField('value');
        const durationInDays = measureSpanMS / ms('1 day');
        const durationInHours = (measureSpanMS / ms('1 hour')).toFixed(0);
        const diffSekPerDay = (measureDriftSecs / durationInDays).toFixed(1);
        measurements[i].setField(
            'drift',
            `${diffSekPerDay} s/d (${durationInHours}h)`
        );
    }
}
module.exports = { Measurement, calculateDrifts };
