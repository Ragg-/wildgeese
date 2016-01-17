import I18n2 from "i18n-2";
export default function i18nInit() {
    const i = new I18n2({
        locales : {
            en : require("./i18n/en"),
            ja : require("./i18n/ja")
        }
    });

    return i;
}
