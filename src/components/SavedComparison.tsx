import { Plus, X } from "lucide-react";
import type { DistrictMatch, Preferences } from "../types/District";
import { formatScore } from "../utils/districtInsights";
import { useI18n } from "../i18n";

type SavedComparisonProps = {
  preferences: Preferences;
  savedMatches: DistrictMatch[];
  onEditCriteria: () => void;
  onFindDistricts: () => void;
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
    label: { de: "Preise / Mietniveau", en: "Prices / rent level" },
    getDisplay: (match, language) =>
      new Intl.NumberFormat(language === "de" ? "de-DE" : "en-US", {
        maximumFractionDigits: 1,
        minimumFractionDigits: 1,
      }).format(match.district.rentPerSqm),
    getValue: (match) => Math.max(0, Math.min(10, 10 - (match.district.rentPerSqm - 10) / 1.6)),
  },
];

function axisPoint(axisIndex: number, value: number, radius: number, centerX: number, centerY: number) {
  const angle = -Math.PI / 2 + (axisIndex / chartAxes.length) * Math.PI * 2;
  const scaledRadius = (Math.max(0, Math.min(value, 10)) / 10) * radius;

  return {
    x: centerX + Math.cos(angle) * scaledRadius,
    y: centerY + Math.sin(angle) * scaledRadius,
  };
}

function polygonPoints(match: DistrictMatch, radius: number, centerX: number, centerY: number) {
  return chartAxes
    .map((axis, axisIndex) => {
      const point = axisPoint(axisIndex, axis.getValue(match), radius, centerX, centerY);
      return `${point.x},${point.y}`;
    })
    .join(" ");
}

const chartColors = ["#ef2b2d", "#2f63ee", "#6b3cf2"];

export function SavedComparison({ savedMatches, onFindDistricts }: SavedComparisonProps) {
  const { language, tx } = useI18n();
  const visibleMatches = savedMatches.slice(0, 3);
  const gridTemplateColumns = `210px repeat(${Math.max(visibleMatches.length, 1)}, minmax(160px, 1fr)) 150px`;

  if (savedMatches.length === 0) {
    return (
      <section className="-mx-4 -mt-4 grid gap-7 border-t border-border px-4 py-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xl leading-7 text-muted-foreground">
            {tx("Compare districts by your criteria.", "Vergleiche Stadtteile nach deinen Kriterien.")}
          </p>
          <button
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 text-base font-bold text-primary-foreground shadow-soft"
            onClick={onFindDistricts}
            type="button"
          >
            <Plus aria-hidden="true" className="h-5 w-5" />
            {tx("Add district", "Stadtteil hinzufügen")}
          </button>
        </div>

        <section className="rounded-[2rem] border border-border bg-card p-8 text-center shadow-card">
          <p className="text-lg font-semibold text-muted-foreground">
            {tx("No saved districts yet", "Noch keine Stadtteile gespeichert")}
          </p>
          <button
            className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-base font-bold text-primary-foreground"
            onClick={onFindDistricts}
            type="button"
          >
            <Plus aria-hidden="true" className="h-5 w-5" />
            {tx("Add district", "Stadtteil hinzufügen")}
          </button>
        </section>
      </section>
    );
  }

  return (
    <section className="-mx-4 -mt-4 grid gap-7 border-t border-border px-4 py-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xl leading-7 text-muted-foreground">
          {tx("Compare districts by your criteria.", "Vergleiche Stadtteile nach deinen Kriterien.")}
        </p>
        <button
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 text-base font-bold text-primary-foreground shadow-soft"
          onClick={onFindDistricts}
          type="button"
        >
          <Plus aria-hidden="true" className="h-5 w-5" />
          {tx("Add district", "Stadtteil hinzufügen")}
        </button>
      </div>

      <section className="rounded-[2rem] border border-border bg-card px-5 py-7 shadow-card">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground">Profil-Vergleich</p>

        <svg aria-hidden="true" className="mt-4 h-auto w-full" viewBox="0 0 620 330">
          {[0.25, 0.5, 0.75, 1].map((scale) => (
            <polygon
              fill="none"
              key={scale}
              points={chartAxes
                .map((_, axisIndex) => {
                  const point = axisPoint(axisIndex, scale * 10, 96, 310, 168);
                  return `${point.x},${point.y}`;
                })
                .join(" ")}
              stroke="#cfd4dd"
              strokeWidth="1.3"
            />
          ))}
          {chartAxes.map((axis, axisIndex) => {
            const axisEnd = axisPoint(axisIndex, 10, 96, 310, 168);
            const labelPoint = axisPoint(axisIndex, 12.5, 96, 310, 168);
            const align = axisIndex === 1 ? "start" : axisIndex === 3 ? "end" : "middle";

            return (
              <g key={axis.key}>
                <line stroke="#cfd4dd" strokeWidth="1.3" x1="310" x2={axisEnd.x} y1="168" y2={axisEnd.y} />
                <text fill="#5f6470" fontSize="16" fontWeight="500" textAnchor={align} x={labelPoint.x} y={labelPoint.y + 6}>
                  {language === "de" ? axis.label.de : axis.label.en}
                </text>
              </g>
            );
          })}
          {visibleMatches.map((match, index) => {
            const color = chartColors[index % chartColors.length];

            return (
              <polygon
                fill={color}
                fillOpacity="0.16"
                key={match.district.id}
                points={polygonPoints(match, 96, 310, 168)}
                stroke={color}
                strokeWidth="2"
              />
            );
          })}
          <g transform="translate(210 304)">
            {visibleMatches.map((match, index) => {
              const color = chartColors[index % chartColors.length];

              return (
                <g key={match.district.id} transform={`translate(${index * 132} 0)`}>
                  <rect fill={color} height="12" width="16" x="0" y="-10" />
                  <text fill={color} fontSize="15" fontWeight="600" x="22" y="1">
                    {match.district.name}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-card">
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            <div
              className="grid items-center border-b border-border bg-card text-center"
              style={{ gridTemplateColumns }}
            >
              <div />
              {visibleMatches.map((match) => (
                <div className="flex min-h-20 items-center justify-center gap-3 px-4" key={match.district.id}>
                  <span className="text-lg font-bold text-foreground">{match.district.name}</span>
                  <X aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
                </div>
              ))}
              <button
                className="inline-flex min-h-20 items-center justify-center gap-3 px-4 text-base font-semibold text-primary"
                onClick={onFindDistricts}
                type="button"
              >
                <Plus aria-hidden="true" className="h-5 w-5" />
                <span>{tx("Add district", "Stadtteil hinzufügen")}</span>
              </button>
            </div>

            <div
              className="grid items-center border-b border-border bg-primary-soft text-primary"
              style={{ gridTemplateColumns }}
            >
              <div className="px-4 py-5 text-sm font-bold uppercase tracking-[0.12em] text-accent-foreground">
                Gesamt-Score
              </div>
              {visibleMatches.map((match) => (
                <div className="px-4 py-5 text-3xl font-bold" key={match.district.id}>
                  {match.score}%
                </div>
              ))}
              <div />
            </div>

            {chartAxes.map((metric) => (
              <div
                className="grid min-h-20 items-center border-b border-border last:border-b-0"
                key={metric.key}
                style={{ gridTemplateColumns }}
              >
                <div className="flex items-center gap-3 px-4 py-4 text-lg text-foreground">
                  <span className="decoration-dotted underline underline-offset-4">
                    {language === "de" ? metric.label.de : metric.label.en}
                  </span>
                  <X aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                </div>
                {visibleMatches.map((match) => {
                  const value = metric.getValue(match);
                  const progress = `${Math.max(0, Math.min(value, 10)) * 10}%`;

                  return (
                    <div className="flex items-center gap-4 px-4 py-4" key={match.district.id}>
                      <span className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                        <span className="block h-full rounded-full bg-primary" style={{ width: progress }} />
                      </span>
                      <span className="text-lg font-bold text-foreground">{metric.getDisplay(match, language)}</span>
                    </div>
                  );
                })}
                <div />
              </div>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
