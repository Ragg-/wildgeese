# Wildgeese
Validator container for Async Validators.

```
Currently not implement any validation rules.
```

## Install
```
npm i --save wildgeese
```

## Usage
``` javascript
const Wildgeese = require("Wildgeese");
const wildgeese = new Wildgeese();

// Register validation rule
wildgeese.addRule([
    {
        name : "required",
        validate : function (value, ctx) {
            return (value == null || value.length === 0) ? `Field ${ctx.label} must be required.` : null;
        }
    }, {
        name : "match-with",
        validate : function (value, ctx) {
            const target = ctx.args.with;
            return (value !== ctx.values[target]) ? `${ctx.label} and ${ctx.labels[target]} not matched.` : null;
        }
    }, {
        name : "uniqueUserId",
        validate : function* (value) {
            // `database.find` expect returns `Promise`.
            const matches = yield database.find({userId: value});
            return matches.length > 0 ? `ID "${value}" already used.` : null;
        }
    }
]);

// Define validation target fields
const fields = wildgeese.makeFieldSet();

//-- fields.add(name, label, rules);
fields.add("username", "Username", ["required", "uniqueUserId"]);
fields.add("password", "Password", ["required"]);
fields.add("password_confirm", "Password confirm", [
    "required",
    ["match-with", {with: "password"}] // with options
]);

// validate
fields.validate({
    username: "wild geese",
    password: "passw0rd",
    password_confirm: "passw0rd",
})
.then(errors => {
    if (errors) {
        // errors : Object
        errors.username && console.error("Username errors", errors.username.join(","));
        errors.password && console.error("Password errors", errors.password.join(","));
        errors.password_confirm && console.error("Password confirm errors", errors.password_confirm.join(","));
        return;
    }

    console.log("All values correctly.");
})
.catch(e => {
    console.error(e);
})

```

### Why Wildgeese returns `Promise` when validate?
Validator functions are wrapping by `co.wrap`.
it's assitance for async validator implementation.

## API

### validateFunction
Wildgeese accepts normal `Function` and also `Generator function` as validator function

validator function given the below two arguments and must be return `errorMessage: String` when `value` is invalid.
(if `value` correctly, validator function my be not return anything.)
- `value` : any  
  validation target value

- `context` : Object  
  validation target informations.
  - `args` : Array  
    validation options.
  - `label` : String  
    Human readable field name.
  - `labels` : Object
    Human readable other field labels.
  - `values` : Object  
    other field values.
  - `options` : Object  
    User defined options (see `Wildgeese#get`)


### class `Wildgeese`
**static**
- **is**(value: any, rules:Array&lt;String|Function&gt;)  
  validate `value` with built-in rules.

**instance**
- **is**(value: any, rules: Array&lt;String|Function&gt;) : Promise  
  validate an `value` with `rules`.


- **get**(key: String)  
  get user defined options.
  it's useful validation messages `i18n` support.


- **set**(key: String, value: any)  
  set user defined options.


- **addRule**(rule: Object, strict = false)
- **addRule**(rules: Array&lt;Object&gt;, strict = false)  
  Register validation rule.  
  The `rule` is Object of below structure.
  - `name`: String
  - `validate`: Function(`value`: any, `values`: Object, `options`: Object) : String|Promise  
    function accepts `Function` or `Generator Function`.  
    it's wrapping by `co#wrap` in Wildgeese#addRule
  - `override`: Boolean  
    specify overriding existing validation rule.

- **getRule**(ruleName: String) : Function  
  get `ruleName`ed validator Function.

- **makeFieldSet**() : FieldSet  
  make empty `FieldSet`

### class `FieldSet`
- **clone**() : FieldSet
  create FieldSet clone.


- **add**(fieldName: String, label: String, rules: Array<String|Function>)  
  add field.


- **remove**(fieldName: String)  
  remove field from FieldSet.  

  it's side effecting on that FieldSet instance.  
  if you do not want to give the side effects, use `clone()` method and `remove()`ing to cloned instance.


- **fields**() : Object  
  get defined fields.


- **field**(fieldName) : Object  
  get `fieldName` field definition.


- **validate**(values: Object) : Promise  
  validate fields of `values`.
