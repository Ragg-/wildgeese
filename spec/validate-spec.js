const handleException = next => {
    return e => {
        console.log(e.stack);
        next(e);
    }
};

describe("Validate Specs", () => {
    describe("#validateFields", () => {
        //
        // Initialize wildgeese
        //
        const wildgeese = new Wildgeese();

        // set rules
        wildgeese.addRule([{
            name : "--required",
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

        // define fields
        const fieldSet = wildgeese.makeFieldSet();
        fieldSet.add("name", "Name", ["--required"]);
        fieldSet.add("password", "Password", ["--required"]);
        fieldSet.add("password_confirm", "Confirm Password", [
            "--required",
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
                .catch(handleException(next));
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
            .catch(handleException(next));
        });


        it("Should given valid context in 2nd argument", next => {
            // Set config
            wildgeese.set("context-test", {lang: "ja"});

            wildgeese.addRule({
                name : "--test-context",
                validate : (val, ctx) => {
                    expect(ctx.label).to.be.equal("Spy");

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
                        spy : undefined
                    });

                    expect(ctx.args).to.be.eql({with: "spy"});
                    next();
                }
            });

            // Add testing field
            const _fieldSet = fieldSet.clone();
            _fieldSet.add("spy", "Spy", [["--test-context", {with: "spy"}]]);

            _fieldSet.validate({
                name : "wild geese",
                password: "w11d g33s3",
                password_confirm: "w11d g33s3"
            })
            .catch(handleException(next));
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
    });
});
