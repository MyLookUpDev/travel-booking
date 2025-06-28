import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Adjust these paths if needed!
import en from "./locals/en/translation.json";
import fr from "./locals/fr/translation.json";
import ar from "./locals/ar/translation.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      ar: { translation: ar }
    },
    lng: localStorage.getItem("i18nextLng") || "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

export default i18n;
