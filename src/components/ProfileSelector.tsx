import type { UserProfile } from "../types/District";

type ProfileSelectorProps = {
  selectedProfile: UserProfile;
  onSelect: (profile: UserProfile) => void;
};

const profiles: Array<{ id: UserProfile; title: string; description: string }> = [
  {
    id: "tourist",
    title: "Tourist / short-term stay",
    description: "Transport, nightlife, and central energy.",
  },
  {
    id: "family",
    title: "Family relocation",
    description: "Schools, kindergartens, calm streets, and green areas.",
  },
  {
    id: "longTerm",
    title: "Long-term living",
    description: "Rent, transit, safety, and lifestyle balance.",
  },
];

export function ProfileSelector({ selectedProfile, onSelect }: ProfileSelectorProps) {
  return (
    <section className="mt-3.5 rounded-lg border border-[#d8e3e8] bg-white p-4 shadow-[0_10px_28px_rgba(27,53,74,0.08)] md:p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#245b49] text-sm font-extrabold text-white">
          1
        </span>
        <div>
          <h2 className="m-0 text-xl font-extrabold text-[#172737]">Choose your profile</h2>
          <p className="mt-1 text-[#62707d]">Your profile sets useful defaults. You can adjust every preference next.</p>
        </div>
      </div>

      <div className="mt-4 grid gap-2.5 md:grid-cols-3">
        {profiles.map((profile) => (
          <button
            className={[
              "w-full rounded-lg border p-3.5 text-left transition-colors",
              selectedProfile === profile.id
                ? "border-[#245b49] bg-[#e8f3ee] ring-1 ring-[#245b49]"
                : "border-[#d5e1e6] bg-[#f9fbfc] hover:border-[#245b49]/60",
            ].join(" ")}
            key={profile.id}
            onClick={() => onSelect(profile.id)}
            type="button"
          >
            <span className="block font-extrabold text-[#1e2e3c]">{profile.title}</span>
            <small className="mt-1 block leading-5 text-[#667480]">{profile.description}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
