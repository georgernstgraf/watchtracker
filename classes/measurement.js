const { prisma } = require('../lib/db');
const ms = require('ms');
const dbEntity = require('./dbEntity');
class Measurement extends dbEntity {
    #volatilesNoPersist;
    constructor(data) {
        super(data);
        this.#volatilesNoPersist = {};
        if (data.isStart) {
            this.#volatilesNoPersist['drift'] = 'start';
        }
    }
    //@override
    updateField(field, value) {
        if (!this.keys.has(field) || ['id', 'watchId'].includes(field)) {
            throw new Error(
                `unknown or forbidden field in Measurement: ${field}`
            );
        }
        switch (field) {
            case 'isStart':
                value = JSON.parse(value);
                break;
            case 'value':
                value = Number.parseInt(value);
                break;
            case 'createdAt':
                value = new Date(value);
                break;
        }
        this.updates[field] = value;
        if (field == 'isStart' && value) {
            this.#volatilesNoPersist['drift'] = 'start';
        }
    }

    setVolatile(field, value) {
        this.#volatilesNoPersist[field] = value;
    }
    getVolatile(field) {
        return this.#volatilesNoPersist[field];
    }

    getDisplayData(tzOffssetMinutes = 0) {
        // TODO configure this per-user
        const data = this.getUpdatedData();
        Object.keys(this.#volatilesNoPersist).forEach(
            (k) => (data[k] = this.#volatilesNoPersist[k])
        );
        if (data.createdAt) {
            data.createdAt.setMinutes(
                data.createdAt.getMinutes() + tzOffssetMinutes
            );
        }
        return data;
    }

    static async save(measure) {
        if (!measure.isDirty()) {
            console.info(`save measurement: not dirty`);
            return;
        }
        if (measure.data.id) {
            measure.updateAfterSave(
                await prisma.measurement.update({
                    where: { id: measure.data.id },
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
                        user: { select: { name: true } }
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
    static async lastForUserName(userName) {
        return this.instances(
            await prisma.measurement.findMany({
                where: {
                    watch: {
                        lastUser: { name: userName }
                    }
                }
            })
        );
    }
    static instances(rawMeasurements) {
        if (!rawMeasurements) return;
        return rawMeasurements.map((m) => new Measurement(m));
    }
    static overallMeasureWithCalcDrift(measureModels) {
        return Measurement.calculateDrifts(measureModels);
    }
    static getDisplayDatas(measureModels) {
        return measureModels.map((e) => e.getDisplayData(watch.user.tzOffset));
    }

    static calculateDrifts(measurements) {
        if (measurements.length == 0) return;
        // das letzte ist das älteste kleinste (sort desc) und immer START
        measurements.at(-1).updateField('isStart', true);
        for (let i = measurements.length - 2; i >= 0; i--) {
            // compare with predecessors
            if (measurements[i].getField('isStart')) {
                continue;
            }
            const durationMS =
                measurements[i].getField('createdAt') -
                measurements[i + 1].getField('createdAt');
            const driftSeks =
                measurements[i].getField('value') -
                measurements[i + 1].getField('value');
            const durationDays = durationMS / ms('1 day');
            const durationHours = (durationMS / ms('1 hour')).toFixed(0);
            const driftSeksPerDay = (driftSeks / durationDays).toFixed(1);
            const driftSeksPerDayDisplay =
                driftSeksPerDay > 0
                    ? `+${driftSeksPerDay}`
                    : `${driftSeksPerDay}`;
            measurements[i].setVolatile(
                'driftDisplay',
                `${driftSeksPerDayDisplay} s/d (${durationHours}h)`
            );
            measurements[i].setVolatile('driftMath', {
                durationDays: durationDays,
                driftSeks: driftSeks
            });
        }
        const onlyMaths = measurements
            .map((_) => _.getVolatile('driftMath'))
            .filter((_) => !!_);
        const overallMeasure = onlyMaths.reduce((akku, m) => {
            return {
                durationDays: akku.durationDays + m.durationDays,
                driftSeks: akku.driftSeks + m.driftSeks
            };
        });
        const driftSeksPerDay =
            overallMeasure.driftSeks / overallMeasure.durationDays;
        overallMeasure.niceDisplay =
            driftSeksPerDay > 0
                ? `${driftSeksPerDay.toFixed(1)} s/d schnell`
                : `${(-driftSeksPerDay).toFixed(1)} s/d langsam`;
        overallMeasure.durationDays = overallMeasure.durationDays.toFixed(0);
        return overallMeasure;
    }
}
module.exports = Measurement;
