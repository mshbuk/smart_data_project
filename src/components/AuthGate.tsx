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
    <div className="grid grid-cols-2 rounded-full border border-slate-200 bg-white/90 p-1 text-sm font-bold shadow-sm backdrop-blur">
      {(["de", "en"] as const).map((option) => (
        <button
          aria-pressed={language === option}
          className={[
            "rounded-full px-4 py-2 transition-colors",
            language === option ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100",
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
        className="min-h-screen bg-slate-950 bg-cover bg-center font-sans text-white antialiased"
        style={{
          backgroundImage: `var(--moin-gradient-hero), url("${import.meta.env.BASE_URL}hamburg-harbor.png")`,
        }}
      >
        <section className="mx-auto flex min-h-screen w-full max-w-[760px] flex-col justify-between px-6 py-8">
          <div className="flex justify-end">{languageSwitch}</div>

          <div className="pb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-black/35 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-white" />
              Hamburg Finder
            </div>
            <h1 className="mt-6 max-w-[680px] text-5xl font-black leading-[0.98] md:text-7xl">
              {tx(
                "Find the Hamburg district that fits you.",
                "Finde den Hamburger Stadtteil, der zu dir passt.",
              )}
            </h1>
            <p className="mt-5 max-w-[620px] text-xl font-medium leading-8 text-white/88">
              {tx(
                "We compare districts with data and your priorities for better decisions.",
                "Wir vergleichen Stadtteile mit Daten und deinen Prioritäten für bessere Entscheidungen.",
              )}
            </p>

            <div className="mt-10 grid gap-4">
              <button
                className="min-h-16 rounded-full bg-white px-6 text-lg font-black text-slate-950 shadow-2xl shadow-slate-950/30 transition-transform hover:-translate-y-0.5 hover:bg-slate-100"
                onClick={() => setScreen("register")}
                type="button"
              >
                {tx("Register for free", "Kostenlos registrieren")}
              </button>
              <button
                className="min-h-16 rounded-full border border-white/55 bg-black/25 px-6 text-lg font-black text-white backdrop-blur transition-colors hover:bg-black/35"
                onClick={() => setScreen("login")}
                type="button"
              >
                {tx("Log in", "Anmelden")}
              </button>
              <button
                className="min-h-12 rounded-full px-6 text-lg font-bold text-white/82 transition-colors hover:text-white"
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
    <main className="min-h-screen bg-[var(--moin-background)] font-sans text-slate-950 antialiased">
      <header className="border-b border-slate-200 bg-[var(--moin-background)]/95 backdrop-blur">
        <div className="mx-auto flex min-h-[7rem] w-full max-w-[760px] items-center justify-between gap-3 px-6">
          <button
            className="inline-flex items-center gap-3 text-2xl font-black text-slate-950"
            onClick={() => setScreen("landing")}
            type="button"
          >
            <ArrowLeft aria-hidden="true" className="h-7 w-7" />
            {isRegister ? tx("Register", "Registrieren") : tx("Log in", "Anmelden")}
          </button>
          <div className="flex items-center gap-4">
            <MessageCircle aria-hidden="true" className="h-8 w-8 text-slate-950" strokeWidth={2.2} />
            {languageSwitch}
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[760px] px-8 py-16">
        <div className="mx-auto grid max-w-[520px] gap-7">
          {isRegister && (
            <label className="grid gap-2 text-base font-bold text-slate-600">
              {tx("Name", "Name")}
              <input
                className="min-h-16 rounded-[1.6rem] border border-slate-200 bg-white px-5 text-xl font-medium text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
                placeholder={tx("First name", "Vorname")}
                type="text"
              />
            </label>
          )}
          <label className="grid gap-2 text-base font-bold text-slate-600">
            E-Mail
            <input
              className="min-h-16 rounded-[1.6rem] border border-slate-200 bg-white px-5 text-xl font-medium text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
              placeholder="name@beispiel.de"
              type="email"
            />
          </label>
          <label className="grid gap-2 text-base font-bold text-slate-600">
            {tx("Password", "Passwort")}
            <input
              className="min-h-16 rounded-[1.6rem] border border-slate-200 bg-white px-5 text-xl font-medium text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
              placeholder="••••••••"
              type="password"
            />
          </label>

          <button
            className="mt-2 min-h-16 rounded-full bg-slate-950 px-6 text-lg font-black text-white shadow-xl shadow-slate-950/15 transition-transform hover:-translate-y-0.5 hover:bg-slate-800"
            onClick={() => onContinue(isRegister ? "register" : "login")}
            type="button"
          >
            {isRegister ? tx("Register", "Registrieren") : tx("Log in", "Anmelden")}
          </button>

          <p className="text-center text-lg font-medium text-slate-500">
            {isRegister ? tx("Already have an account?", "Schon ein Konto?") : tx("No account yet?", "Noch kein Konto?")}{" "}
            <button
              className="font-black text-slate-950 underline decoration-rose-400 decoration-2 underline-offset-4"
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
