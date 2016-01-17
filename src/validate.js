import _ from "lodash";
import co from "co";
import resolveValidator from "./resolve-validator";

async function nextTick() {
    return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * @param {FieldSet} fieldSet
 * @param {Object} values
 * @param {Wildgeese} wildgeese
 * @return {Promise}        reject with error messages Object<fieldName: Array<String>>
 */
export default async function validateFields(fieldSet, values, wildgeese) {
    const fields = fieldSet.fields();

    const errors = {};

    //
    // make getters
    //
    const labelGetter = {};
    Object.keys(fields).forEach(fieldName => {
        const field = fields[fieldName];

        Object.defineProperty(labelGetter, fieldName, {
            enumerable: true,
            value: field.label
        });
    });

    // Make read only values accessor for validator
    const valueGetter = {};
    Object.keys(fields).forEach(fieldName => {
        Object.defineProperty(valueGetter, fieldName, {
            enumerable: true,
            value: values[fieldName]
        });
    });


    //
    // Validation
    //
    var hasFailed = false;

    try {
        await Promise.all(Object.keys(fields).map(fieldName => {
            return new Promise(async (resolve, reject) => {
                await nextTick();

                var fail = false;
                const field = fields[fieldName];
                const value = values[fieldName];

                try {
                    const fieldErrors = await validateValue(value, field.rules, wildgeese, {
                        label : field.label,
                        labels : labelGetter,
                        values : valueGetter,
                    });

                    if (fieldErrors && fieldErrors.length > 0) {
                        errors[fieldName] = errors[fieldName] || [];
                        errors[fieldName].push(...fieldErrors);
                        fail = true;
                    }

                    resolve();
                } catch (e) {
                    reject(e);
                    fail = true;
                }

                hasFailed = hasFailed || fail;
            });
        }));
    } catch (e) {
        throw e;
    }

    if (hasFailed) {
        return errors;
    } else {
        return;
    }
}

/**
 * @param {Any} value
 * @param {Array<String|Function>} rules
 * @param {Wildgeese} wildgeese
 * @param {Object} ctx
 * @param {String} ctx.label  human readable label(field name)
 * @param {Object} ctx.fields  other field values
 * @param {Object} ctx.label  other field labels
 * @return {Promise}        reject with error messages Array<String>
 */
export async function validateValue(value, rules, wildgeese, ctx = {}) {
    var fields = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

    // Normalize ctx
    ctx.labels = ctx.labels || {};
    ctx.values = ctx.values || {};
    ctx.options = ctx.options || {};

    // clone rules
    rules = _.cloneDeep(rules);

    // bind i18n
    const i18n = wildgeese.i18n.__.bind(wildgeese.i18n);

    const results = await Promise.all(rules.map(function(rule) {
        return new Promise(async (resolve, reject) => {
            await nextTick();

            try {
                var ruleName;
                var validator;
                var args;

                // parse rule
                if (Array.isArray(rule)) {
                    // Case of rule is [<String|Function>, ...options];
                    validator = rule.shift();
                    args = rule.shift();
                } else {
                    // Case of rule is <String|Function>
                    validator = rule;
                }

                ruleName = typeof validator === "function" ? validator.name : validator;
                args = args || {};

                // Resolve validator
                validator = resolveValidator(wildgeese, validator);

                // validate
                const givenCtx = {
                    args,
                    __ : i18n,
                    label : ctx.label,
                    labels : ctx.labels,
                    options: wildgeese.get(),
                    values: ctx.values,
                };

                resolve(await validator(value, givenCtx));
            } catch (e) {
                reject(e);
            }
        });
    }));

    const errors = _.filter(results, val => val != null);
    if (errors.length > 0) {
        return errors;
    }

    return;
}
