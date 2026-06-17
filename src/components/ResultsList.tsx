import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DistrictMatch } from "../types/District";
import { DistrictCard } from "./DistrictCard";
import { useI18n } from "../i18n";

type ResultsListProps = {
  matches: DistrictMatch[];
  savedDistrictIds: string[];
  onOpenDetails: (districtId: string) => void;
  onToggleSave: (districtId: string) => void;
};

const matchesPerPage = 10;

export function ResultsList({ matches, savedDistrictIds, onOpenDetails, onToggleSave }: ResultsListProps) {
  const { tx } = useI18n();
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(matches.length / matchesPerPage));
  const firstMatchIndex = (currentPage - 1) * matchesPerPage;
  const lastMatchIndex = Math.min(firstMatchIndex + matchesPerPage, matches.length);
  const visibleMatches = matches.slice(firstMatchIndex, lastMatchIndex);
  const pageNumbers = useMemo(() => Array.from({ length: totalPages }, (_, index) => index + 1), [totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [matches]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  return (
    <section className="mx-auto grid w-full max-w-xl gap-5">
      {visibleMatches.map((match, index) => (
        <DistrictCard
          isSaved={savedDistrictIds.includes(match.district.id)}
          key={match.district.id}
          match={match}
          onOpenDetails={onOpenDetails}
          onToggleSave={onToggleSave}
          rank={firstMatchIndex + index + 1}
        />
      ))}

      <nav
        aria-label={tx("District match pages", "Stadtteil-Trefferseiten")}
        className="rounded-2xl border border-border bg-card p-3 shadow-card"
      >
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <p className="text-sm font-semibold text-muted-foreground">
            {tx("Showing", "Zeige")}{" "}
            <span className="font-semibold text-foreground">
              {matches.length === 0 ? 0 : firstMatchIndex + 1}-{lastMatchIndex}
            </span>{" "}
            {tx("of", "von")} <span className="font-semibold text-foreground">{matches.length}</span>
            <span className="hidden sm:inline"> {tx("district matches", "Stadtteil-Treffern")}</span>
          </p>

          <div className="flex items-center justify-between gap-2 rounded-full bg-muted p-1 lg:hidden">
            <button
              aria-label={tx("Previous district matches page", "Vorherige Trefferseite")}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-card text-muted-foreground shadow-card transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
              type="button"
            >
              <ChevronLeft aria-hidden="true" className="h-5 w-5" />
            </button>

            <span className="min-w-0 px-2 text-center text-sm font-semibold text-muted-foreground">
              {tx("Page", "Seite")} <span className="text-foreground">{currentPage}</span> {tx("of", "von")} {totalPages}
            </span>

            <button
              aria-label={tx("Next district matches page", "Nächste Trefferseite")}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-card text-muted-foreground shadow-card transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              disabled={currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
              type="button"
            >
              <ChevronRight aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>

          <div className="hidden flex-wrap items-center justify-end gap-2 lg:flex">
            <button
              aria-label={tx("Previous district matches page", "Vorherige Trefferseite")}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground transition-colors hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-40"
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
              type="button"
            >
              <ChevronLeft aria-hidden="true" className="h-5 w-5" />
            </button>

            {pageNumbers.map((pageNumber) => {
              const isActive = currentPage === pageNumber;

              return (
                <button
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "h-10 min-w-10 shrink-0 rounded-xl px-3 text-sm font-bold transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "bg-muted text-muted-foreground hover:bg-primary-soft",
                  ].join(" ")}
                  key={pageNumber}
                  onClick={() => goToPage(pageNumber)}
                  type="button"
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              aria-label={tx("Next district matches page", "Nächste Trefferseite")}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground transition-colors hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-40"
              disabled={currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
              type="button"
            >
              <ChevronRight aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>
    </section>
  );
}
