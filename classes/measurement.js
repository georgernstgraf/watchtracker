const { prisma } = require('../lib/db');
const ms = require('ms');
class Measurement {
    #data;
    #updates;
    #volatilesNoPersist;
    #keys;
    constructor(data) {
        this.#data = data;
        this.#keys = new Set(Object.keys(data));
        this.#updates = {};
        this.#volatilesNoPersist = {};
        if (data.isStart) {
            this.#volatilesNoPersist['drift'] = 'start';
        }
    }
    updateField(field, value) {
        if (!this.#keys.has(field) || ['id', 'watchId'].includes(field)) {
            throw new Error(
                `unknown or forbidden field in Measurement: ${field}`
            );
        }
        switch (field) {
            case 'isStart': value = JSON.parse(value);
        }
        this.#updates[field] = value;
        if (field == 'isStart' && value) {
            this.#volatilesNoPersist['drift'] = 'start';
        }
    }
    getField(field, original = false) {
        //
        if (this.#updates.hasOwnProperty(field) && !original) {
            return this.#updates[field];
        }
        return this.#data[field];
    }
    patch(data) {
        for (let key in data) {
            this.updateField(key, data[key]);
        }
    }
    setVolatile(field, value) {
        this.#volatilesNoPersist[field] = value;
    }

    getPersistedData() {
        return { ...this.#data };
    }
    getOnlyUpdatedData() {
        // look in #updates whether the same key in #data has a different _value_
        // return the object with the updates
        return Object.keys(this.#updates).reduce((changes, key) => {
            if (this.#updates[key] !== this.#data[key]) {
                changes[key] = this.#updates[key];
            }
            return changes;
        }, {});
    }
    getUpdatedData() {
        const data = { ...this.#data };
        const updated = this.getOnlyUpdatedData();
        Object.keys(updated).forEach((k) => {
            data[k] = updated[k];
        });
        return data;
    }
    getDisplayData(tzOffssetMinutes = 0) {
        // TODO configure this per-user
        const data = this.getUpdatedData();
        Object.keys(this.#volatilesNoPersist).forEach(
            (k) => (data[k] = this.#volatilesNoPersist[k])
        );
        const createdUTC = data.createdAt;
        if (createdUTC) {
            data.createdAt = new Date(
                createdUTC - ms(`${tzOffssetMinutes} minutes`)
            );
        }
        return data;
    }
    isDirty() {
        return (
            Object.keys(this.getUpdatedData()).length > 0 || !this.#data['id']
        );
    }
    updateAfterSave(data) {
        this.#data = data;
        this.#updates = {};
    }
    toString() {
        console.log(JSON.stringify(this.getDisplayData(), null, 3));
    }
    static async save(measure) {
        if (!measure.isDirty()) {
            console.info(`save measurement: not dirty`);
            return;
        }
        if (measure.#data.id) {
            measure.updateAfterSave(
                await prisma.measurement.update({
                    where: { id: measure.#data.id },
                    data: measure.getOnlyUpdatedData()
                })
            );
        } else {
            measure.updateAfterSave(
                await prisma.measurement.create({
                    data: measure.getUpdatedData()
                })
            );
        }
    }
    static async watchIdForMeasureOfUser(measureId, user) {
        const data = await prisma.measurement.findUnique({
            where: { id: measureId },
            select: {
                watch: {
                    select: {
                        user: { select: { name: true } },
                        id: true
                    }
                }
            }
        });
        return data.watch.user.name === user ? data.watch.id : null;
    }
    static async getUserMeasurement(user, measureId) {
        const measure = await prisma.measurement.findUnique({
            where: { id: measureId },
            include: {
                watch: {
                    select: {
                        user: { select: { name: true } },
                    }
                }
            }
        });
        if (!measure || measure.watch.user.name !== user) {
            return;
        }
        return new Measurement(measure);
    }
    static async delete(id) {
        return await prisma.measurement.delete({ where: { id: id } });
    }
    static calculateDrifts(measurements) {
        if (measurements.length == 0) return;
        // die letzten werden die ersten sein
        measurements.at(-1).updateField('isStart', true);
        for (let i = measurements.length - 2; i >= 0; i--) {
            // compare with predecessors
            if (measurements[i].getField('isStart')) {
                continue;
            }
            const measureSpanMS =
                measurements[i + 1].getField('createdAt') -
                measurements[i].getField('createdAt');
            const measureDriftSecs =
                measurements[i + 1].getField('value') -
                measurements[i].getField('value');
            const durationInDays = measureSpanMS / ms('1 day');
            const durationInHours = (measureSpanMS / ms('1 hour')).toFixed(0);
            const diffSekPerDay = (measureDriftSecs / durationInDays).toFixed(1);
            const diffSekPerDayDisplay =
                diffSekPerDay > 0 ? `+${diffSekPerDay}` : `${diffSekPerDay}`;
            measurements[i].setVolatile(
                'drift',
                `${diffSekPerDayDisplay} s/d (${durationInHours}h)`
            );
        }
    }
}
module.exports = Measurement;
