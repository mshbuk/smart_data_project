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
    <section className="panel">
      <div className="section-heading">
        <span className="step-badge">1</span>
        <div>
          <h2>Choose your profile</h2>
          <p>Your profile sets useful defaults. You can adjust every preference next.</p>
        </div>
      </div>

      <div className="profile-grid">
        {profiles.map((profile) => (
          <button
            className={`profile-option ${selectedProfile === profile.id ? "selected" : ""}`}
            key={profile.id}
            onClick={() => onSelect(profile.id)}
            type="button"
          >
            <span>{profile.title}</span>
            <small>{profile.description}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
