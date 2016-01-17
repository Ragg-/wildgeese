export default function* () {
    yield this.watch("src/**/*", ["build"]);
}

export function* prePubulish() {
    yield this.start(["build"]);
}

export function* build() {
    yield this.clear(`lib/**/*`);

    yield this
        .source("src/**/*.js")
        .babel({
            presets : [
                "stage-3",
            ],
            plugins : [
                "add-module-exports",
                "transform-es2015-arrow-functions",
                "transform-es2015-block-scoped-functions",
                "transform-es2015-block-scoping",
                "transform-es2015-classes",
                "transform-es2015-computed-properties",
                "transform-es2015-destructuring",
                "transform-es2015-for-of",
                "transform-es2015-function-name",
                "transform-es2015-literals",
                "transform-es2015-modules-commonjs",
                "transform-es2015-object-super",
                "transform-es2015-parameters",
                "transform-es2015-shorthand-properties",
                "transform-es2015-spread",
                "transform-es2015-sticky-regex",
                "transform-es2015-template-literals",
                "transform-es2015-typeof-symbol",
                "transform-es2015-unicode-regex",
            ]
        })
        .target("lib/");
}
