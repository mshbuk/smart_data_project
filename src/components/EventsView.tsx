import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  Heart,
  MapPin,
  MessageCircle,
  Navigation,
  Send,
  Share2,
  X,
} from "lucide-react";
import events from "../data/events.json";
import type { CityEvent, EventCategory, EventComment } from "../types/Event";
import { useI18n } from "../i18n";

type DateFilter = "all" | "today" | "week" | "weekend";

const cityEvents = events as CityEvent[];
const categoryFilters: Array<EventCategory | "all"> = ["all", "music", "food", "sport", "culture"];
const dateFilters: DateFilter[] = ["all", "today", "week", "weekend"];
const categoryEmoji: Record<EventCategory, string> = {
  culture: "🎭",
  food: "🍽️",
  music: "🎵",
  sport: "🏃",
};

function parseEventDate(date: string) {
  return new Date(`${date}T12:00:00`);
}

function formatEventDate(date: string, language: "de" | "en") {
  return new Intl.DateTimeFormat(language === "de" ? "de-DE" : "en-US", {
    day: "2-digit",
    month: "short",
    weekday: "short",
  }).format(parseEventDate(date));
}

function getFirstDateLabel(event: CityEvent, language: "de" | "en") {
  const first = formatEventDate(event.dates[0], language);
  if (event.dates.length === 1) return first;
  return `${first} +${event.dates.length - 1}`;
}

function eventMatchesDateFilter(event: CityEvent, filter: DateFilter) {
  if (filter === "all") return true;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);

  return event.dates.some((date) => {
    const parsed = parseEventDate(date);
    if (filter === "today") return parsed.toDateString() === today.toDateString();
    if (filter === "week") return parsed >= today && parsed <= weekEnd;
    return parsed.getDay() === 0 || parsed.getDay() === 6;
  });
}

function getCategoryLabel(category: EventCategory | "all", tx: (english: string, german: string) => string) {
  const labels: Record<EventCategory | "all", string> = {
    all: tx("All", "Alle"),
    culture: tx("Culture", "Kultur"),
    food: "Food",
    music: "Musik",
    sport: "Sport",
  };

  return labels[category];
}

function getDateFilterLabel(filter: DateFilter, tx: (english: string, german: string) => string) {
  const labels: Record<DateFilter, string> = {
    all: tx("All", "Alle"),
    today: tx("Today", "Heute"),
    week: tx("This week", "Diese Woche"),
    weekend: tx("Weekend", "Wochenende"),
  };

  return labels[filter];
}

function createCalendarDownload(event: CityEvent) {
  const start = event.dates[0].replace(/-/g, "");
  const endDate = new Date(parseEventDate(event.dates[0]));
  endDate.setDate(endDate.getDate() + 1);
  const end = `${endDate.getFullYear()}${String(endDate.getMonth() + 1).padStart(2, "0")}${String(endDate.getDate()).padStart(2, "0")}`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Moin//Hamburg Events//DE",
    "BEGIN:VEVENT",
    `UID:${event.id}@moin.local`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${event.title}`,
    `LOCATION:${event.address}`,
    `DESCRIPTION:${event.description}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.id}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}

function ChatModal({
  comment,
  onClose,
}: {
  comment: EventComment;
  onClose: () => void;
}) {
  const { tx } = useI18n();
  const [message, setMessage] = useState("");

  return (
    <div className="fixed inset-0 z-[1600] grid place-items-end bg-slate-950/45 px-3 py-4 backdrop-blur-sm md:place-items-center">
      <section className="w-full max-w-[560px] rounded-[1.8rem] bg-white p-4 shadow-[0_24px_90px_rgba(15,23,42,0.32)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-violet-50 text-3xl">{comment.avatar}</span>
            <div>
              <h3 className="text-xl font-black text-slate-950">{comment.name}</h3>
              <p className="text-sm font-bold text-slate-500">{comment.bio}</p>
              <p className="mt-1 inline-flex items-center gap-1 text-sm font-black text-emerald-600">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                online
              </p>
            </div>
          </div>
          <button
            aria-label={tx("Close chat", "Chat schließen")}
            className="grid h-10 w-10 place-items-center rounded-full bg-slate-50 text-slate-700 hover:bg-slate-100"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid min-h-[260px] place-items-center rounded-[1.35rem] bg-slate-50 p-6 text-center text-sm font-bold text-slate-500">
          {tx("Write the first message", "Schreib die erste Nachricht")} ✍️
        </div>

        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
          <input
            className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
            onChange={(event) => setMessage(event.target.value)}
            placeholder={tx("Write a message...", "Nachricht schreiben...")}
            value={message}
          />
          <button
            aria-label={tx("Send message", "Nachricht senden")}
            className="grid h-12 w-12 place-items-center rounded-full bg-violet-600 text-white shadow-lg shadow-violet-600/25 hover:bg-violet-700"
            onClick={() => setMessage("")}
            type="button"
          >
            <Send aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );
}

function EventDetail({
  event,
  isSignedUp,
  onBack,
  onChat,
  onToggleSignUp,
}: {
  event: CityEvent;
  isSignedUp: boolean;
  onBack: () => void;
  onChat: (comment: EventComment) => void;
  onToggleSignUp: (eventId: string) => void;
}) {
  const { language, tx } = useI18n();
  const attendees = event.attendees + (isSignedUp ? 1 : 0);

  return (
    <section className="mx-auto grid max-w-[760px] gap-4">
      <div className="flex items-center justify-between gap-3">
        <button
          className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-white px-4 text-sm font-black text-slate-700 shadow-sm shadow-slate-950/5 transition-colors hover:bg-slate-50"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          {tx("Back", "Zurück")}
        </button>
        <div className="flex gap-2">
          <button className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-slate-900 shadow-sm shadow-slate-950/5" type="button">
            <Heart aria-hidden="true" className={isSignedUp ? "h-5 w-5 fill-violet-600 text-violet-600" : "h-5 w-5"} />
          </button>
          <button className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-slate-900 shadow-sm shadow-slate-950/5" type="button">
            <Share2 aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
      </div>

      <article className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
        <img alt="" className="h-[320px] w-full object-cover" src={event.imageUrl} />
        <div className="grid gap-4 p-5">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-violet-600">
              {getFirstDateLabel(event, language)} · {event.time}
            </p>
            <h2 className="mt-2 text-3xl font-black leading-tight text-slate-950">{event.title}</h2>
            <p className="mt-2 flex items-center gap-2 text-base font-bold text-slate-600">
              <MapPin aria-hidden="true" className="h-5 w-5" />
              {event.venue}, {event.district}
            </p>
            <span className="mt-3 inline-flex rounded-full bg-amber-100 px-3 py-1.5 text-sm font-black text-amber-950">
              {event.price}
            </span>
          </div>

          <p className="text-base leading-7 text-slate-700">{event.description}</p>

          <button
            className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 text-sm font-black text-white shadow-lg shadow-violet-600/25 transition-transform hover:-translate-y-0.5"
            onClick={() => onToggleSignUp(event.id)}
            type="button"
          >
            {isSignedUp ? tx("Signed up", "Ich gehe hin") : tx("Sign up", "Zur Anmeldung")}
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
          </button>
          {event.sourceUrl && (
            <p className="text-center text-xs font-bold text-slate-500">
              {tx("Externally managed demo source", "Extern verwaltete Demo-Quelle")}:{" "}
              <a className="text-violet-600 underline-offset-4 hover:underline" href={event.sourceUrl} rel="noreferrer" target="_blank">
                {event.sourceLabel}
              </a>
            </p>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-800 hover:bg-slate-50"
              onClick={() => createCalendarDownload(event)}
              type="button"
            >
              <CalendarDays aria-hidden="true" className="h-4 w-4" />
              {tx("Add to calendar", "Kalender hinzufügen")}
            </button>
            <a
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-800 hover:bg-slate-50"
              href={event.mapUrl}
              rel="noreferrer"
              target="_blank"
            >
              <Navigation aria-hidden="true" className="h-4 w-4" />
              {tx("Plan route", "Route planen")}
            </a>
          </div>
        </div>
      </article>

      <section className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
        <h3 className="text-xl font-black text-slate-950">Community</h3>
        <p className="mt-2 text-sm font-bold text-slate-500">
          {attendees} {tx("people interested", "Personen interessiert")}
        </p>
        <div className="mt-3 flex items-center">
          {event.comments.slice(0, 6).map((comment) => (
            <span
              className="-ml-2 first:ml-0 grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-violet-50 text-xl shadow-sm"
              key={comment.name}
              title={comment.name}
            >
              {comment.avatar}
            </span>
          ))}
          <span className="-ml-2 grid h-10 min-w-10 place-items-center rounded-full border-2 border-white bg-slate-100 px-2 text-xs font-black text-slate-600">
            +{Math.max(0, attendees - event.comments.length)}
          </span>
        </div>

        <div className="mt-5 grid gap-3">
          {event.comments.map((comment) => (
            <article className="rounded-[1.35rem] border border-slate-200 bg-white p-4" key={comment.name}>
              <div className="flex justify-between gap-3">
                <div className="flex gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-violet-50 text-2xl">{comment.avatar}</span>
                  <div>
                    <h4 className="text-base font-black text-slate-950">{comment.name}</h4>
                    <p className="text-xs font-bold text-slate-500">{comment.bio}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-500">♡ {comment.likes}</span>
              </div>
              <p className="mt-3 text-base leading-6 text-slate-800">{comment.message}</p>
              <button
                className="mt-3 inline-flex items-center gap-2 text-sm font-black text-violet-600"
                onClick={() => onChat(comment)}
                type="button"
              >
                <MessageCircle aria-hidden="true" className="h-4 w-4" />
                {tx("Message", "Anschreiben")}
              </button>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

export function EventsView() {
  const { language, tx } = useI18n();
  const [category, setCategory] = useState<EventCategory | "all">("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [signedUpEventIds, setSignedUpEventIds] = useState<string[]>([]);
  const [chatComment, setChatComment] = useState<EventComment | null>(null);
  const districts = useMemo(() => Array.from(new Set(cityEvents.map((event) => event.district))).sort(), []);
  const filteredEvents = useMemo(
    () =>
      cityEvents.filter((event) => {
        const categoryMatch = category === "all" || event.category === category;
        const districtMatch = districtFilter === "all" || event.district === districtFilter;
        return categoryMatch && districtMatch && eventMatchesDateFilter(event, dateFilter);
      }),
    [category, dateFilter, districtFilter],
  );
  const selectedEvent = selectedEventId ? cityEvents.find((event) => event.id === selectedEventId) : undefined;

  const toggleSignUp = (eventId: string) => {
    setSignedUpEventIds((current) =>
      current.includes(eventId) ? current.filter((id) => id !== eventId) : [...current, eventId],
    );
  };

  if (selectedEvent) {
    return (
      <>
        <EventDetail
          event={selectedEvent}
          isSignedUp={signedUpEventIds.includes(selectedEvent.id)}
          onBack={() => setSelectedEventId(null)}
          onChat={setChatComment}
          onToggleSignUp={toggleSignUp}
        />
        {chatComment && <ChatModal comment={chatComment} onClose={() => setChatComment(null)} />}
      </>
    );
  }

  return (
    <section className="mx-auto grid max-w-[820px] gap-4">
      <div className="rounded-[1.8rem] border border-slate-200 bg-white p-4 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
        <div className="grid grid-cols-2 rounded-full bg-slate-100 p-1 text-sm font-black text-slate-500">
          <button className="rounded-full bg-white px-4 py-3 text-slate-950 shadow-sm" type="button">
            {tx("Discover", "Entdecken")}
          </button>
          <button className="rounded-full px-4 py-3" type="button">
            {tx("Saved", "Gespeichert")}
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-violet-600">Moin Events</p>
            <h2 className="mt-1 text-3xl font-black text-slate-950">Events</h2>
          </div>
          <select
            className="min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-800 outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
            onChange={(event) => setDistrictFilter(event.target.value)}
            value={districtFilter}
          >
            <option value="all">{tx("All districts", "Alle Stadtteile")}</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {dateFilters.map((filter) => (
            <button
              aria-pressed={dateFilter === filter}
              className={[
                "shrink-0 rounded-full border px-4 py-2 text-sm font-black transition-colors",
                dateFilter === filter
                  ? "border-violet-600 bg-violet-600 text-white"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
              ].join(" ")}
              key={filter}
              onClick={() => setDateFilter(filter)}
              type="button"
            >
              {getDateFilterLabel(filter, tx)}
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {categoryFilters.map((filter) => (
            <button
              aria-pressed={category === filter}
              className={[
                "shrink-0 rounded-full border px-4 py-2 text-sm font-black transition-colors",
                category === filter
                  ? "border-violet-600 bg-violet-600 text-white"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
              ].join(" ")}
              key={filter}
              onClick={() => setCategory(filter)}
              type="button"
            >
              {filter !== "all" ? `${categoryEmoji[filter]} ` : ""}
              {getCategoryLabel(filter, tx)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {filteredEvents.length ? (
          filteredEvents.map((event) => (
            <button
              className="grid grid-cols-[96px_1fr] gap-4 rounded-[1.6rem] border border-slate-200 bg-white p-3 text-left shadow-[0_12px_34px_rgba(15,23,42,0.06)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(15,23,42,0.1)]"
              key={event.id}
              onClick={() => setSelectedEventId(event.id)}
              type="button"
            >
              <img alt="" className="h-24 w-24 rounded-[1.25rem] object-cover" loading="lazy" src={event.imageUrl} />
              <span className="min-w-0 py-1">
                <span className="block text-sm font-black text-violet-600">
                  {getFirstDateLabel(event, language)} · {event.time}
                </span>
                <span className="mt-1 block text-lg font-black leading-tight text-slate-950">{event.title}</span>
                <span className="mt-1 flex items-center gap-1 text-sm font-bold text-slate-500">
                  <MapPin aria-hidden="true" className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {event.venue}, {event.district}
                  </span>
                </span>
                <span
                  className={[
                    "mt-2 inline-flex rounded-full px-3 py-1 text-xs font-black",
                    event.price.toLowerCase().includes("kostenlos")
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-950",
                  ].join(" ")}
                >
                  {event.price}
                </span>
              </span>
            </button>
          ))
        ) : (
          <div className="rounded-[1.6rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-black text-slate-950">{tx("No events match these filters", "Keine Events passen zu diesen Filtern")}</p>
            <p className="mt-2 text-sm font-bold text-slate-500">
              {tx("Try another date, category, or district.", "Probiere ein anderes Datum, eine andere Kategorie oder einen anderen Stadtteil.")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
