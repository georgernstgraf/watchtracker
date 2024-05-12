class dbEntity {
    _data;
    _updates;
    constructor(data) {
        this._data = data;
        this._keys = new Set(Object.keys(this._data));
        this._updates = {};
        this._volatilesDisplay = {};
        return new Proxy(this, {
            get: function (target, property) {
                if (typeof target[property] === 'function') {
                    return target[property].bind(target);
                }
                if (property.startsWith('_')) {
                    return target[property];
                }
                if (property in target._updates) {
                    return target._updates[property];
                }
                if (property in target._data) {
                    return target._data[property];
                }
                return undefined;
            },
            set: function (target, property, value) {
                target._updates[property] = value;
                return true;
            }
        });
    }
    patch(data) {
        for (let key in data) {
            this[key] = data;
        }
    }
    updateAfterSave(data) {
        this._data = data;
        this._updates = {};
    }
    getOnlyUpdatedData() {
        // look in #updates whether the same key in #data has a different _value_
        // return the object with the updates
        return Object.keys(this._updates).reduce((changes, key) => {
            if (this._updates[key] !== this._data[key]) {
                changes[key] = this._updates[key];
            }
            return changes;
        }, {});
    }
    getUpdatedData() {
        const data = { ...this._data };
        const updated = this.getOnlyUpdatedData();
        Object.keys(updated).forEach((k) => {
            data[k] = updated[k];
        });
        return data;
    }
    isDirty() {
        return (
            Object.keys(this.getUpdatedData()).length > 0 || !this._data['id']
        );
    }
    toString() {
        console.log(JSON.stringify(this, null, 3));
    }
}
module.exports = dbEntity;
