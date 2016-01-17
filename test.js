const Wildgeese = require(".");
const wildgeese = new Wildgeese();

// Register validation rule
// wildgeese.addRule([
//     {
//         name : "required",
//         validate : function (value, ctx) {
//             return (value == null || value.length === 0) ? `Field ${ctx.label} must be required.` : null;
//         }
//     }, {
//         name : "match-with",
//         validate : function (value, ctx) {
//             const target = ctx.args.with;
//             return (value !== ctx.values[target]) ? `${ctx.label} and ${ctx.labels[target]} not matched.` : null;
//         }
//     }, {
//         name : "uniqueUserId",
//         validate : function* (value) {
//             // `database.find` expect returns `Promise`.
//             const matches = yield database.find({userId: value});
//             return matches.length > 0 ? `ID "${value}" already used.` : null;
//         }
//     }
// ]);

// Define validation target fields
const fields = wildgeese.makeFieldSet();

//-- fields.add(name, label, rules);
// fields.add("username", "Username", ["required", "uniqueUserId"]);
fields.add("password", "Password", ["required"]);
// fields.add("password_confirm", "Password confirm", [
//     "required",
//     ["match-with", {with: "password"}] // with options
// ]);

// validate
fields.validate({
    // username: "wild geese",
    // password: "passw0rd",
    // password_confirm: "passw0rd",
})
.then(errors => {
    if (errors) {
        // errors : Object
        // errors.username && console.error("Username errors", errors.username.join(","));
        errors.password && console.error("Password errors:", errors.password.join(","));
        // errors.password_confirm && console.error("Password confirm errors", errors.password_confirm.join(","));
        return;
    }

    console.log("All values correctly.");
})
.catch(e => {
    console.error(e);
})
