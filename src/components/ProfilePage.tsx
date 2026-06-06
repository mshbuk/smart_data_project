import {
  ChevronRight,
  Database,
  Eraser,
  Heart,
  LogOut,
  Mail,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Sparkles,
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
  onLogout: () => void;
  onOpenComparison: () => void;
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
  onLogout,
  onOpenComparison,
}: ProfilePageProps) {
  const { tx } = useI18n();
  const localizedProfileLabels: Record<UserProfile, string> = {
    tourist: tx("Tourist / short-term stay", "Tourist / Kurzaufenthalt"),
    family: tx("Family relocation", "Familienumzug"),
    longTerm: tx("Long-term living", "Langfristiges Wohnen"),
    custom: tx("User-defined setup", "Eigene Auswahl"),
  };
  const labelByEnglish: Record<string, string> = {
    "Maximum rent": "Maximale Miete",
    Safety: "Sicherheit",
    Quietness: "Ruhe",
    "Green areas": "Grünflächen",
    "Public transport": "ÖPNV",
    Schools: "Schulen",
    Kindergartens: "Kitas",
    Nightlife: "Nachtleben",
  };
  const strongestPreferences = preferenceRows
    .filter((row) => row.key !== "maxRentPerSqm")
    .sort((a, b) => Number(preferences[b.key]) - Number(preferences[a.key]))
    .slice(0, 3);

  return (
    <section className="mx-auto grid max-w-[760px] gap-9 px-2 pb-8 pt-8">
      <div className="grid grid-cols-[8rem_1fr] items-center gap-8">
        <span className="grid h-32 w-32 place-items-center rounded-full bg-slate-950 text-5xl font-black text-white">
          G
        </span>
        <div>
          <h1 className="text-[2.65rem] font-black leading-none tracking-[-0.05em] text-slate-950">
            {tx("Guest", "Gast")}
          </h1>
          <p className="mt-4 text-[1.7rem] font-medium leading-tight tracking-[-0.03em] text-slate-500">
            {tx("Save your progress", "Speichere deinen Fortschritt")}
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <button
          className="inline-flex min-h-[6.25rem] items-center justify-between rounded-[2rem] bg-slate-950 px-8 text-[1.7rem] font-black tracking-[-0.04em] text-white shadow-[0_18px_34px_rgba(15,23,42,0.16)] transition-colors hover:bg-slate-800"
          type="button"
        >
          <span className="inline-flex items-center gap-5">
            <Mail aria-hidden="true" className="h-7 w-7" />
            {tx("Sign in with email", "Per E-Mail anmelden")}
          </span>
          <ChevronRight aria-hidden="true" className="h-8 w-8" />
        </button>

        <button
          className="inline-flex min-h-[6.25rem] items-center justify-between rounded-[2rem] border border-slate-200 bg-white px-8 text-[1.7rem] font-black tracking-[-0.04em] text-slate-950 shadow-sm transition-colors hover:bg-slate-50"
          type="button"
        >
          <span className="inline-flex items-center gap-5">
            <Sparkles aria-hidden="true" className="h-8 w-8 text-rose-500" />
            {tx("Get magic link", "Magic Link erhalten")}
          </span>
          <ChevronRight aria-hidden="true" className="h-8 w-8" />
        </button>
      </div>

      <section className="grid gap-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black uppercase tracking-[0.18em] text-slate-400">
            {tx("Your preferences", "Deine Präferenzen")}
          </h2>
          <button
            className="inline-flex items-center gap-2 text-xl font-black text-sky-500"
            onClick={onEditCriteria}
            type="button"
          >
            <RefreshCw aria-hidden="true" className="h-5 w-5" />
            {tx("Edit", "Bearbeiten")}
          </button>
        </div>

        <div className="rounded-[2.1rem] border-2 border-dashed border-slate-300 bg-white/55 p-8 text-center">
          <p className="text-[1.55rem] font-medium leading-tight text-slate-500">
            {tx("Current setup", "Aktuelle Auswahl")}:{" "}
            <span className="font-black text-slate-950">{localizedProfileLabels[selectedProfile]}</span>
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {strongestPreferences.map((row) => (
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-600" key={row.key}>
                {tx(row.label, labelByEnglish[row.label] ?? row.label)} {preferences[row.key]}/5
              </span>
            ))}
          </div>
          <button
            className="mt-8 inline-flex min-h-16 items-center justify-center gap-3 rounded-full bg-slate-950 px-9 text-xl font-black text-white transition-colors hover:bg-slate-800"
            onClick={onEditCriteria}
            type="button"
          >
            {tx("Start quiz", "Quiz starten")}
            <ChevronRight aria-hidden="true" className="h-6 w-6" />
          </button>
          <button
            className="mt-4 text-base font-black text-sky-500"
            onClick={onChangeProfile}
            type="button"
          >
            {tx("Change profile", "Profil ändern")}
          </button>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <button
          className="rounded-[1.8rem] border border-slate-200 bg-white p-7 text-left shadow-sm transition-colors hover:bg-slate-50"
          onClick={onBack}
          type="button"
        >
          <p className="text-xl font-black uppercase tracking-[0.14em] text-slate-400">Matches</p>
          <p className="mt-4 text-[1.55rem] font-black leading-tight text-slate-950">
            {tx("View results", "Ergebnisse ansehen")}
          </p>
        </button>
        <button
          className="rounded-[1.8rem] border border-slate-200 bg-white p-7 text-left shadow-sm transition-colors hover:bg-slate-50"
          onClick={onOpenComparison}
          type="button"
        >
          <p className="text-xl font-black uppercase tracking-[0.14em] text-slate-400">{tx("Compare", "Vergleich")}</p>
          <p className="mt-4 text-[1.55rem] font-black leading-tight text-slate-950">
            {tx("Change profile", "Profil ändern")}
          </p>
        </button>
      </div>

      <section className="grid gap-3 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[1.4rem] bg-slate-50 p-4">
            <Heart aria-hidden="true" className="h-5 w-5 text-slate-500" />
            <p className="mt-3 text-sm font-black uppercase text-slate-400">{tx("Favorites", "Favoriten")}</p>
            <p className="text-2xl font-black text-slate-950">{favoriteCount}</p>
          </div>
          <div className="rounded-[1.4rem] bg-slate-50 p-4">
            <MapPin aria-hidden="true" className="h-5 w-5 text-slate-500" />
            <p className="mt-3 text-sm font-black uppercase text-slate-400">{tx("City", "Stadt")}</p>
            <p className="text-2xl font-black text-slate-950">{city}</p>
          </div>
        </div>
        <div className="rounded-[1.4rem] bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          <ShieldCheck aria-hidden="true" className="mb-3 h-5 w-5 text-slate-500" />
          {tx(
            "This demo stores preferences and saved districts locally in this browser.",
            "Diese Demo speichert Präferenzen und gespeicherte Stadtteile lokal in diesem Browser.",
          )}
        </div>
        <div className="grid gap-3">
          <button
            className="inline-flex min-h-13 items-center justify-center gap-3 rounded-full border border-slate-200 bg-white px-5 text-base font-black text-slate-800 transition-colors hover:bg-slate-50"
            onClick={onClearLocalData}
            type="button"
          >
            <Eraser aria-hidden="true" className="h-5 w-5" />
            {tx("Clear local data", "Lokale Daten löschen")}
          </button>
          <button
            className="inline-flex min-h-13 items-center justify-center gap-3 rounded-full bg-slate-950 px-5 text-base font-black text-white transition-colors hover:bg-slate-800"
            onClick={onLogout}
            type="button"
          >
            <LogOut aria-hidden="true" className="h-5 w-5" />
            {tx("Log out", "Abmelden")}
          </button>
        </div>
      </section>

      <section className="grid gap-3 rounded-[2rem] border border-slate-200 bg-white p-6 text-sm leading-6 text-slate-600 shadow-sm">
        <p>
          <Database aria-hidden="true" className="mb-2 h-5 w-5 text-slate-500" />
          <strong className="text-slate-950">Datenschutz:</strong>{" "}
          {tx(
            "No personal data is sent to a server in this prototype.",
            "In diesem Prototyp werden keine personenbezogenen Daten an einen Server gesendet.",
          )}
        </p>
        <p>
          <strong className="text-slate-950">Impressum:</strong>{" "}
          {tx(
            "University Smart Data prototype for Hamburg district recommendations.",
            "Universitärer Smart-Data-Prototyp für Hamburger Stadtteilempfehlungen.",
          )}
        </p>
      </section>
    </section>
  );
}
