import {
  ArrowLeft,
  Database,
  Eraser,
  Heart,
  Home,
  Info,
  LogIn,
  MapPin,
  ShieldCheck,
  SlidersHorizontal,
  User,
  UserPlus,
} from "lucide-react";
import type { Preferences, UserProfile } from "../types/District";
import { useI18n } from "../i18n";

type ProfilePageProps = {
  city: string;
  favoriteCount: number;
  preferences: Preferences;
  selectedProfile: UserProfile;
  onBack: () => void;
  onChangeProfile: () => void;
  onClearLocalData: () => void;
  onEditCriteria: () => void;
};

const preferenceRows: Array<{ key: keyof Preferences; label: string; suffix?: string }> = [
  { key: "maxRentPerSqm", label: "Maximum rent", suffix: "EUR/sqm" },
  { key: "safety", label: "Safety" },
  { key: "quietness", label: "Quietness" },
  { key: "green", label: "Green areas" },
  { key: "publicTransport", label: "Public transport" },
  { key: "schools", label: "Schools" },
  { key: "kindergartens", label: "Kindergartens" },
  { key: "nightlife", label: "Nightlife" },
];

export function ProfilePage({
  city,
  favoriteCount,
  preferences,
  selectedProfile,
  onBack,
  onChangeProfile,
  onClearLocalData,
  onEditCriteria,
}: ProfilePageProps) {
  const { language, setLanguage, tx } = useI18n();
  const localizedProfileLabels: Record<UserProfile, string> = {
    tourist: tx("Tourist / short-term stay", "Tourist / Kurzaufenthalt"),
    family: tx("Family relocation", "Familienumzug"),
    longTerm: tx("Long-term living", "Langfristiges Wohnen"),
    custom: tx("User-defined setup", "Eigene Auswahl"),
  };

  return (
    <section className="mx-auto min-h-screen w-full max-w-[1080px] px-3.5 py-5 md:px-6 md:py-8">
      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-white px-4 text-sm font-black text-slate-700 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition-colors hover:bg-slate-50"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          {tx("Back to finder", "Zurück zum Finder")}
        </button>

        <div className="grid grid-cols-2 rounded-2xl bg-white/95 p-1 text-xs font-black shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          {(["de", "en"] as const).map((option) => (
            <button
              aria-pressed={language === option}
              className={[
                "rounded-xl px-2.5 py-2 transition-colors",
                language === option ? "bg-indigo-600 text-white" : "text-slate-700 hover:bg-slate-50",
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

      <div className="rounded-[1.8rem] border border-white/80 bg-white/95 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.12)] md:p-8">
        <header className="grid gap-5 md:grid-cols-[auto_1fr] md:items-center">
          <span className="grid h-20 w-20 place-items-center rounded-[1.6rem] bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-600/20 md:h-24 md:w-24">
            <User aria-hidden="true" className="h-10 w-10 md:h-12 md:w-12" />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-indigo-600">{tx("Local profile", "Lokales Profil")}</p>
            <h1 className="mt-1 text-4xl font-black leading-tight text-slate-950 md:text-5xl">{tx("Guest", "Gast")}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {tx(
                "This demo stores only your profile preset, preference weights, saved favorites, and open view in this browser.",
                "Diese Demo speichert nur Profil, Gewichtungen, Favoriten und offene Ansicht lokal in diesem Browser.",
              )}
            </p>
          </div>
        </header>

        <div className="mt-7 grid gap-3 md:grid-cols-3">
          <article className="rounded-[1.35rem] border border-blue-100 bg-blue-50 p-4">
            <Heart aria-hidden="true" className="h-5 w-5 text-blue-600" />
            <p className="mt-3 text-sm font-bold text-slate-600">{tx("Favorites", "Favoriten")}</p>
            <p className="mt-1 text-3xl font-black text-slate-950">{favoriteCount}</p>
          </article>
          <article className="rounded-[1.35rem] border border-violet-100 bg-violet-50 p-4">
            <MapPin aria-hidden="true" className="h-5 w-5 text-violet-600" />
            <p className="mt-3 text-sm font-bold text-slate-600">{tx("Searched city", "Gesuchte Stadt")}</p>
            <p className="mt-1 text-3xl font-black text-slate-950">{city}</p>
          </article>
          <article className="rounded-[1.35rem] border border-emerald-100 bg-emerald-50 p-4">
            <Home aria-hidden="true" className="h-5 w-5 text-emerald-600" />
            <p className="mt-3 text-sm font-bold text-slate-600">{tx("Profile preset", "Profil")}</p>
            <p className="mt-1 text-xl font-black text-slate-950">{localizedProfileLabels[selectedProfile]}</p>
          </article>
        </div>

        <div className="mt-7 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <section className="rounded-[1.35rem] border border-indigo-100 bg-indigo-50 p-4 lg:col-span-2">
            <div className="flex items-center gap-2">
              <LogIn aria-hidden="true" className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-black text-slate-950">{tx("Sign in or register", "Anmelden oder registrieren")}</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {tx(
                "Demo account actions are shown here for the tested flow. A real release would connect these buttons to authentication and saved cross-device profiles.",
                "Demo-Account-Aktionen werden hier für den getesteten Flow gezeigt. Eine echte Version würde Authentifizierung und geräteübergreifende Profile anbinden.",
              )}
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-black text-indigo-600 shadow-sm shadow-slate-950/5 transition-colors hover:bg-indigo-50"
                type="button"
              >
                <LogIn aria-hidden="true" className="h-4 w-4" />
                {tx("Sign in", "Anmelden")}
              </button>
              <button
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 text-sm font-black text-white shadow-lg shadow-indigo-600/20 transition-colors hover:bg-indigo-700"
                type="button"
              >
                <UserPlus aria-hidden="true" className="h-4 w-4" />
                {tx("Register", "Registrieren")}
              </button>
            </div>
          </section>

          <section className="rounded-[1.35rem] border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal aria-hidden="true" className="h-5 w-5 text-indigo-600" />
                <h2 className="text-xl font-black text-slate-950">{tx("Saved preferences", "Gespeicherte Präferenzen")}</h2>
              </div>
              <button
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 text-sm font-black text-white shadow-lg shadow-indigo-600/20 transition-transform hover:-translate-y-0.5"
                onClick={onEditCriteria}
                type="button"
              >
                <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
                {tx("Edit criteria", "Kriterien ändern")}
              </button>
            </div>
            <div className="mt-4 grid gap-2">
              {preferenceRows.map((row) => (
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2.5" key={row.key}>
                  <span className="text-sm font-bold text-slate-600">
                    {tx(row.label, {
                      "Maximum rent": "Maximale Miete",
                      Safety: "Sicherheit",
                      Quietness: "Ruhe",
                      "Green areas": "Grünflächen",
                      "Public transport": "ÖPNV",
                      Schools: "Schulen",
                      Kindergartens: "Kitas",
                      Nightlife: "Nachtleben",
                    }[row.label] ?? row.label)}
                  </span>
                  <span className="text-sm font-black text-slate-950">
                    {preferences[row.key]}
                    {row.suffix ? ` EUR/${tx("sqm", "qm")}` : "/5"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.35rem] border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <Database aria-hidden="true" className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-black text-slate-950">{tx("Local data", "Lokale Daten")}</h2>
            </div>
            <button
              className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 px-4 text-sm font-black text-slate-950 shadow-lg shadow-amber-400/20 transition-colors hover:bg-amber-300"
              onClick={onChangeProfile}
              type="button"
            >
              <User aria-hidden="true" className="h-4 w-4" />
              {tx("Change profile", "Profil ändern")}
            </button>
            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-slate-700">
              <strong className="text-slate-950">{tx("Privacy note", "Datenschutzhinweis")}:</strong>{" "}
              {tx(
                "No personal data is sent to a server. Everything shown here is stored locally in your browser for the demo.",
                "Es werden keine personenbezogenen Daten an einen Server gesendet. Alles hier wird für die Demo lokal im Browser gespeichert.",
              )}
            </div>
            <button
              className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-black text-rose-700 transition-colors hover:bg-rose-100"
              onClick={onClearLocalData}
              type="button"
            >
              <Eraser aria-hidden="true" className="h-4 w-4" />
              {tx("Clear local data", "Lokale Daten löschen")}
            </button>
          </section>
        </div>

        <div className="mt-7 grid gap-4 lg:grid-cols-2">
          <section className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck aria-hidden="true" className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-black text-slate-950">Datenschutz</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {tx(
                "District Finder uses local dummy district data and local browser storage only. Sensitive attributes are intentionally excluded from the scoring model.",
                "District Finder nutzt lokale Stadtteildaten und lokalen Browser-Speicher. Sensible Merkmale sind bewusst nicht im Bewertungsmodell enthalten.",
              )}
            </p>
          </section>

          <section className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <Info aria-hidden="true" className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-black text-slate-950">Impressum</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {tx(
                "University Smart Data prototype for exploring Hamburg district recommendations. Add project owner and contact details here before a public release.",
                "Universitärer Smart-Data-Prototyp für Hamburger Stadtteilempfehlungen. Vor einer Veröffentlichung müssen Projektverantwortliche und Kontakt ergänzt werden.",
              )}
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
