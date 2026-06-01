import { LogIn, MapPinned, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { useI18n } from "../i18n";

type AuthGateMode = "guest" | "login" | "register";

type AuthGateProps = {
  onContinue: (mode: AuthGateMode) => void;
};

export function AuthGate({ onContinue }: AuthGateProps) {
  const { language, setLanguage, tx } = useI18n();
  const [mode, setMode] = useState<Exclude<AuthGateMode, "guest">>("login");
  const isLogin = mode === "login";

  return (
    <main
      className="min-h-screen bg-slate-950 bg-cover bg-center font-sans text-slate-950 antialiased"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.42) 0%, rgba(15,23,42,0.84) 100%), url("${import.meta.env.BASE_URL}hamburg-harbor.png")`,
      }}
    >
      <section className="mx-auto grid min-h-screen w-full max-w-[1080px] content-center gap-5 px-4 py-8 md:grid-cols-[0.9fr_1.1fr] md:items-center md:px-6">
        <div className="text-white">
          <div className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-3 py-2 text-xs font-black uppercase tracking-wide backdrop-blur">
            <MapPinned aria-hidden="true" className="h-4 w-4" />
            District Finder
          </div>
          <h1 className="mt-5 max-w-xl text-5xl font-black leading-none drop-shadow md:text-7xl">
            {tx("Find your Hamburg fit", "Finde deinen Hamburger Stadtteil")}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/85 md:text-lg">
            {tx(
              "Sign in for the demo flow, create a demo account, or continue as a guest. The recommendation logic stays the same for all options.",
              "Melde dich für den Demo-Flow an, erstelle ein Demo-Konto oder fahre als Gast fort. Die Empfehlungslogik bleibt für alle Optionen gleich.",
            )}
          </p>
        </div>

        <div className="rounded-[1.8rem] border border-white/70 bg-white/95 p-5 shadow-[0_28px_90px_rgba(15,23,42,0.32)] backdrop-blur md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-indigo-600">{tx("Welcome", "Willkommen")}</p>
              <h2 className="mt-1 text-3xl font-black text-slate-950">
                {isLogin ? tx("Log in", "Anmelden") : tx("Create account", "Registrieren")}
              </h2>
            </div>
            <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1 text-xs font-black">
              {(["de", "en"] as const).map((option) => (
                <button
                  aria-pressed={language === option}
                  className={[
                    "rounded-xl px-2.5 py-2 transition-colors",
                    language === option ? "bg-indigo-600 text-white" : "text-slate-700 hover:bg-white",
                  ].join(" ")}
                  key={option}
                  onClick={() => setLanguage(option)}
                  type="button"
                >
                  {option.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
            <button
              aria-pressed={isLogin}
              className={[
                "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-black transition-colors",
                isLogin ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:bg-white/70",
              ].join(" ")}
              onClick={() => setMode("login")}
              type="button"
            >
              <LogIn aria-hidden="true" className="h-4 w-4" />
              {tx("Log in", "Anmelden")}
            </button>
            <button
              aria-pressed={!isLogin}
              className={[
                "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-black transition-colors",
                !isLogin ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:bg-white/70",
              ].join(" ")}
              onClick={() => setMode("register")}
              type="button"
            >
              <UserPlus aria-hidden="true" className="h-4 w-4" />
              {tx("Register", "Registrieren")}
            </button>
          </div>

          <div className="mt-5 grid gap-3">
            <label className="grid gap-1.5 text-sm font-black text-slate-700">
              E-Mail
              <input
                className="min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                placeholder="demo@hamburg.de"
                type="email"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-black text-slate-700">
              {tx("Password", "Passwort")}
              <input
                className="min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                placeholder="••••••••"
                type="password"
              />
            </label>
            {!isLogin && (
              <label className="grid gap-1.5 text-sm font-black text-slate-700">
                {tx("Name", "Name")}
                <input
                  className="min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                  placeholder={tx("Demo user", "Demo-Nutzer/in")}
                  type="text"
                />
              </label>
            )}
          </div>

          <button
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 text-sm font-black text-white shadow-lg shadow-indigo-600/25 transition-transform hover:-translate-y-0.5"
            onClick={() => onContinue(mode)}
            type="button"
          >
            {isLogin ? <LogIn aria-hidden="true" className="h-4 w-4" /> : <UserPlus aria-hidden="true" className="h-4 w-4" />}
            {isLogin ? tx("Continue with login", "Mit Anmeldung fortfahren") : tx("Create demo account", "Demo-Konto erstellen")}
          </button>

          <button
            className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 px-4 text-sm font-black text-slate-950 shadow-lg shadow-amber-400/20 transition-colors hover:bg-amber-300"
            onClick={() => onContinue("guest")}
            type="button"
          >
            <Users aria-hidden="true" className="h-4 w-4" />
            {tx("Continue as guest", "Als Gast fortfahren")}
          </button>

          <p className="mt-4 text-center text-xs font-bold leading-5 text-slate-500">
            {tx(
              "Demo only: these buttons do not create a real account yet.",
              "Nur Demo: Diese Buttons erstellen noch kein echtes Konto.",
            )}
          </p>
        </div>
      </section>
    </main>
  );
}
