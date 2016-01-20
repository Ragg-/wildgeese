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
 * @param {Boolean|Array<String>|String} presentOnly  when true only validate presented fields.
 * @return {Promise}        reject with error messages Object<fieldName: Array<String>>
 */
export default async function validateFields(fieldSet, values, wildgeese, presentOnly = false) {
    const fields = fieldSet.fields();
    const errors = {};
    var willValidateFields;

    // decide validate fields
    switch (true) {
        case Array.isArray(presentOnly): willValidateFields = presentOnly; break;
        case presentOnly === true: willValidateFields = Object.keys(values); break;
        case typeof presentOnly === "string" : willValidateFields = [presentOnly]; break;
        default: willValidateFields = Object.keys(fields);
    }

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
        await Promise.all(willValidateFields.map(fieldName => {
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
    const requiredValidator = wildgeese.getRule("required");
    const isOptional = rules.indexOf("required") === -1;

    // Normalize ctx
    ctx.labels = ctx.labels || {};
    ctx.values = ctx.values || {};
    ctx.options = ctx.options || {};

    // clone rules
    rules = _.cloneDeep(rules);

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
                    label : ctx.label,
                    labels : ctx.labels,
                    options: wildgeese.get(),
                    values: ctx.values,
                };

                // Ignore validation when optional field with empty value.
                const isEmptyValue = !!(await requiredValidator(value, givenCtx))
                if (isOptional && isEmptyValue) return resolve();

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
