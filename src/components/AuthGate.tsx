import { ArrowLeft, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useI18n } from "../i18n";

type AuthGateMode = "guest" | "login" | "register";

type AuthGateProps = {
  onContinue: (mode: AuthGateMode) => void;
};

type AuthScreen = "landing" | "login" | "register";

export function AuthGate({ onContinue }: AuthGateProps) {
  const { language, setLanguage, tx } = useI18n();
  const [screen, setScreen] = useState<AuthScreen>("landing");
  const isRegister = screen === "register";

  const languageSwitch = (
    <div className="grid grid-cols-2 rounded-full border border-border bg-card/90 p-0.5 text-[11px] font-semibold shadow-card backdrop-blur">
      {(["de", "en"] as const).map((option) => (
        <button
          aria-pressed={language === option}
          className={[
            "rounded-full px-2.5 py-1 transition-colors",
            language === option ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted",
          ].join(" ")}
          key={option}
          onClick={() => setLanguage(option)}
          type="button"
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );

  if (screen === "landing") {
    return (
      <main
        className="min-h-screen bg-foreground bg-cover bg-center font-sans text-white antialiased"
        style={{
          backgroundImage: `var(--gradient-hero), url("${import.meta.env.BASE_URL}lovable-assets/hamburg-hero.jpg")`,
        }}
      >
        <section className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-between px-6 pb-10 pt-4">
          <div className="flex justify-end">{languageSwitch}</div>

          <div className="pb-10">
            <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              Hamburg Finder
            </div>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-white">
              {tx(
                "Find the Hamburg district that fits you.",
                "Finde den Hamburger Stadtteil, der zu dir passt.",
              )}
            </h1>
            <p className="mt-3 text-base text-white/80">
              {tx(
                "We compare districts with data and your priorities for better decisions.",
                "Wir vergleichen Stadtteile mit Daten und deinen Prioritäten für bessere Entscheidungen.",
              )}
            </p>

            <div className="mt-8 flex flex-col gap-2.5">
              <button
                className="rounded-2xl bg-primary px-5 py-3.5 text-center text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-95"
                onClick={() => setScreen("register")}
                type="button"
              >
                {tx("Register for free", "Kostenlos registrieren")}
              </button>
              <button
                className="rounded-2xl border border-white/30 bg-white/10 px-5 py-3.5 text-center text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                onClick={() => setScreen("login")}
                type="button"
              >
                {tx("Log in", "Anmelden")}
              </button>
              <button
                className="rounded-2xl px-5 py-3 text-center text-sm font-medium text-white/80 underline-offset-4 hover:underline"
                onClick={() => onContinue("guest")}
                type="button"
              >
                {tx("Start as guest", "Als Gast starten")}
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background font-sans text-foreground antialiased">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex min-h-[3.5rem] w-full max-w-xl items-center justify-between gap-3 px-4 py-3">
          <button
            className="-ml-1 inline-flex items-center gap-2 rounded-full p-1.5 font-display text-lg font-semibold text-foreground hover:bg-muted"
            onClick={() => setScreen("landing")}
            type="button"
          >
            <ArrowLeft aria-hidden="true" className="h-5 w-5" />
            {isRegister ? tx("Register", "Registrieren") : tx("Log in", "Anmelden")}
          </button>
          <div className="flex items-center gap-2">
            <MessageCircle aria-hidden="true" className="h-5 w-5 text-foreground" strokeWidth={2.2} />
            {languageSwitch}
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-xl px-4 py-10">
        <div className="mx-auto grid max-w-[520px] gap-7">
          {isRegister && (
            <label className="grid gap-2 text-sm font-semibold text-muted-foreground">
              {tx("Name", "Name")}
              <input
                className="min-h-12 rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
                placeholder={tx("First name", "Vorname")}
                type="text"
              />
            </label>
          )}
          <label className="grid gap-2 text-sm font-semibold text-muted-foreground">
            E-Mail
            <input
              className="min-h-12 rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
              placeholder="name@beispiel.de"
              type="email"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-muted-foreground">
            {tx("Password", "Passwort")}
            <input
              className="min-h-12 rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
              placeholder="••••••••"
              type="password"
            />
          </label>

          <button
            className="mt-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-95"
            onClick={() => onContinue(isRegister ? "register" : "login")}
            type="button"
          >
            {isRegister ? tx("Register", "Registrieren") : tx("Log in", "Anmelden")}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            {isRegister ? tx("Already have an account?", "Schon ein Konto?") : tx("No account yet?", "Noch kein Konto?")}{" "}
            <button
              className="font-medium text-primary"
              onClick={() => setScreen(isRegister ? "login" : "register")}
              type="button"
            >
              {isRegister ? tx("Log in", "Anmelden") : tx("Register", "Registrieren")}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
