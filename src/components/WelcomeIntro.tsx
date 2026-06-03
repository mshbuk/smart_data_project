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
    <section className="mx-auto w-full max-w-[1080px] px-3.5 py-5 md:px-6 md:py-8">
      <button
        className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-2xl bg-white px-4 text-sm font-black text-slate-700 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition-colors hover:bg-slate-50"
        onClick={onBack}
        type="button"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        {tx("Back", "Zurück")}
      </button>

      <div className="rounded-[2rem] border border-white/80 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-6 text-center shadow-[0_28px_90px_rgba(15,23,42,0.14)] md:p-10">
        <h2 className="text-5xl font-black leading-tight text-slate-950 md:text-6xl">{tx("Hello!", "Hallo!")}</h2>
        <p className="mx-auto mt-4 max-w-3xl text-xl font-bold leading-8 text-slate-600 md:text-2xl md:leading-10">
          {tx(
            "Nice to have you here. Let us find the Hamburg district that fits your life.",
            "Schön, dass du da bist. Lass uns gemeinsam den passenden Hamburger Stadtteil für dich finden.",
          )}
        </p>

        <div className="mx-auto mt-8 max-w-3xl rounded-[1.6rem] bg-white/90 p-5 text-left shadow-sm shadow-slate-950/5 md:p-6">
          <h3 className="text-center text-2xl font-black text-slate-950">{tx("How it works", "So funktioniert's")}</h3>
          <div className="mt-5 grid gap-4">
            {introSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div className="grid grid-cols-[auto_1fr] items-center gap-4" key={step.en}>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-100 text-lg font-black text-indigo-600">
                    {index + 1}
                  </span>
                  <span className="flex items-center gap-3 text-lg font-bold leading-7 text-slate-700 md:text-xl">
                    <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-indigo-600" />
                    {tx(step.en, step.de)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <button
          className="mt-8 inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 text-lg font-black text-white shadow-xl shadow-indigo-600/25 transition-transform hover:-translate-y-0.5"
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
