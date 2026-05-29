import { createContext, useContext, type ReactNode } from "react";

export type Language = "de" | "en";

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  tx: (english: string, german: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function translate(language: Language, english: string, german: string) {
  return language === "de" ? german : english;
}

export function I18nProvider({
  children,
  language,
  setLanguage,
}: {
  children: ReactNode;
  language: Language;
  setLanguage: (language: Language) => void;
}) {
  return (
    <I18nContext.Provider value={{ language, setLanguage, tx: (english, german) => translate(language, english, german) }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }

  return context;
}
