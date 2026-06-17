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
    <section className="mx-auto grid max-w-xl gap-5 pb-4">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-soft text-lg font-bold text-primary">
          G
        </span>
        <div className="flex-1">
          <h1 className="font-display text-base font-semibold text-foreground">
            {tx("Guest", "Gast")}
          </h1>
          <p className="text-xs text-muted-foreground">
            {tx("Save your progress", "Speichere deinen Fortschritt")}
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-2">
        <button
          className="inline-flex items-center justify-between rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-soft transition hover:opacity-95"
          type="button"
        >
          <span className="inline-flex items-center gap-2">
            <Mail aria-hidden="true" className="h-4 w-4" />
            {tx("Sign in with email", "Per E-Mail anmelden")}
          </span>
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </button>

        <button
          className="inline-flex items-center justify-between rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          type="button"
        >
          <span className="inline-flex items-center gap-2">
            <Sparkles aria-hidden="true" className="h-4 w-4 text-primary" />
            {tx("Get magic link", "Magic Link erhalten")}
          </span>
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
      </div>

      <section className="grid gap-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-sm font-semibold text-foreground">
            {tx("Your preferences", "Deine Präferenzen")}
          </h2>
          <button
            className="inline-flex items-center gap-1 text-sm font-medium text-primary"
            onClick={onEditCriteria}
            type="button"
          >
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
            {tx("Edit", "Bearbeiten")}
          </button>
        </div>

        <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            {tx("Current setup", "Aktuelle Auswahl")}:{" "}
            <span className="font-semibold text-foreground">{localizedProfileLabels[selectedProfile]}</span>
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {strongestPreferences.map((row) => (
              <span className="rounded-full bg-card px-3 py-1 text-xs font-medium text-muted-foreground" key={row.key}>
                {tx(row.label, labelByEnglish[row.label] ?? row.label)} {preferences[row.key]}/5
              </span>
            ))}
          </div>
          <div className="mt-4 grid justify-items-center gap-2">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft"
              onClick={onEditCriteria}
              type="button"
            >
              {tx("Start quiz", "Quiz starten")}
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </button>
            <button
              className="text-sm font-medium text-primary"
              onClick={onChangeProfile}
              type="button"
            >
              {tx("Change profile", "Profil ändern")}
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <button
          className="rounded-2xl border border-border bg-card p-3 text-left shadow-card transition-colors hover:bg-muted/40"
          onClick={onBack}
          type="button"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Matches</p>
          <p className="mt-2 text-sm font-medium text-foreground">
            {tx("View results", "Ergebnisse ansehen")}
          </p>
        </button>
        <button
          className="rounded-2xl border border-border bg-card p-3 text-left shadow-card transition-colors hover:bg-muted/40"
          onClick={onOpenComparison}
          type="button"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{tx("Compare", "Vergleich")}</p>
          <p className="mt-2 text-sm font-medium text-foreground">
            {favoriteCount} {tx("saved", "gespeichert")}
          </p>
        </button>
      </div>

      <section className="grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-card">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-muted p-3">
            <Heart aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
            <p className="mt-2 text-xs font-semibold uppercase text-muted-foreground">{tx("Favorites", "Favoriten")}</p>
            <p className="font-display text-xl font-bold text-foreground">{favoriteCount}</p>
          </div>
          <div className="rounded-xl bg-muted p-3">
            <MapPin aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
            <p className="mt-2 text-xs font-semibold uppercase text-muted-foreground">{tx("City", "Stadt")}</p>
            <p className="font-display text-xl font-bold text-foreground">{city}</p>
          </div>
        </div>
        <div className="rounded-xl bg-muted p-3 text-sm leading-6 text-muted-foreground">
          <ShieldCheck aria-hidden="true" className="mb-2 h-4 w-4 text-muted-foreground" />
          {tx(
            "This demo stores preferences and saved districts locally in this browser.",
            "Diese Demo speichert Präferenzen und gespeicherte Stadtteile lokal in diesem Browser.",
          )}
        </div>
        <div className="grid gap-3">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            onClick={onClearLocalData}
            type="button"
          >
            <Eraser aria-hidden="true" className="h-4 w-4" />
            {tx("Clear local data", "Lokale Daten löschen")}
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-soft transition hover:opacity-95"
            onClick={onLogout}
            type="button"
          >
            <LogOut aria-hidden="true" className="h-4 w-4" />
            {tx("Log out", "Abmelden")}
          </button>
        </div>
      </section>

      <section className="grid gap-3 rounded-2xl border border-border bg-card p-4 text-sm leading-6 text-muted-foreground shadow-card">
        <p>
          <Database aria-hidden="true" className="mb-2 h-4 w-4 text-muted-foreground" />
          <strong className="text-foreground">Datenschutz:</strong>{" "}
          {tx(
            "No personal data is sent to a server in this prototype.",
            "In diesem Prototyp werden keine personenbezogenen Daten an einen Server gesendet.",
          )}
        </p>
        <p>
          <strong className="text-foreground">Impressum:</strong>{" "}
          {tx(
            "University Smart Data prototype for Hamburg district recommendations.",
            "Universitärer Smart-Data-Prototyp für Hamburger Stadtteilempfehlungen.",
          )}
        </p>
      </section>
    </section>
  );
}
