const validator = require("validator");

module.exports = [
    {
        name : "required",
        validate : (val, ctx) => {
            if (val == null || val === "" || (val.length != null && val.length === 0)) {
                return ctx.__("required", ctx.label);
            }
        }
    },
    {
        name : "equalsWith",
        validate : (val, ctx) => {
            const target = ctx.args;
            if (val !== ctx.values[target]) {
                return ctx.__("equalsWith", ctx.label, ctx.labels[target]);
            }
        }
    }
];

const noArgs = {
    "alphaOnly"         : "isAlpha",
    "alphaNumericOnly"  : "isAlphanumeric",
    "asciiOnly"         : "isAscii",
    "base64"            : "isBase64",
    "boolean"           : "isBoolean",
    "creditCard"        : "isCreditCard",
    "date"              : "isDate",
    "decimal"           : "isDecimal",
    "fullWidth"         : "isFullWidth",
    "halfWidth"         : "isHalfWidth",
    "hexColor"          : "isHexColor",
    "hexadecimal"       : "isHexadecimal",
    "ISIN"              : "isISIN",
    "ISO8601"           : "isISO8601",
    "json"              : "isJSON",
    "lowercase"         : "isLowercase",
    "macAddress"        : "isMACAddress",
    "mongoId"           : "isMongoId",
    "multibyte"         : "isMultibyte",
    "null"              : "isNull",
    "numeric"           : "isNumeric",
    "surrogatePair"     : "isSurrogatePair",
    "url"               : "isURL",
    "uppercase"         : "isUppercase",
    "variableWidth"     : "isVariableWidth",
}

Object.keys(noArgs).forEach(ruleName => {
    const method = withAInstance(ruleName);

    module.exports.push({
        name : ruleName,
        validate : (val, ctx) => {
            if (! validator[method](val)) {
                return ctx.__(ruleName, ctx.label);
            }
        }
    })
});

const withAInstance = {
    "contains"      : "contains",
    "equals"        : "equals",
    "afterDateOf"   : "isAfter",
    "beforeDateOf"  : "isBefore",
    "currency"      : "isCurrency",
    "divisibleBy"   : "isDivisibleBy",
    "email"         : "isEmail",
    "fqdn"          : "isFQDN",
    "float"         : "isFloat",
    "ip"            : "isIP",
    "isbn"          : "isISBN",
    "in"            : "isIn",
    "int"           : "isInt",
    "mobilePhone"   : "isMobilePhone",
    "uuid"          : "isUUID",
    "whiteListed"   : "isWhitelisted",
    // matches accepts third argument for RegExp's modifier but wildgeese accepts Regexp
    "matches"       : "matches",
};

Object.keys(withAInstance).forEach(ruleName => {
    const method = withAInstance(ruleName);

    module.exports.push({
        name : ruleName,
        validate : (val, ctx) => {
            if (! validator[method](val, ctx.args)) {
                return ctx.__(ruleName, ctx.label, ctx.args);
            }
        }
    })
});

// ireguler patterns
module.exports.push(
    {
        name : "byteLength",
        validate : (val, ctx) => {
            if (! validator[method](val, ctx.args)) {
                return ctx.__(ruleName, ctx.label);
            }
        }
    },
    {
        name : "length",
        validate : (val, ctx) => {
            if (! validator.isLength(val, ctx.args.min, ctx.args.max)) {
                if (ctx.args.max != null) {
                    return (ctx.args.min !== 0) ?
                        ctx.__("length_with_max", ctx.label, ctx.args.min, ctx.args.max)
                        : ctx.__("length_with_max_no_min");
                }
                else {
                    return ctx.__("length", ctx.label);
                }
            }
        }
    },

    // import from validator
    // {
    //     name : "containes",
    //     validate : (val, ctx) => {
    //         if (! validator.contains(val, ctx.args)) {
    //             return ctx.__("containes", ctx.label, ctx.args);
    //         }
    //     }
    // },
    // {
    //     name : "equals",
    //     validate : (val, ctx) => {
    //         if (! validator.equals(val, ctx.args)) {
    //             return ctx.__("equals", ctx.label, ctx.args);
    //         }
    //     }
    // },
    // {
    //     name : "afterDateOf",
    //     validate : (val, ctx) => {
    //         if (! validator.isAfter(val, ctx.args)) {
    //             return ctx.__("afterDateOf", ctx.label, ctx.args);
    //         }
    //     }
    // },
    // {
    //     name : "alphaOnly",
    //     validate : (val, ctx) => {
    //         if(! validator.isAlpha(val)) {
    //             return ctx.__("alphaOnly", ctx.label);
    //         }
    //     }
    // },
    // {
    //     name : "alphaNumericOnly",
    //     validate : (val, ctx) => {
    //         if (! validator.isAlphanumeric(val)) {
    //             return ctx.__("alphaNumericOnly", ctx.label);
    //         }
    //     }
    // },
    // {
    //     name : "asciiOnly",
    //     validate : (val, ctx) => {
    //         if (! validator)
    //     }
    // },
    // {
    //     name : "",
    //     validate : (val, ctx) => {
    //
    //     }
    // },
    // {
    //     name : "",
    //     validate : (val, ctx) => {
    //
    //     }
    // },
];
