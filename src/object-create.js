export default function objectCreate() {
    if (Object.create) {
        return Object.create(null);
    }

    const o = {};
    o.__proto__ = null;
    return o;
}
