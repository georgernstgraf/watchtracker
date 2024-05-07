class dbEntity {
    data;
    keys;
    updates;

    constructor(data) {
        this.data = data;
        this.keys = new Set(Object.keys(this.data));
        this.updates = {};
    }
    patch(data) {
        for (let key in data) {
            this.updateField(key, data[key]);
        }
    }
    updateField(field, value) {
        if (!this.keys.has(field) || ['id'].includes(field)) {
            throw new Error(`unknown or forbidden field: ${field}`);
        }
        this.updates[field] = value;
    }
    updateAfterSave(data) {
        this.data = data;
        this.updates = {};
    }
    getPersistedData() {
        return { ...this.data };
    }
    getField(field, original = false) {
        //
        if (this.updates.hasOwnProperty(field) && !original) {
            return this.updates[field];
        }
        return this.data[field];
    }
    patch(data) {
        for (let key in data) {
            this.updateField(key, data[key]);
        }
    }
    getOnlyUpdatedData() {
        // look in #updates whether the same key in #data has a different _value_
        // return the object with the updates
        return Object.keys(this.updates).reduce((changes, key) => {
            if (this.updates[key] !== this.data[key]) {
                changes[key] = this.updates[key];
            }
            return changes;
        }, {});
    }
    getUpdatedData() {
        const data = { ...this.data };
        const updated = this.getOnlyUpdatedData();
        Object.keys(updated).forEach((k) => {
            data[k] = updated[k];
        });
        return data;
    }
    isDirty() {
        return (
            Object.keys(this.getUpdatedData()).length > 0 || !this.data['id']
        );
    }
    toString() {
        console.log(JSON.stringify(this.getDisplayData(), null, 3));
    }
}
module.exports = dbEntity;
