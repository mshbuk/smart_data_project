import type { DistrictMatch } from "../types/District";

type SavedComparisonProps = {
  savedMatches: DistrictMatch[];
};

export function SavedComparison({ savedMatches }: SavedComparisonProps) {
  if (savedMatches.length === 0) {
    return (
      <section className="empty-state">
        <h2>No saved districts yet</h2>
        <p>Save districts from the recommendations to compare them here.</p>
      </section>
    );
  }

  return (
    <section className="comparison-list">
      {savedMatches.map(({ district, score }) => (
        <article className="comparison-card" key={district.id}>
          <div>
            <h3>{district.name}</h3>
            <span>{score}% match</span>
          </div>
          <dl>
            <div>
              <dt>Rent</dt>
              <dd>EUR {district.rentPerSqm}/sqm</dd>
            </div>
            <div>
              <dt>Safety</dt>
              <dd>{district.safetyScore}/10</dd>
            </div>
            <div>
              <dt>Green</dt>
              <dd>{district.greenScore}/10</dd>
            </div>
            <div>
              <dt>Transport</dt>
              <dd>{district.publicTransportScore}/10</dd>
            </div>
            <div>
              <dt>Schools</dt>
              <dd>{district.schoolScore}/10</dd>
            </div>
            <div>
              <dt>Quietness</dt>
              <dd>{district.quietnessScore}/10</dd>
            </div>
            <div>
              <dt>Nightlife</dt>
              <dd>{district.nightlifeScore}/10</dd>
            </div>
            <div>
              <dt>Density</dt>
              <dd>{district.populationDensity}/km2</dd>
            </div>
          </dl>
        </article>
      ))}
    </section>
  );
}
