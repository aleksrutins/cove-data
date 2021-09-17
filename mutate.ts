Object.prototype.mutate = (val: unknown) => {
    let base = {};
    Object.assign(base, this);
    for(let prop in val) {
        if(val[prop] instanceof MutateFn) {
            base[prop] = val[prop].fn.call(this);
        } else {
            base[prop] = val[prop];
        }
    }
    return base;
}

Array.prototype.mutate = (val: unknown) => {
    return this.map(el => el.mutate(val));
}

export class MutateFn<T> {
    constructor(public fn: () => T);
}

export function _mut<T>(fn: () => T): MutateFn<T> {
    return new MutateFn<T>(fn);
}