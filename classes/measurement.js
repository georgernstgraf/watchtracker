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
        this.#updates[field] = value;
        if (field == 'isStart' && value) {
            this.#volatilesNoPersist['drift'] = 'start';
        }
    }
    setVolatile(field, value) {
        this.#volatilesNoPersist[field] = value;
    }
    getField(field, original = false) {
        //
        if (this.#updates.hasOwnProperty(field) && !original) {
            return this.#updates[field];
        }
        return this.#data[field];
    }

    getPersistedData() {
        return { ...this.#data };
    }
    getUpdatedOnly() {
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
        const updated = this.getUpdatedOnly();
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
    async save() {
        if (!this.isDirty()) {
            console.info(`save measurement: not dirty`);
            return;
        }
        if (this.#data.id) {
            this.updateAfterSave(
                await prisma.measurement.update({
                    where: { id: measurement.data.id },
                    data: this.getUpdatedOnly()
                })
            );
        } else {
            this.updateAfterSave(
                await prisma.measurement.create({
                    data: this.getUpdatedData()
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
    static async setType(measureID, isStart) {
        await prisma.measurement.update({
            where: {
                id: measureID
            },
            data: {
                isStart: isStart
            }
        });
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
