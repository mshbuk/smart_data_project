import {
  AlertCircle,
  Check,
  Euro,
  GraduationCap,
  Heart,
  Info,
  Shield,
  Train,
  TreePine,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import type { DistrictMatch } from "../types/District";
import { formatScore } from "../utils/districtInsights";
import { useI18n } from "../i18n";

type DistrictCardProps = {
  match: DistrictMatch;
  isSaved: boolean;
  onToggleSave: (districtId: string) => void;
  onOpenDetails?: (districtId: string) => void;
  rank: number;
};

type StatItem = {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
};

function getScoreTone(score: number, tx: (english: string, german: string) => string) {
  if (score >= 85) {
    return {
      label: tx("Strong match", "Starke Passung"),
      badge: "bg-emerald-500 text-white shadow-emerald-500/25",
      accent: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (score >= 75) {
    return {
      label: tx("Good match", "Gute Passung"),
      badge: "bg-sky-500 text-white shadow-sky-500/25",
      accent: "border-sky-200 bg-sky-50 text-sky-700",
    };
  }

  return {
    label: tx("Potential fit", "Mögliche Passung"),
    badge: "bg-orange-500 text-white shadow-orange-500/25",
    accent: "border-orange-200 bg-orange-50 text-orange-700",
  };
}

export function DistrictCard({ match, isSaved, onToggleSave, onOpenDetails, rank }: DistrictCardProps) {
  const { language, tx } = useI18n();
  const { district } = match;
  const tone = getScoreTone(match.score, tx);

  const stats: StatItem[] = [
    {
      label: tx("Rent", "Miete"),
      value: `EUR ${new Intl.NumberFormat(language === "de" ? "de-DE" : "en-US").format(district.rentPerSqm)}/${tx("sqm", "qm")}`,
      icon: Euro,
      color: "#059669",
    },
    { label: tx("Safety", "Sicherheit"), value: `${formatScore(district.safetyScore)}/10`, icon: Shield, color: "#2563eb" },
    { label: tx("Transport", "Verkehr"), value: `${formatScore(district.publicTransportScore)}/10`, icon: Train, color: "#0891b2" },
    { label: tx("Green", "Grün"), value: `${formatScore(district.greenScore)}/10`, icon: TreePine, color: "#16a34a" },
    { label: tx("Schools", "Schulen"), value: `${formatScore(district.schoolScore)}/10`, icon: GraduationCap, color: "#d97706" },
    { label: tx("Quiet", "Ruhe"), value: `${formatScore(district.quietnessScore)}/10`, icon: Volume2, color: "#7c3aed" },
  ];

  return (
    <article className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_16px_42px_rgba(15,23,42,0.08)] transition-transform duration-200 hover:-translate-y-0.5">
      <div className="grid">
        <button
          aria-label={tx(`Open ${district.name} details`, `${district.name} Details öffnen`)}
          className="group relative min-h-[300px] overflow-hidden bg-slate-200 text-left"
          onClick={() => onOpenDetails?.(district.id)}
          type="button"
        >
          {district.imageUrl ? (
            <img
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              src={district.imageUrl}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-sky-100 to-indigo-200" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/15 to-transparent" />
          <div className="absolute left-4 top-4 rounded-2xl bg-white/90 px-3 py-2 text-sm font-black text-slate-950 shadow-lg backdrop-blur">
            #{rank}
          </div>
          <div className={`absolute bottom-4 left-4 rounded-2xl px-3 py-2 font-black shadow-lg ${tone.badge}`}>
            <span className="block text-2xl leading-none">{match.score}%</span>
            <span className="mt-1 block text-[0.68rem] uppercase tracking-wide">Match</span>
          </div>
          <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-2xl bg-white/90 px-3 py-2 text-xs font-black text-slate-800 opacity-100 shadow-lg backdrop-blur transition-colors group-hover:bg-indigo-600 group-hover:text-white">
            <Info aria-hidden="true" className="h-4 w-4" />
            {tx("Details", "Details")}
          </span>
        </button>

        <div className="p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="mt-1 text-2xl font-black leading-tight text-slate-950">{district.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {tx(district.shortDescription, district.shortDescription)}
              </p>
            </div>
            <button
              aria-label={
                isSaved
                  ? tx(`Remove ${district.name} from saved districts`, `${district.name} aus Gespeichert entfernen`)
                  : tx(`Save ${district.name}`, `${district.name} speichern`)
              }
              className={[
                "grid h-11 w-11 shrink-0 place-items-center rounded-2xl border transition-all",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
                isSaved
                  ? "border-rose-200 bg-rose-50 text-rose-500"
                  : "border-slate-200 bg-slate-50 text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500",
              ].join(" ")}
              onClick={() => onToggleSave(district.id)}
              type="button"
            >
              <Heart aria-hidden="true" className={isSaved ? "h-5 w-5 fill-current" : "h-5 w-5"} />
            </button>
          </div>

          <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">{match.explanation}</p>

          <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div className="flex min-w-0 items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2" key={stat.label}>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white" style={{ color: stat.color }}>
                    <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={2.4} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.68rem] font-black uppercase tracking-wide text-slate-400">{stat.label}</span>
                    <span className="block truncate text-sm font-black text-slate-800">{stat.value}</span>
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-black text-slate-900">
                <Check aria-hidden="true" className="h-4 w-4 text-emerald-500" />
                {tx("Best fits", "Passt besonders")}
              </div>
              <div className="flex flex-wrap gap-2">
                {match.strengths.map((strength) => (
                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700" key={strength}>
                    {strength}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-black text-slate-900">
                <AlertCircle aria-hidden="true" className="h-4 w-4 text-rose-500" />
                {tx("Trade-offs", "Kompromisse")}
              </div>
              <div className="flex flex-wrap gap-2">
                {match.tradeoffs.length ? (
                  match.tradeoffs.map((tradeoff) => (
                    <span className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700" key={tradeoff}>
                      {tradeoff}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                    {tx("No major trade-off", "Kein grosser Kompromiss")}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {match.highlights.slice(0, 3).map((highlight) => (
                <span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${tone.accent}`} key={highlight}>
                  {highlight}
                </span>
              ))}
            </div>
            <button
              className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 text-sm font-black text-white shadow-lg shadow-violet-600/25 transition-transform hover:-translate-y-0.5"
              onClick={() => onOpenDetails?.(district.id)}
              type="button"
            >
              {tx("Full view", "Vollständige Ansicht")}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
