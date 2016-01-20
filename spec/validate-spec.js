describe("Validate Specs", () => {
    //
    // Initialize wildgeese
    //
    const wildgeese = new Wildgeese();

    // set rules
    wildgeese.addRule([{
        name : "required",
        validate : (val, ctx) => {
            return val == null || val == "" ? `${ctx.label} must be required.` : null;
        }
    }, {
        name : "--match-with",
        validate : (val, ctx) => {
            const target = ctx.args.target;
            return !val || val !== ctx.values[target] ? `${ctx.label} and ${ctx.labels[target]} not matched.` : null;
        }
    }]);

    describe("#validateFields", () => {
        // define fields
        const fieldSet = wildgeese.makeFieldSet();
        fieldSet.add("name", "Name", ["required"]);
        fieldSet.add("password", "Password", ["required"]);
        fieldSet.add("password_confirm", "Confirm Password", [
            "required",
            ["--match-with", {target: "password"}]
        ]);

        //
        // Tests
        //

        it("Should validate fields", next => {
                fieldSet.validate({
                    name: "hi",
                    password: "_",
                    password_confirm: "_",
                })
                .then(errors => {
                    expect(errors).to.be.equal(undefined);
                    next();
                })
                .catch(next);
        });


        it("Should fails validate fields with Label", next => {
            fieldSet.validate({name: ""}).then(errors => {
                expect(errors).to.eql({
                    name: ["Name must be required."],
                    password: ["Password must be required."],
                    password_confirm: [
                        "Confirm Password must be required.",
                        "Confirm Password and Password not matched."
                    ],
                });

                next();
            })
            .catch(next);
        });


        it("Should given valid context in 2nd argument", next => {
            const spy = sinon.spy();

            // Set config
            wildgeese.set("context-test", {lang: "ja"});

            wildgeese.addRule({
                name : "--test-context",
                validate : spy
            });

            // Add testing field
            const _fieldSet = fieldSet.clone();
            _fieldSet.add("spy", "Spy", [["--test-context", {with: "spy"}]]);

            _fieldSet.validate({
                name : "wild geese",
                password: "w11d g33s3",
                password_confirm: "w11d g33s3",
                spy : "spy",
            })
            .then(errors => {
                const ctx = spy.args[0][1];

                expect(errors).to.be(undefined);

                expect(ctx.label).to.be("Spy");
                expect(ctx.labels).to.be.eql({
                    name: "Name",
                    password: "Password",
                    password_confirm: "Confirm Password",
                    spy: "Spy"
                });

                expect(ctx.options["context-test"]).to.be.eql({lang: "ja"});

                expect(ctx.values).to.be.eql({
                    name: "wild geese",
                    password: "w11d g33s3",
                    password_confirm: "w11d g33s3",
                    spy : "spy"
                });

                expect(ctx.args).to.be.eql({with: "spy"});
                next();
            })
            .catch(next);
        });


        it("Should throw unregistered rule needed.", next => {
            const _fieldSet = wildgeese.makeFieldSet();
            _fieldSet.add("dummy", "Dummy", ["un-registered-rule"]);

            _fieldSet.validate({})
            .then (errors => {
                next(new Error("Unregistered Error not fired."))
            })
            .catch(e => {
                expect(e.message).to.be.equal("Validation rule `un-registered-rule` is not registered in wildgeese.");
                next();
            })
        });

        it("Should ignore optional field validation.", next => {
            const spy = sinon.spy();

            wildgeese.addRule({
                name : "--ignore-optional-spy",
                validate : spy
            });

            const _fieldSet = wildgeese.makeFieldSet();
            _fieldSet.add("required", "Required", ["required"]);
            _fieldSet.add("opt", "Optional", ["--ignore-optional-spy"]);
            _fieldSet.validate({required: "wildgeese"}).then(e => {
                expect(spy.called).to.be(false);
                next();
            }, next);
        });

        it("Should call optional field validation when with value.", next => {
            const spy = sinon.spy();

            wildgeese.addRule({
                name : "--optional-spy",
                validate : spy
            });

            const _fieldSet = wildgeese.makeFieldSet();
            _fieldSet.add("required", "Required", ["required"]);
            _fieldSet.add("opt", "Optional", ["--optional-spy"]);
            _fieldSet.validate({required: "wildgeese", "opt": "with value"})
            .then(e => {
                expect(e).to.be(undefined);
                expect(spy.called).to.be(true);
                next()
            })
            .catch(next);
        });


        describe("Should validate present fields only", () => {
            const _fieldSet = wildgeese.makeFieldSet();
            _fieldSet.add("validate", "Validate", ["required"]);
            _fieldSet.add("ignored", "Ignored", ["required"]);

            it ("with boolean", (next) => {
                Promise.all([
                    // without error
                    _fieldSet.validate({validate: "wildgeese"}, true).then(errors => {
                        expect(errors).to.equal(undefined);
                    }),

                    // with error
                    _fieldSet.validate({}, false).then(errors => {
                        expect(errors).to.have.key("validate");
                        expect(errors).to.have.key('ignored');
                    }),
                ])
                .then(() => next(), next);
            });

            it("with presented field name string", next => {
                Promise.all([
                    // without error
                    _fieldSet.validate({validate: "wildgeese"}, "validate").then(errors => {
                        expect(errors).to.equal(undefined);
                    }),

                    // with error
                    _fieldSet.validate({}, "validate").then(errors => {
                        expect(errors).to.have.key("validate");
                        expect(errors).to.not.have.key('ignored');
                    })
                ])
                .then(() => next(), next);
            });

            it("with presented field names array", next => {
                Promise.all([
                    // without error
                    _fieldSet.validate({validate: "wildgeese"}, ["validate"]).then(errors => {
                        expect(errors).to.equal(undefined);
                    }),

                    // with error
                    _fieldSet.validate({}, ["validate"]).then(errors => {
                        expect(errors).to.have.key("validate");
                        expect(errors).to.not.have.key('ignored');
                    })
                ])
                .then(() => next(), next);
            });
        });
    });
});
