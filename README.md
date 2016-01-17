# Wildgeese
Validator container for Async Validators.

## Install
```
npm i wildgeese
```

## Usage
``` javascript
const Wildgeese = require("wildgeese");
const wildgeese = new Wildgeese();

// Register validation rule
wildgeese.addRule([
    {
        name : "required",

        // `validate` acce@ts
        validate : function (value) {
            return (value == null || value.length === 0) ? `Field ${this.label} must be required.` : null;
        }
    }, {
        name : "uniqueUserId",
        validate : function* (value) {
            // `database.find` expect returns `Promise`.
            const matches = database.find({userId: value});
            return matches.length > 0 ? `ID ${value} already used.` : null;
        }
    }
]);

```

## API

### validateFunction
Wildgeese give the below two arguments to validate function.
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
