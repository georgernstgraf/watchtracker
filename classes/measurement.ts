const prisma = require('../lib/db');
const ms = require('ms');
const TimeZone = require('./timeZone');
const dbEntity = require('./dbEntity');
const hb = require('handlebars');
class Measurement extends dbEntity {
    constructor(data) {
        super(data, prisma.measurement);
        if (data.isStart) {
            this['drift'] = 'start';
        }
        return new Proxy(this, {
            set: function (target, property, value) {
                switch (property) {
                    case 'isStart':
                        value = JSON.parse(value);
                        break;
                    case 'value':
                        value = Number.parseInt(value);
                        if (isNaN(value)) {
                            return false;
                        }
                        break;
                    case 'createdAt':  // I get a 16-char localtime thinggy here like "2024-05-24T19:29"
                        const newDate = TimeZone.from16(value, target.watch.user.timeZone);
                        if (newDate.invalid) { throw new Error('invalid Date'); }
                        value = newDate;
                        break;
                }
                let success = true;
                success &&= Reflect.set(target, property, value);
                if (property == 'isStart' && value) {
                    success &&= Reflect.set(target, 'drift', 'start');
                }
                return success;
            }
        });
    }
    //@override

    setDisplayData(timeZone) {
        if (!timeZone) { throw new Error('timeZone is required'); }
        this.createdAt16 = TimeZone.get16(this.createdAt, timeZone);
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
        return data.watch.user.name === user.name ? data.watch.id : null;
    }
    static async getUserMeasurement(user, measureId) {
        const measure = await prisma.measurement.findUnique({
            where: { id: measureId },
            include: {
                watch: {
                    select: {
                        user: true
                    }
                }
            }
        });
        if (!measure || measure.watch.user.name !== user.name) {
            return;
        }
        return new Measurement(measure);
    }
    static async delete(id) {
        return await prisma.measurement.delete({ where: { id: id } });
    }
    static instances(rawMeasurements) {
        if (!rawMeasurements) return;
        return rawMeasurements.map((m) => new Measurement(m));
    }
    static overallMeasureWithCalcDrift(measureModels) {
        return Measurement.calculateDrifts(measureModels);
    }
    static calculateDrifts(measurements) {
        if (measurements.length == 0) return;
        // das letzte ist das älteste kleinste (sort desc) und immer START
        measurements.at(-1)['isStart'] = true;
        measurements.at(-1)['driftDisplay'] = 'n/a';
        for (let i = measurements.length - 2; i >= 0; i--) {
            // compare with predecessors
            if (measurements[i]['isStart']) {
                measurements[i]['driftDisplay'] = 'n/a';
                continue;
            }
            const durationMS =
                measurements[i]['createdAt'] - measurements[i + 1]['createdAt'];
            const driftSeks =
                measurements[i]['value'] - measurements[i + 1]['value'];
            const durationDays = durationMS / ms('1 day');
            const durationHours = Math.round(durationMS / ms('1 hour'));
            const durationDisplay =
                durationHours < 72
                    ? `${durationHours}h`
                    : `${Math.round(durationHours / 24)}d`;
            const driftSeksPerDay = (driftSeks / durationDays).toFixed(1);
            const driftSeksPerDayDisplay =
                driftSeksPerDay > 0
                    ? `+${driftSeksPerDay}`
                    : `${driftSeksPerDay}`;
            measurements[i]['driftDisplay'] =
                new hb.SafeString(`<strong>${driftSeksPerDayDisplay} s/d</strong> (${durationDisplay})`);
            measurements[i]['driftMath'] = {
                durationDays: durationDays,
                driftSeks: driftSeks
            };
        }
        const onlyMaths = measurements
            .map((_) => _['driftMath'])
            .filter((_) => !!_);
        const overallMeasure = onlyMaths.reduce(
            (akku, m) => {
                return {
                    durationDays: akku.durationDays + m.durationDays,
                    driftSeks: akku.driftSeks + m.driftSeks
                };
            },
            { durationDays: 0, driftSeks: 0 }
        );
        const driftSeksPerDay =
            overallMeasure.driftSeks / overallMeasure.durationDays;
        overallMeasure.niceDisplay =
            driftSeksPerDay >= 0
                ? `${driftSeksPerDay.toFixed(1)} s/d fast`
                : `${(-driftSeksPerDay).toFixed(1)} s/d slow`;
        overallMeasure.durationDays = overallMeasure.durationDays.toFixed(0);
        return overallMeasure;
    }
}
module.exports = Measurement;
