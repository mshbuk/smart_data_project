import type { DistrictMatch } from "../types/District";
import { DistrictCard } from "./DistrictCard";

type ResultsListProps = {
  matches: DistrictMatch[];
  savedDistrictIds: string[];
  onToggleSave: (districtId: string) => void;
};

export function ResultsList({ matches, savedDistrictIds, onToggleSave }: ResultsListProps) {
  return (
    <section className="results-list">
      {matches.map((match) => (
        <DistrictCard
          isSaved={savedDistrictIds.includes(match.district.id)}
          key={match.district.id}
          match={match}
          onToggleSave={onToggleSave}
        />
      ))}
    </section>
  );
}
