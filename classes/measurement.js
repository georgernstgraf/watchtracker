const { prisma } = require('../lib/db');
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
function calculateDrifts(modelList) {
    if (modelList.length == 0) return;
    modelList[0].updateField('isStart', true);
    for (let i = 1; i < modelList.length; i++) {
        if (modelList[i].getField('isStart')) continue;
        const measureTime =
            modelList[i].getField('createdAt') -
            modelList[i - 1].getField('createdAt');
        const measureDrift =
            modelList[i].getField('value') - modelList[i - 1].getField('value');
        const durationInDays = measureTime / 86400000;
        const durationInHours = (measureTime / 3600000).toFixed(0);
        const diffSecs = measureDrift;
        const diffSekPerDay = diffSecs / durationInDays;
        const speedType = diffSekPerDay > 0 ? 'schnell' : 'langsam';
        const diffSekPerDayFixed = Math.abs(diffSekPerDay).toFixed(1);
        modelList[i].setField(
            'drift',
            `${diffSekPerDayFixed} s/d (${durationInHours}h) ${speedType}`
        );
    }
}
module.exports = { Measurement, calculateDrifts };
