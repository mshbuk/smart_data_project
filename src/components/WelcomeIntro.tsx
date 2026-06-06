import { ArrowLeft, ArrowRight, ListChecks, Map, SlidersHorizontal } from "lucide-react";
import { useI18n } from "../i18n";

type WelcomeIntroProps = {
  onBack: () => void;
  onStart: () => void;
};

const introSteps = [
  {
    en: "Choose your goal",
    de: "Wähle dein Anliegen aus",
    icon: ListChecks,
  },
  {
    en: "Set your priorities for rent, safety, transit, and lifestyle",
    de: "Setze deine Prioritäten für Miete, Sicherheit, ÖPNV und Lebensstil",
    icon: SlidersHorizontal,
  },
  {
    en: "Explore personalized recommendations, saved comparisons, and the map",
    de: "Erhalte personalisierte Empfehlungen, Vergleiche und Kartenansichten",
    icon: Map,
  },
];

export function WelcomeIntro({ onBack, onStart }: WelcomeIntroProps) {
  const { tx } = useI18n();

  return (
    <section className="mx-auto grid w-full max-w-[760px] gap-5 px-2 py-4 md:px-4 md:py-6">
      <button
        className="w-fit inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        onClick={onBack}
        type="button"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        {tx("Back", "Zurück")}
      </button>

      <div className="rounded-[2.2rem] border border-slate-200 bg-white p-7 text-left shadow-[0_20px_54px_rgba(15,23,42,0.1)] md:p-10">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-rose-500">
          {tx("Welcome", "Willkommen")}
        </p>
        <h2 className="mt-5 text-[3.25rem] font-black leading-[0.98] tracking-[-0.06em] text-slate-950 md:text-6xl">
          {tx("Let's find your district.", "Lass uns deinen Stadtteil finden.")}
        </h2>
        <p className="mt-6 max-w-3xl text-[1.35rem] font-medium leading-[1.45] tracking-[-0.03em] text-slate-500 md:text-2xl md:leading-10">
          {tx(
            "Nice to have you here. Let us find the Hamburg district that fits your life.",
            "Schön, dass du da bist. Lass uns gemeinsam den passenden Hamburger Stadtteil für dich finden.",
          )}
        </p>

        <div className="mt-8 grid gap-3">
          <h3 className="text-xl font-black uppercase tracking-[0.18em] text-slate-400">{tx("How it works", "So funktioniert's")}</h3>
            {introSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div className="grid grid-cols-[auto_auto_1fr] items-center gap-3 rounded-[1.35rem] border border-slate-200 bg-white px-4 py-3" key={step.en}>
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-950 text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-slate-500" />
                  <span className="text-base font-black leading-6 text-slate-950 md:text-lg">
                    {tx(step.en, step.de)}
                  </span>
                </div>
              );
            })}
        </div>

        <button
          className="mt-8 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-slate-950 px-8 text-lg font-black text-white shadow-xl shadow-slate-950/15 transition-transform hover:-translate-y-0.5"
          onClick={onStart}
          type="button"
        >
          {tx("Let's go", "Los geht's")}
          <ArrowRight aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
