describe("Wildgeese Specs", () => {
    describe("Register rule", () => {
        const wildgeese = new Wildgeese();

        it("Should register one valudation rule.", () => {
            const rule = {
                 // __ prefix for avoid conflict
                name : "__supported-language",
                validate : (val, ctx) => {
                    if (["ja", "en"].indexOf(val) !== -1) {
                        return `${ctx.label} must be required.`;
                    }
                }
            };

            expect(() => wildgeese.addRule(rule)).to.not.throwException();
            expect(wildgeese.getRule("__supported-language")).to.be.an("function");
        });

        it("Should register many validation rules.", () => {
            const rules = [
                 // __ prefix for avoid conflict
                {
                    name: "__is-array",
                    validate: val => {
                        if (! Array.isArray(val)) {
                            return "${ctx.label} must be a array";
                        }
                    },
                },
                {
                    name: "__is-string",
                    validate: val => {
                        if (typeof val !== "string") {
                            return "${ctx.label} must be a string";
                        }
                    }
                }
            ];

            expect(() => wildgeese.addRule(rules)).to.not.throwException();
            expect(wildgeese.getRule("__is-array")).to.be.an("function");
            expect(wildgeese.getRule("__is-string")).to.be.an("function");
        })
    });

    describe("User defined configure", () => {
        const wildgeese = new Wildgeese();

        // Assumption passing request language to wildgeese
        it("Should set user defined configure", () => {
            expect(() => wildgeese.set("lang", "ja")).to.not.throwException();
        });

        it("Should get user defined configure", () => {
            expect(wildgeese.get("lang")).to.equal("ja");
        });

        it("Should passes user defined configure to validator", done => {
            wildgeese.addRule([
                {
                    name: "__config-test",
                    validate: (val, ctx) => {
                        expect(ctx.options.lang).to.be.equal("ja");
                        expect(ctx.options.lang).to.not.equal("en");
                        // done();
                    }
                }, {
                    name : "required",
                    validate : (val, ctx) => {
                        return val == null || val == "" ? `${ctx.label} must be required.` : null;
                    }
                }
            ]);

            wildgeese.is("config-test", ["__config-test"])
            .then(done)
            .catch(e => done(e));
        })
    });
});
