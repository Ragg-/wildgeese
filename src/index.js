import _ from "lodash";
import co from "co";
import objectCreate from "./object-create";
import i18nInitial from "./i18n-initial";
import FieldSet from "./field-set";
import {validateValue} from "./validate";
import defaultRules from "./default-rules";

export default class Wildgeese {
    /**
     * Validation an value with default rules.
     * (static method `is`, can not using named custom validation rule.)
     *
     * @static
     * @method is
     * @param {Any} value                       validation target value
     * @param {Array<String|Function>} rules    checking rule name or validator function
     * @return {Promise<Array<String> | undefined}  resolve Error messages when `value` has error. undefined otherwise.
     */
    static is(value, rules) {
        const w = new Wildgeese();
        return w.is(value, rules);
    }

    /**
     * @constructor
     * @class Wildgeese
     * @param {I18n2} i18n=i18n2  an i18n-2 instance
     */
    constructor(i18n2 = null) {
        this.i18n = i18n2 || i18nInitial();
        this._config = {};
        this._validators = objectCreate();
        this.addRule(defaultRules);
    }

    /**
     * @class Wildgeese
     */
    get validators() {
        return _.clone(this._validators);
    }

    /**
     * @method is
     * @param {Any} value
     * @param {Array<String|Function>} rules
     * @param {String} label=""
     * @return {Promise<Array<String>>|null} error messages or null when no error.
     */
    is(value, rules = [], label = "") {
        return validateValue(value, rules, this, {label});
    }

    /**
     * @method set
     */
    set(key, value) {
        this._config[key] = value;
    }

    /**
     * @method get
     */
    get(key) {
        if (! key) {
            return _.cloneDeep(this._config);
        }

        return this._config[key];
    }

    /**
     * @param {Object|Array<Object>} rules
     * @param {String} rules.name           validation rule name
     * @param {Function} rules.validate     validator function
     * @param {Boolean} rules.override      override name conflicted rule
     * @param {Boolean} strict=false        throw error rule name is conflicted when true.
     *                                      false to ignore and no adding conflicted rule.
     */
    addRule(rules, strict = false) {
        rules = Array.isArray(rules) ? rules : [rules];

        rules.forEach(rule => {
            if (this._validators[rule.name] && rule.override !== true) {
                if (strict) {
                    throw new Error(`Validation rule name conflicted for "${rule.name}" ` + "if you want overriding, set `override` property in rule definition.");
                }

                return;
            }

            this._validators[rule.name] = co.wrap(rule.validate);
        });
    }

    /**
     * @param {String} ruleName
     * @return {Function}
     */
    getRule(ruleName) {
        return this._validators[ruleName];
    }

    /**
     * @param {Object} <fieldName: rules> field definition `rules` type is `Array<String>|String`
     */
    makeFieldSet() {
        return new FieldSet(this);
    }
}
