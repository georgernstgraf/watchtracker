const { prisma } = require('./lib/db');

class Measurement {
    constructor(data) {
        this.data = data;
        this.keys = new Set(Object.keys(data));
        this.updates = {};
    }

    update(field, value) {
        if (!this.keys.has(field)) {
            throw new Error(`unknown field in Measurement: ${field}`);
        }
        this.updates[field] = value;
    }

    getChangedFields() {
        return Object.keys(this.updates).reduce((changes, key) => {
            if (this.updates[key] !== this.updates[key]) {
                changes[key] = this.updates[key];
            }
            return changes;
        }, {});
    }

    isDirty() {
        const changes = this.getChangedFields();
        return Object.keys(changes).length > 0;
    }
}

class MeasurementRepository {
    async findFirst() {
        const data = await prisma.measurement.findFirst();
        return new Measurement(data);
    }

    async save(measurement) {
        if (!measurement.isDirty()) {
            console.log('No changes detected');
            return;
        }

        const changes = measurement.getChangedFields();
        const updatedMeasurement = await prisma.measurement.update({
            where: { id: measurement.data.id },
            data: changes,
        });

        measurement.originalData = { ...measurement.data };
        return updatedMeasurement;
    }
}

async function main() {
    const repo = new MeasurementRepository();
    const m = await repo.findFirst();

    m.update('value', 123);

    await repo.save(m);
}

main().then(() => prisma.$disconnect());
