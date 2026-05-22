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
    <section className="mt-7">
      <div className="mb-4 flex items-start gap-3 px-1">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[#101828] text-sm font-black text-white shadow-lg shadow-slate-900/15">
          1
        </span>
        <div>
          <h2 className="m-0 text-xl font-black text-[#101828]">Choose your profile</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Your profile sets a smart starting point. Every priority can still be adjusted.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {profiles.map((profile) => {
          const Icon = profile.icon;
          const isSelected = selectedProfile === profile.id;

          return (
            <button
              aria-pressed={isSelected}
              className={[
                "group min-h-[150px] w-full rounded-[1.4rem] border p-4 text-left shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition-all",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
                isSelected
                  ? "border-indigo-300 bg-white ring-4 ring-indigo-200"
                  : "border-white/80 bg-white/80 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-white",
              ].join(" ")}
              key={profile.id}
              onClick={() => onSelect(profile.id)}
              type="button"
            >
              <span className="mb-4 flex items-center justify-between gap-3">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${profile.gradient} text-white shadow-lg`}>
                  <Icon aria-hidden="true" className="h-6 w-6" strokeWidth={2.4} />
                </span>
                {isSelected && (
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-indigo-600 text-white">
                    <Check aria-hidden="true" className="h-4 w-4" strokeWidth={3} />
                  </span>
                )}
              </span>
              <span className="block text-base font-black leading-6 text-slate-950">{profile.title}</span>
              <span className="mt-2 block text-sm leading-6 text-slate-600">{profile.description}</span>
              <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-bold ${profile.surface}`}>
                Profile defaults
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
