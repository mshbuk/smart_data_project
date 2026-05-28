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

type ProfilePageProps = {
  city: string;
  favoriteCount: number;
  preferences: Preferences;
  selectedProfile: UserProfile;
  onBack: () => void;
  onClearLocalData: () => void;
};

const profileLabels: Record<UserProfile, string> = {
  tourist: "Tourist / short-term stay",
  family: "Family relocation",
  longTerm: "Long-term living",
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
  onClearLocalData,
}: ProfilePageProps) {
  return (
    <section className="mx-auto min-h-screen w-full max-w-[1080px] px-3.5 py-5 md:px-6 md:py-8">
      <button
        className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-2xl bg-white px-4 text-sm font-black text-slate-700 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition-colors hover:bg-slate-50"
        onClick={onBack}
        type="button"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Back to finder
      </button>

      <div className="rounded-[1.8rem] border border-white/80 bg-white/95 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.12)] md:p-8">
        <header className="grid gap-5 md:grid-cols-[auto_1fr] md:items-center">
          <span className="grid h-20 w-20 place-items-center rounded-[1.6rem] bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-600/20 md:h-24 md:w-24">
            <User aria-hidden="true" className="h-10 w-10 md:h-12 md:w-12" />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-indigo-600">Local profile</p>
            <h1 className="mt-1 text-4xl font-black leading-tight text-slate-950 md:text-5xl">Guest</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              This demo stores only your profile preset, preference weights, saved favorites, and open view in this browser.
            </p>
          </div>
        </header>

        <div className="mt-7 grid gap-3 md:grid-cols-3">
          <article className="rounded-[1.35rem] border border-blue-100 bg-blue-50 p-4">
            <Heart aria-hidden="true" className="h-5 w-5 text-blue-600" />
            <p className="mt-3 text-sm font-bold text-slate-600">Favorites</p>
            <p className="mt-1 text-3xl font-black text-slate-950">{favoriteCount}</p>
          </article>
          <article className="rounded-[1.35rem] border border-violet-100 bg-violet-50 p-4">
            <MapPin aria-hidden="true" className="h-5 w-5 text-violet-600" />
            <p className="mt-3 text-sm font-bold text-slate-600">Searched city</p>
            <p className="mt-1 text-3xl font-black text-slate-950">{city}</p>
          </article>
          <article className="rounded-[1.35rem] border border-emerald-100 bg-emerald-50 p-4">
            <Home aria-hidden="true" className="h-5 w-5 text-emerald-600" />
            <p className="mt-3 text-sm font-bold text-slate-600">Profile preset</p>
            <p className="mt-1 text-xl font-black text-slate-950">{profileLabels[selectedProfile]}</p>
          </article>
        </div>

        <div className="mt-7 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <section className="rounded-[1.35rem] border border-indigo-100 bg-indigo-50 p-4 lg:col-span-2">
            <div className="flex items-center gap-2">
              <LogIn aria-hidden="true" className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-black text-slate-950">Sign in or register</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Demo account actions are shown here for the tested flow. A real release would connect these buttons to authentication and saved cross-device profiles.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-black text-indigo-600 shadow-sm shadow-slate-950/5 transition-colors hover:bg-indigo-50"
                type="button"
              >
                <LogIn aria-hidden="true" className="h-4 w-4" />
                Sign in
              </button>
              <button
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 text-sm font-black text-white shadow-lg shadow-indigo-600/20 transition-colors hover:bg-indigo-700"
                type="button"
              >
                <UserPlus aria-hidden="true" className="h-4 w-4" />
                Register
              </button>
            </div>
          </section>

          <section className="rounded-[1.35rem] border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal aria-hidden="true" className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-black text-slate-950">Saved preferences</h2>
            </div>
            <div className="mt-4 grid gap-2">
              {preferenceRows.map((row) => (
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2.5" key={row.key}>
                  <span className="text-sm font-bold text-slate-600">{row.label}</span>
                  <span className="text-sm font-black text-slate-950">
                    {preferences[row.key]}
                    {row.suffix ? ` ${row.suffix}` : "/5"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.35rem] border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <Database aria-hidden="true" className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-black text-slate-950">Local data</h2>
            </div>
            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-slate-700">
              <strong className="text-slate-950">Privacy note:</strong> No personal data is sent to a server. Everything shown here is stored locally in your browser for the demo.
            </div>
            <button
              className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-black text-rose-700 transition-colors hover:bg-rose-100"
              onClick={onClearLocalData}
              type="button"
            >
              <Eraser aria-hidden="true" className="h-4 w-4" />
              Clear local data
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
              District Finder uses local dummy district data and local browser storage only. Sensitive attributes are intentionally excluded from the scoring model.
            </p>
          </section>

          <section className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <Info aria-hidden="true" className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-black text-slate-950">Impressum</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              University Smart Data prototype for exploring Hamburg district recommendations. Add project owner and contact details here before a public release.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
