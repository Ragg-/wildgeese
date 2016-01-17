import co from "co";

export default function resolveValidator(wildgeese, rule) {
    if (typeof rule === "function") {
        return co.wrap(rule);
    }

    const validator = wildgeese.getRule(rule);
    if (validator) {
        return validator;
    }

    throw new Error("Validation rule `" + rule + "` is not registered in wildgeese.");
}
