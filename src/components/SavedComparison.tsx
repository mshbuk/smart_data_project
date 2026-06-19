import { useMemo, useState } from "react";
import { Check, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import type { DistrictMatch, Preferences } from "../types/District";
import { formatScore } from "../utils/districtInsights";
import { formatMonthlyRent50 } from "../utils/rent";
import { useI18n } from "../i18n";

type SavedComparisonProps = {
  matches: DistrictMatch[];
  preferences: Preferences;
  onEditCriteria: () => void;
};

type CompareMetric = {
  key: string;
  label: { de: string; en: string };
  getDisplay: (match: DistrictMatch, language: "de" | "en") => string;
  getValue: (match: DistrictMatch) => number;
};

const chartAxes: CompareMetric[] = [
  {
    key: "safety",
    label: { de: "Sicherheit", en: "Safety" },
    getDisplay: (match) => formatScore(match.district.safetyScore),
    getValue: (match) => match.district.safetyScore,
  },
  {
    key: "transport",
    label: { de: "ÖPNV-Anbindung", en: "Transit access" },
    getDisplay: (match) => formatScore(match.district.publicTransportScore),
    getValue: (match) => match.district.publicTransportScore,
  },
  {
    key: "green",
    label: { de: "Grünflächen & Natur", en: "Green areas & nature" },
    getDisplay: (match) => formatScore(match.district.greenScore),
    getValue: (match) => match.district.greenScore,
  },
  {
    key: "rent",
    label: { de: "Ø Miete für 50 m²", en: "Avg. rent for 50 m²" },
    getDisplay: (match, language) => `${formatMonthlyRent50(match.district.rentPerSqm, language)} €`,
    getValue: (match) => Math.max(0, Math.min(10, 10 - (match.district.rentPerSqm - 10) / 1.6)),
  },
];

function axisPoint(axisIndex: number, value: number, radius: number, centerX: number, centerY: number) {
  const angle = -Math.PI / 2 + (axisIndex / chartAxes.length) * Math.PI * 2;
  const scaledRadius = (Math.max(0, Math.min(value, 10)) / 10) * radius;
  return { x: centerX + Math.cos(angle) * scaledRadius, y: centerY + Math.sin(angle) * scaledRadius };
}

function polygonPoints(match: DistrictMatch, radius: number, centerX: number, centerY: number) {
  return chartAxes.map((axis, index) => {
    const point = axisPoint(index, axis.getValue(match), radius, centerX, centerY);
    return `${point.x},${point.y}`;
  }).join(" ");
}

function criteriaValue(axisKey: string, preferences: Preferences) {
  if (axisKey === "safety") return preferences.safety * 2;
  if (axisKey === "transport") return preferences.publicTransport * 2;
  if (axisKey === "green") return preferences.green * 2;
  if (axisKey === "rent") return Math.max(0, Math.min(10, 10 - (preferences.maxRentPerSqm - 10) / 1.6));
  return 0;
}

function criteriaPolygonPoints(preferences: Preferences, radius: number, centerX: number, centerY: number) {
  return chartAxes.map((axis, index) => {
    const point = axisPoint(index, criteriaValue(axis.key, preferences), radius, centerX, centerY);
    return `${point.x},${point.y}`;
  }).join(" ");
}

const chartColors = ["#ef2b2d", "#2f63ee", "#6b3cf2"];

export function SavedComparison({ matches, preferences, onEditCriteria }: SavedComparisonProps) {
  const { language, tx } = useI18n();
  const [comparisonIds, setComparisonIds] = useState(() => matches.slice(0, 3).map((match) => match.district.id));
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const visibleMatches = comparisonIds
    .map((id) => matches.find((match) => match.district.id === id))
    .filter((match): match is DistrictMatch => Boolean(match))
    .slice(0, 3);
  const pickerMatches = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(language === "de" ? "de-DE" : "en-US");
    return matches.filter((match) => !comparisonIds.includes(match.district.id) && (!normalized || match.district.name.toLocaleLowerCase().includes(normalized))).slice(0, 12);
  }, [comparisonIds, language, matches, query]);
  const gridTemplateColumns = "86px repeat(3, minmax(64px, 1fr)) 64px";
  const chart = { centerX: 340, centerY: 205, radius: 132 };
  const bestTotalScore = Math.max(0, ...visibleMatches.map((match) => match.score));

  const addDistrict = (districtId: string) => {
    setComparisonIds((current) => current.length < 3 ? [...current, districtId] : [...current.slice(1), districtId]);
    setQuery("");
    setIsPickerOpen(false);
  };

  return (
    <section className="-mx-4 -mt-4 grid gap-5 border-t border-border px-4 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm leading-5 text-muted-foreground">
          {tx("Your three best matches are compared automatically.", "Deine drei besten Treffer werden automatisch verglichen.")}
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-semibold shadow-card" onClick={onEditCriteria} type="button">
            <SlidersHorizontal aria-hidden="true" className="h-3.5 w-3.5" />
            {tx("Adjust criteria", "Kriterien anpassen")}
          </button>
          <button className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-primary px-3 text-xs font-bold text-primary-foreground shadow-soft" onClick={() => setIsPickerOpen(true)} type="button">
            <Plus aria-hidden="true" className="h-3.5 w-3.5" />
            {tx("Add district", "Stadtteil hinzufügen")}
          </button>
        </div>
      </div>

      <section className="rounded-[1.5rem] border border-border bg-card px-4 py-5 shadow-card">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Profil-Vergleich</p>
        <svg aria-hidden="true" className="mt-1 h-auto w-full" viewBox="0 0 680 420">
          {[0.25, 0.5, 0.75, 1].map((scale) => (
            <polygon key={scale} fill="none" points={chartAxes.map((_, index) => { const p = axisPoint(index, scale * 10, chart.radius, chart.centerX, chart.centerY); return `${p.x},${p.y}`; }).join(" ")} stroke="#cfd4dd" strokeWidth="1.3" />
          ))}
          {chartAxes.map((axis, index) => {
            const end = axisPoint(index, 10, chart.radius, chart.centerX, chart.centerY);
            const label = axisPoint(index, 12.05, chart.radius, chart.centerX, chart.centerY);
            return (
              <g key={axis.key}>
                <line stroke="#cfd4dd" strokeWidth="1.3" x1={chart.centerX} x2={end.x} y1={chart.centerY} y2={end.y} />
                <text fill="#5f6470" fontSize="14" fontWeight="500" textAnchor={index === 1 ? "start" : index === 3 ? "end" : "middle"} x={label.x} y={label.y + 5}>
                  {language === "de" ? axis.label.de : axis.label.en}
                </text>
              </g>
            );
          })}
          {visibleMatches.map((match, index) => <polygon key={match.district.id} fill={chartColors[index]} fillOpacity="0.14" points={polygonPoints(match, chart.radius, chart.centerX, chart.centerY)} stroke={chartColors[index]} strokeWidth="2" />)}
          <polygon fill="#6b3cf2" fillOpacity="0.05" points={criteriaPolygonPoints(preferences, chart.radius, chart.centerX, chart.centerY)} stroke="#6b3cf2" strokeDasharray="8 6" strokeWidth="3" />
          <g transform="translate(88 388)">
            {visibleMatches.map((match, index) => (
              <g key={match.district.id} transform={`translate(${index * 145} 0)`}>
                <rect fill={chartColors[index]} height="11" width="15" x="0" y="-9" />
                <text fill={chartColors[index]} fontSize="13" fontWeight="600" x="21" y="1">{match.district.name}</text>
              </g>
            ))}
            <g transform="translate(435 0)"><rect fill="#6b3cf2" height="11" width="15" x="0" y="-9" /><text fill="#6b3cf2" fontSize="13" fontWeight="600" x="21" y="1">{tx("My criteria", "Meine Kriterien")}</text></g>
          </g>
        </svg>
      </section>

      <section className="overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-card">
        <div className="grid items-center border-b border-border text-center" style={{ gridTemplateColumns }}>
          <div />
          {visibleMatches.map((match) => (
            <div className="flex min-h-12 items-center justify-center gap-0.5 px-1" key={match.district.id}>
              <span className="truncate text-[10px] font-bold leading-tight">{match.district.name}</span>
              <button aria-label={tx("Remove district", "Stadtteil entfernen")} className="rounded-full p-1 text-muted-foreground hover:bg-muted" onClick={() => setComparisonIds((ids) => ids.filter((id) => id !== match.district.id))} type="button"><X aria-hidden="true" className="h-3 w-3" /></button>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 3 - visibleMatches.length) }).map((_, index) => <div className="min-h-12" key={`empty-header-${index}`} />)}
          <button className="inline-flex min-h-12 items-center justify-center gap-0.5 px-1 text-[10px] font-semibold text-primary" onClick={() => setIsPickerOpen(true)} type="button"><Plus aria-hidden="true" className="h-3 w-3" />{tx("Add", "Neu")}</button>
        </div>
        <div className="grid items-center border-b border-border bg-primary-soft text-center text-primary" style={{ gridTemplateColumns }}>
          <div className="px-2 py-3 text-[9px] font-bold uppercase tracking-[0.08em] text-accent-foreground">Gesamt-Score</div>
          {visibleMatches.map((match) => <div className={match.score === bestTotalScore ? "px-1 py-3 text-base font-bold text-emerald-600" : "px-1 py-3 text-base font-bold"} key={match.district.id}>{match.score}%</div>)}
          {Array.from({ length: Math.max(0, 3 - visibleMatches.length) }).map((_, index) => <div key={`empty-score-${index}`} />)}<div />
        </div>
        {chartAxes.map((metric) => {
          const bestValue = Math.max(0, ...visibleMatches.map((match) => metric.getValue(match)));
          return (
            <div className="grid min-h-12 items-center border-b border-border last:border-b-0" key={metric.key} style={{ gridTemplateColumns }}>
              <div className="px-2 py-2 text-[10px] leading-tight"><span className="decoration-dotted underline underline-offset-4">{language === "de" ? metric.label.de : metric.label.en}</span></div>
              {visibleMatches.map((match) => { const value = metric.getValue(match); const isBest = value === bestValue; return (
                <div className="grid gap-1 px-1 py-2" key={match.district.id}>
                  <span className={isBest ? "h-1.5 overflow-hidden rounded-full bg-emerald-100" : "h-1.5 overflow-hidden rounded-full bg-muted"}><span className={isBest ? "block h-full rounded-full bg-emerald-500" : "block h-full rounded-full bg-primary"} style={{ width: `${Math.max(0, Math.min(value, 10)) * 10}%` }} /></span>
                  <span className={isBest ? "text-[10px] font-bold leading-none text-emerald-700" : "text-[10px] font-bold leading-none"}>{metric.getDisplay(match, language)}</span>
                </div>
              ); })}
              {Array.from({ length: Math.max(0, 3 - visibleMatches.length) }).map((_, index) => <div key={`empty-${metric.key}-${index}`} />)}<div />
            </div>
          );
        })}
      </section>

      {isPickerOpen && (
        <div className="fixed inset-0 z-[1800] grid place-items-end bg-foreground/35 p-3 backdrop-blur-sm sm:place-items-center">
          <section className="max-h-[78vh] w-full max-w-lg overflow-hidden rounded-[1.5rem] bg-card shadow-card">
            <div className="flex items-center justify-between border-b border-border p-4"><div><h2 className="text-base font-bold">{tx("Choose district", "Stadtteil auswählen")}</h2><p className="text-xs text-muted-foreground">{comparisonIds.length >= 3 ? tx("The new district replaces the first column.", "Der neue Stadtteil ersetzt die erste Spalte.") : tx("Add another district to the comparison.", "Füge einen weiteren Stadtteil hinzu.")}</p></div><button aria-label={tx("Close", "Schließen")} className="rounded-full p-2 hover:bg-muted" onClick={() => setIsPickerOpen(false)} type="button"><X className="h-4 w-4" /></button></div>
            <label className="m-3 flex min-h-10 items-center gap-2 rounded-full border border-border px-3"><Search className="h-4 w-4 text-muted-foreground" /><input autoFocus className="min-w-0 flex-1 bg-transparent text-sm outline-none" onChange={(event) => setQuery(event.target.value)} placeholder={tx("Search district...", "Stadtteil suchen...")} value={query} /></label>
            <div className="grid max-h-[55vh] gap-1 overflow-y-auto p-3 pt-0">
              {pickerMatches.map((match) => <button className="flex items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-muted" key={match.district.id} onClick={() => addDistrict(match.district.id)} type="button"><span><span className="block text-sm font-semibold">{match.district.name}</span><span className="text-xs text-muted-foreground">{match.score}% Match</span></span><Check className="h-4 w-4 text-primary" /></button>)}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
