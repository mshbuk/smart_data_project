import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DistrictMatch } from "../types/District";
import { DistrictCard } from "./DistrictCard";

type ResultsListProps = {
  matches: DistrictMatch[];
  savedDistrictIds: string[];
  onOpenDetails: (districtId: string) => void;
  onToggleSave: (districtId: string) => void;
};

const matchesPerPage = 10;

export function ResultsList({ matches, savedDistrictIds, onOpenDetails, onToggleSave }: ResultsListProps) {
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
    <section className="grid gap-4">
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
        aria-label="District match pages"
        className="rounded-[1.4rem] border border-white/80 bg-white p-3 shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
      >
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <p className="text-sm font-bold text-slate-600">
            Showing{" "}
            <span className="font-black text-slate-950">
              {matches.length === 0 ? 0 : firstMatchIndex + 1}-{lastMatchIndex}
            </span>{" "}
            of <span className="font-black text-slate-950">{matches.length}</span>
            <span className="hidden sm:inline"> district matches</span>
          </p>

          <div className="flex items-center justify-between gap-2 rounded-2xl bg-slate-50 p-1 lg:hidden">
            <button
              aria-label="Previous district matches page"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-slate-600 shadow-sm shadow-slate-950/5 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
              type="button"
            >
              <ChevronLeft aria-hidden="true" className="h-5 w-5" />
            </button>

            <span className="min-w-0 px-2 text-center text-sm font-black text-slate-700">
              Page <span className="text-indigo-600">{currentPage}</span> of {totalPages}
            </span>

            <button
              aria-label="Next district matches page"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-slate-600 shadow-sm shadow-slate-950/5 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
              type="button"
            >
              <ChevronRight aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>

          <div className="hidden flex-wrap items-center justify-end gap-2 lg:flex">
            <button
              aria-label="Previous district matches page"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
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
                    "h-11 min-w-11 shrink-0 rounded-2xl px-3 text-sm font-black transition-colors",
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200",
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
              aria-label="Next district matches page"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
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
