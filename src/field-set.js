import _ from "lodash";
import objectCreate from "./object-create";
import validate from "./validate";

/**
 * Validation fields definition.
 * @class Fields
 */
export default class FieldSet {
    /**
     * @class Fields
     * @constructor
     * @param {Wildgeese} wildgeese     instance of wildgeese
     */
    constructor(wildgeese) {
        this._fields = objectCreate();
        this._wildgeese = wildgeese;
    }

    /**
     * @return {FieldSet}
     */
    clone() {
        const f = new FieldSet(this._wildgeese);
        f._fields = _.cloneDeep(this._fields);
        return f;
    }

    /**
     * @method add
     * @param {String} fieldName        name of adding field
     * @param {String} label            Human readable field label
     * @param {Array<String|Function>}  validation rule names
     */
    add(fieldName, label, rules) {
        label = label || fieldName;
        this._fields[fieldName] = {name : fieldName, label, rules};
    }

    /**
     * @method remove
     * @param {String} fieldName        name of field to remove
     */
    remove(fieldName) {
        delete this._fields[fieldName];
    }

    /**
     * @return {Object}
     */
    fields() {
        return _.cloneDeep(this._fields);
    }

    /**
     * @method field
     * @param {String} fieldName        name of field to get
     * @return {Object}
     */
    field(fieldName) {
        return _.cloneDeep(this._fields[fieldName]);
    }

    /**
     * @method validate
     * @param {Object} values                   values to validation <fieldName : value>
     * @param {Booelan} presentOnly             validate only presented fields
     * @return {Promise} reject with error messages Object<fieldName: Array<String>>
     */
    validate(values, presentOnly = false) {
        return validate(this, values, this._wildgeese, presentOnly);
    }
}
