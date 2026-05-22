import {
  AlertCircle,
  Check,
  Euro,
  GraduationCap,
  Heart,
  MapPin,
  Shield,
  Train,
  TreePine,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import type { DistrictMatch } from "../types/District";

type DistrictCardProps = {
  match: DistrictMatch;
  isSaved: boolean;
  onToggleSave: (districtId: string) => void;
  rank: number;
};

type StatItem = {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
};

function getScoreTone(score: number) {
  if (score >= 85) {
    return {
      label: "Strong match",
      badge: "bg-emerald-500 text-white shadow-emerald-500/25",
      accent: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (score >= 75) {
    return {
      label: "Good match",
      badge: "bg-sky-500 text-white shadow-sky-500/25",
      accent: "border-sky-200 bg-sky-50 text-sky-700",
    };
  }

  return {
    label: "Potential fit",
    badge: "bg-orange-500 text-white shadow-orange-500/25",
    accent: "border-orange-200 bg-orange-50 text-orange-700",
  };
}

export function DistrictCard({ match, isSaved, onToggleSave, rank }: DistrictCardProps) {
  const { district } = match;
  const tone = getScoreTone(match.score);

  const stats: StatItem[] = [
    { label: "Rent", value: `EUR ${district.rentPerSqm}/sqm`, icon: Euro, color: "#059669" },
    { label: "Safety", value: `${district.safetyScore}/10`, icon: Shield, color: "#2563eb" },
    { label: "Transport", value: `${district.publicTransportScore}/10`, icon: Train, color: "#0891b2" },
    { label: "Green", value: `${district.greenScore}/10`, icon: TreePine, color: "#16a34a" },
    { label: "Schools", value: `${district.schoolScore}/10`, icon: GraduationCap, color: "#d97706" },
    { label: "Quiet", value: `${district.quietnessScore}/10`, icon: Volume2, color: "#7c3aed" },
  ];

  return (
    <article className="overflow-hidden rounded-[1.6rem] border border-white/80 bg-white shadow-[0_22px_55px_rgba(15,23,42,0.1)] transition-transform duration-200 hover:-translate-y-0.5">
      <div className="grid md:grid-cols-[240px_1fr]">
        <div className="relative min-h-[210px] overflow-hidden bg-slate-200 md:min-h-full">
          {district.imageUrl ? (
            <img
              alt=""
              className="h-full min-h-[210px] w-full object-cover md:absolute md:inset-0"
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
            <span className="mt-1 block text-[0.68rem] uppercase tracking-wide">{tone.label}</span>
          </div>
        </div>

        <div className="p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                <MapPin aria-hidden="true" className="h-4 w-4 text-indigo-500" />
                Hamburg district
              </div>
              <h3 className="mt-1 text-2xl font-black leading-tight text-slate-950">{district.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{district.shortDescription}</p>
            </div>
            <button
              aria-label={isSaved ? `Remove ${district.name} from saved districts` : `Save ${district.name}`}
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
                Best fits
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
                Trade-offs
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
                    No major trade-off
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
              className={[
                "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-black transition-colors",
                isSaved ? "bg-slate-950 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700",
              ].join(" ")}
              onClick={() => onToggleSave(district.id)}
              type="button"
            >
              <Heart aria-hidden="true" className={isSaved ? "h-4 w-4 fill-current" : "h-4 w-4"} />
              {isSaved ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
