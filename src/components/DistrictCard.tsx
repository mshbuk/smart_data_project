import type { DistrictMatch } from "../types/District";

type DistrictCardProps = {
  match: DistrictMatch;
  isSaved: boolean;
  onToggleSave: (districtId: string) => void;
};

export function DistrictCard({ match, isSaved, onToggleSave }: DistrictCardProps) {
  const { district } = match;

  return (
    <article className="district-card">
      <div className="card-topline">
        <div>
          <h3>{district.name}</h3>
          <p>{district.shortDescription}</p>
        </div>
        <div className="score-pill">{match.score}%</div>
      </div>

      <p className="match-reason">{match.explanation}</p>

      <div className="indicator-grid">
        <span>Rent EUR {district.rentPerSqm}/sqm</span>
        <span>Safety {district.safetyScore}/10</span>
        <span>Green {district.greenScore}/10</span>
        <span>Transport {district.publicTransportScore}/10</span>
        <span>Schools {district.schoolScore}/10</span>
        <span>Quiet {district.quietnessScore}/10</span>
      </div>

      <div className="card-footer">
        <div className="highlight-list">
          {match.highlights.map((highlight) => (
            <span key={highlight}>{highlight}</span>
          ))}
        </div>
        <button className={`save-button ${isSaved ? "saved" : ""}`} onClick={() => onToggleSave(district.id)} type="button">
          {isSaved ? "Saved" : "Save"}
        </button>
      </div>
    </article>
  );
}
