import {
  CalendarCheck,
  Heart,
  LogOut,
  Settings2,
  Shield,
  Trash2,
  UserRound,
  Globe2,
} from "lucide-react";
import type { Preferences, UserProfile } from "../types/District";
import { useI18n } from "../i18n";

type ProfilePageProps = {
  city: string;
  favoriteCount: number;
  savedEventCount: number;
  preferences: Preferences;
  selectedProfile: UserProfile;
  onBack: () => void;
  onChangeProfile: () => void;
  onClearLocalData: () => void;
  onEditCriteria: () => void;
  onLogout: () => void;
  onOpenComparison: () => void;
};

function EmptyState({ children }: { children: string }) {
  return (
    <div className="grid min-h-20 place-items-center rounded-[1.35rem] border border-dashed border-border bg-background px-5 text-center text-base font-medium text-muted-foreground">
      {children}
    </div>
  );
}

export function ProfilePage({
  favoriteCount,
  savedEventCount,
  onClearLocalData,
  onEditCriteria,
  onLogout,
  onOpenComparison,
}: ProfilePageProps) {
  const { tx } = useI18n();

  return (
    <section className="-mx-4 -mt-4 grid gap-6 border-t border-border px-4 py-5">
      <section className="rounded-[1.7rem] border border-border bg-card px-6 py-6 shadow-card">
        <div className="flex items-center gap-4">
          <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
            <UserRound aria-hidden="true" className="h-9 w-9" strokeWidth={2.4} />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold text-foreground">wdjwk</h2>
            <p className="mt-1 truncate text-base font-medium text-muted-foreground">wdjwk@lejdI</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="flex items-center gap-3 text-lg font-bold text-foreground">
          <Heart aria-hidden="true" className="h-5 w-5 text-primary" strokeWidth={2.3} />
          Favoriten
        </h2>
        {favoriteCount > 0 ? (
          <button
            className="grid min-h-20 place-items-center rounded-[1.35rem] border border-dashed border-border bg-background px-5 text-center text-base font-medium text-muted-foreground"
            onClick={onOpenComparison}
            type="button"
          >
            {favoriteCount} {tx("favorites saved", "Favoriten gespeichert")}
          </button>
        ) : (
          <EmptyState>{tx("No favorites yet", "Noch keine Favoriten")}</EmptyState>
        )}
      </section>

      <section className="grid gap-3">
        <h2 className="flex items-center gap-3 text-lg font-bold text-foreground">
          <CalendarCheck aria-hidden="true" className="h-5 w-5 text-primary" strokeWidth={2.3} />
          Gespeicherte Events
        </h2>
        {savedEventCount > 0 ? (
          <div className="grid min-h-20 place-items-center rounded-[1.35rem] border border-dashed border-border bg-background px-5 text-center text-base font-medium text-muted-foreground">
            {savedEventCount} {tx("saved events", "gespeicherte Events")}
          </div>
        ) : (
          <EmptyState>{tx("No saved events yet", "Noch keine gespeicherten Events")}</EmptyState>
        )}
      </section>

      <section className="grid gap-3">
        <h2 className="text-lg font-bold text-foreground">Einstellungen</h2>

        <button
          className="flex min-h-14 items-center gap-4 rounded-[1.35rem] border border-border bg-card px-5 text-left text-base font-medium text-foreground shadow-card transition-colors hover:bg-muted"
          onClick={onEditCriteria}
          type="button"
        >
          <Settings2 aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
          Antworten bearbeiten
        </button>

        <div className="flex min-h-14 items-center gap-4 rounded-[1.35rem] border border-border bg-card px-5 text-base font-medium text-foreground shadow-card">
          <Globe2 aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
          <span className="flex-1">Sprache</span>
          <span className="text-sm text-muted-foreground">→ oben rechts</span>
        </div>

        <div className="flex min-h-14 items-center gap-4 rounded-[1.35rem] border border-border bg-card px-5 text-base font-medium text-foreground shadow-card">
          <Shield aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
          Datenschutz
        </div>

        <button
          className="flex min-h-14 items-center gap-4 rounded-[1.35rem] border border-border bg-card px-5 text-left text-base font-medium text-foreground shadow-card transition-colors hover:bg-muted"
          onClick={onLogout}
          type="button"
        >
          <LogOut aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
          Abmelden
        </button>

        <button
          className="flex min-h-14 items-center gap-4 rounded-[1.35rem] border border-rose-200 bg-card px-5 text-left text-base font-medium text-rose-600 shadow-card transition-colors hover:bg-rose-50"
          onClick={onClearLocalData}
          type="button"
        >
          <Trash2 aria-hidden="true" className="h-5 w-5" />
          Konto löschen
        </button>
      </section>
    </section>
  );
}
