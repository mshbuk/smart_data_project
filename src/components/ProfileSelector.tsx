import { Baby, Briefcase, Check, Compass, type LucideIcon } from "lucide-react";
import type { UserProfile } from "../types/District";

type ProfileSelectorProps = {
  selectedProfile: UserProfile;
  onSelect: (profile: UserProfile) => void;
};

type ProfileOption = {
  id: UserProfile;
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  surface: string;
};

const profiles: ProfileOption[] = [
  {
    id: "tourist",
    title: "Tourist / short-term stay",
    description: "Central energy, nightlife, and fast transit for a flexible Hamburg visit.",
    icon: Compass,
    gradient: "from-sky-500 to-indigo-600",
    surface: "bg-sky-50 text-sky-700",
  },
  {
    id: "family",
    title: "Family relocation",
    description: "Calm streets, schools, kindergartens, safety, and green space.",
    icon: Baby,
    gradient: "from-emerald-500 to-green-600",
    surface: "bg-emerald-50 text-emerald-700",
  },
  {
    id: "longTerm",
    title: "Long-term living",
    description: "A practical balance of rent, everyday transport, safety, and lifestyle.",
    icon: Briefcase,
    gradient: "from-violet-500 to-indigo-600",
    surface: "bg-violet-50 text-violet-700",
  },
];

export function ProfileSelector({ selectedProfile, onSelect }: ProfileSelectorProps) {
  return (
    <section className="rounded-[1.6rem] border border-white/80 bg-white/90 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur md:p-5">
      <div className="mb-4 px-1">
        <p className="text-xs font-black uppercase tracking-wide text-indigo-600">Starting point</p>
        <h2 className="mt-1 text-xl font-black text-[#101828]">Choose your profile</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Profiles are presets. Fine tuning below turns the setup into your custom mix.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {profiles.map((profile) => {
          const Icon = profile.icon;
          const isSelected = selectedProfile === profile.id;

          return (
            <button
              aria-pressed={isSelected}
              className={[
                "group min-h-[132px] w-full rounded-[1.25rem] border p-4 text-left transition-all",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
                isSelected
                  ? "border-indigo-300 bg-white ring-4 ring-indigo-200"
                  : "border-slate-100 bg-slate-50/70 hover:border-indigo-200 hover:bg-white",
              ].join(" ")}
              key={profile.id}
              onClick={() => onSelect(profile.id)}
              type="button"
            >
              <span className="mb-3 flex items-center justify-between gap-3">
                <span className={`grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br ${profile.gradient} text-white shadow-lg`}>
                  <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={2.4} />
                </span>
                {isSelected && (
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-indigo-600 text-white">
                    <Check aria-hidden="true" className="h-4 w-4" strokeWidth={3} />
                  </span>
                )}
              </span>
              <span className="block text-base font-black leading-6 text-slate-950">{profile.title}</span>
              <span className="mt-1.5 block text-sm leading-5 text-slate-600">{profile.description}</span>
              <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${profile.surface}`}>
                Profile defaults
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
