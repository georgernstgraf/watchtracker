class dbEntity {
    constructor(data, prismaModel) {
        if ((!data) instanceof Object)
            throw new TypeError('data must be Object');
        this._constrData = data;
        this._isDirty = !('id' in data);
        this._updates = {};
        this._extra = {};
        const modelActions = new Set(Object.keys(prismaModel));
        if (
            !['create', 'findMany', 'update', 'delete'].every((x) =>
                modelActions.has(x)
            )
        )
            throw new TypeError('prismaModel must be supplied');
        this._prismaModel = prismaModel;
        this._dbFields = new Set();
        Object.keys(prismaModel.fields).forEach((key) => {
            this._dbFields.add(key);
            if (key.endsWith('Id')) {
                this._dbFields.add(key.slice(0, key.length - 2));
            }
        });
        return new Proxy(this, {
            get: (target, property) => {
                if (property in target._extra) return target._extra[property];
                if (property in target._updates)
                    return target._updates[property];
                if (property in target._constrData)
                    return target._constrData[property];
                return Reflect.get(target, property);
            },
            set: function (target, property, value) {
                if (property.startsWith('_'))
                    return Reflect.set(target, property, value);
                if (property === 'id')
                    throw new Error(`unwilling to set a new ${property}`);
                if (target._constrData[property] === value) return true; // nothing changed
                let success = true;
                if (target._dbFields.has(property)) {
                    success &&= Reflect.set(target._updates, property, value);
                    target._isDirty = true;
                } else {
                    success &&= Reflect.set(target._extra, property, value);
                }
                return success;
            }
        });
    }
    patch(data) {
        Object.assign(this, data);
    }
    updateAfterSave(data) {
        this._constrData = data;
        this._updates = {};
    }
    getOnlyUpdatedData() {
        return this._updates;
    }
    async save() {
        if (!this.isDirty()) return;
        if (this.id) {
            this.updateAfterSave(
                await this._prismaModel.update({
                    where: { id: this.id },
                    data: this.getOnlyUpdatedData()
                })
            );
        } else {
            this.updateAfterSave(
                await this._prismaModel.create({
                    data: this.getCurrentData()
                })
            );
        }
    }

    getCurrentData() {
        const data = { ...this._constrData };
        const updated = this.getOnlyUpdatedData();
        Object.keys(updated).forEach((k) => {
            data[k] = updated[k];
        });
        return data;
    }
    isDirty() {
        return this._isDirty;
    }
    toString() {
        console.log(JSON.stringify(this, null, 3));
    }
}
module.exports = dbEntity;
