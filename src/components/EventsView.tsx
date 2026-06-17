import { useMemo, useState } from "react";
import {
  Bookmark,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  MapPin,
  MessageCircle,
  Navigation,
  Search,
  Send,
  Users,
  X,
} from "lucide-react";
import events from "../data/events.json";
import type { CityEvent, EventCategory, EventComment } from "../types/Event";
import { useI18n } from "../i18n";

type DateFilter = "all" | "today" | "week" | "weekend";

const cityEvents = events as CityEvent[];
const baseUrl = import.meta.env.BASE_URL;
const assetUrl = (path: string) => `${baseUrl}${path.replace(/^\/+/, "")}`;
const userAvatarUrl = assetUrl("event-avatars/samira.jpg");
const categoryFilters: Array<EventCategory | "all"> = ["all", "music", "food", "sport", "culture"];
const dateFilters: DateFilter[] = ["all", "today", "week", "weekend"];
const categoryEmoji: Record<EventCategory, string> = {
  culture: "🎭",
  food: "🍽️",
  music: "🎵",
  sport: "🏃",
};

type EventChatMessage = {
  avatarUrl: string;
  message: string;
  name: string;
  time: string;
};

type EventsViewProps = {
  onSelectEvent: (eventId: string | null) => void;
  onToggleSignUp: (eventId: string) => void;
  selectedEventId: string | null;
  signedUpEventIds: string[];
};

const avatarByName: Record<string, string> = {
  "Anna M.": assetUrl("event-avatars/anna.jpg"),
  "Anna P.": assetUrl("event-avatars/anna.jpg"),
  "Felix R.": assetUrl("event-avatars/felix.jpg"),
  "Jonas K.": assetUrl("event-avatars/jonas.jpg"),
  "Lena M.": assetUrl("event-avatars/lena.jpg"),
  "Mats H.": assetUrl("event-avatars/mats.jpg"),
  "Mira K.": assetUrl("event-avatars/mira.jpg"),
  "Mira S.": assetUrl("event-avatars/mira.jpg"),
  "Samira": assetUrl("event-avatars/samira.jpg"),
  "Sofia R.": assetUrl("event-avatars/sofia.jpg"),
  "Tom B.": assetUrl("event-avatars/tom.jpg"),
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

function formatEventDateLong(date: string, language: "de" | "en") {
  return new Intl.DateTimeFormat(language === "de" ? "de-DE" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    weekday: "short",
    year: "numeric",
  })
    .format(parseEventDate(date))
    .replace(".,", ",")
    .toUpperCase();
}

function getEventDateRangeLabel(event: CityEvent, language: "de" | "en") {
  const first = formatEventDateLong(event.dates[0], language);
  if (event.dates.length === 1) return first;

  return `${first} – ${formatEventDateLong(event.dates[event.dates.length - 1], language)}`;
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

function getAvatarUrl(comment: Pick<EventComment, "avatar" | "name">) {
  if (comment.avatar.startsWith("http")) return comment.avatar;
  if (comment.avatar.startsWith(baseUrl)) return comment.avatar;
  if (comment.avatar.startsWith("/")) return assetUrl(comment.avatar);
  return avatarByName[comment.name] ?? assetUrl("event-avatars/lena.jpg");
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

function getEventReviews(event: CityEvent): EventComment[] {
  const fallbackReviews: EventComment[] = [
    {
      avatar: "🙂",
      bio: "Neu in Hamburg",
      likes: 11,
      message: "War letztes Mal super organisiert. Gute Stimmung und man kommt leicht mit Leuten ins Gespräch.",
      name: "Anna M.",
    },
    {
      avatar: "🧑‍💻",
      bio: "Arbeitet remote in Eimsbüttel",
      likes: 8,
      message: "Ich gehe wieder hin. Besonders praktisch: Die Location ist mit HVV sehr entspannt erreichbar.",
      name: "Felix R.",
    },
    {
      avatar: "👩",
      bio: "Seit 2 Jahren in Hamburg",
      likes: 6,
      message: "Schöne Demo-Empfehlung für alle, die Hamburg besser kennenlernen wollen.",
      name: "Mira K.",
    },
  ];

  return [...event.comments, ...fallbackReviews].slice(0, 4);
}

function getEventChatMessages(event: CityEvent): EventChatMessage[] {
  return [
    {
      avatarUrl: assetUrl("event-avatars/lena.jpg"),
      name: "Lena",
      time: "18:42",
      message: `Ich bin für ${event.title} angemeldet. Geht noch jemand aus ${event.district}?`,
    },
    {
      avatarUrl: assetUrl("event-avatars/jonas.jpg"),
      name: "Jonas",
      time: "18:47",
      message: "Ich komme wahrscheinlich auch. Wollen wir uns vorher an der nächsten Bahnstation treffen?",
    },
    {
      avatarUrl: assetUrl("event-avatars/tom.jpg"),
      name: "Tom",
      time: "18:51",
      message: "Gute Idee. Ich bringe noch zwei Freunde mit, die neu in Hamburg sind.",
    },
    {
      avatarUrl: assetUrl("event-avatars/mira.jpg"),
      name: "Mira",
      time: "18:55",
      message: "Ich speichere mir das Event. Falls es regnet, suche ich vorher noch ein Café in der Nähe raus.",
    },
  ];
}

function GroupChatModal({
  event,
  onClose,
}: {
  event: CityEvent;
  onClose: () => void;
}) {
  const { tx } = useI18n();
  const [message, setMessage] = useState("");
  const messages = getEventChatMessages(event);

  return (
    <div className="fixed inset-0 z-[1700] bg-slate-950/35 px-3 py-4 backdrop-blur-sm">
      <section className="ml-auto grid max-h-[calc(100vh-2rem)] w-full max-w-[430px] grid-rows-[auto_1fr_auto] overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_90px_rgba(15,23,42,0.34)]">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-500">
              {tx("Event chat", "Event-Chat")}
            </p>
            <h3 className="mt-1 text-xl font-black leading-tight text-slate-950">{event.title}</h3>
            <p className="mt-1 text-sm font-bold text-slate-500">
              {tx("People who signed up can coordinate here.", "Angemeldete können sich hier abstimmen.")}
            </p>
          </div>
          <button
            aria-label={tx("Close chat", "Chat schließen")}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <div className="grid content-start gap-3 overflow-y-auto bg-slate-50 p-4">
          {messages.map((chatMessage, index) => (
            <article
              className={[
                "max-w-[88%] rounded-[1.35rem] bg-white p-3 shadow-sm",
                index % 2 === 0 ? "justify-self-start" : "justify-self-end",
              ].join(" ")}
              key={`${chatMessage.name}-${chatMessage.time}`}
            >
              <div className="flex items-center gap-2">
                <img
                  alt=""
                  className="h-8 w-8 rounded-full bg-slate-100 object-cover"
                  src={chatMessage.avatarUrl}
                />
                <div>
                  <p className="text-sm font-black text-slate-950">{chatMessage.name}</p>
                  <p className="text-xs font-bold text-slate-400">{chatMessage.time}</p>
                </div>
              </div>
              <p className="mt-2 text-sm leading-5 text-slate-700">{chatMessage.message}</p>
            </article>
          ))}
        </div>

        <form
          className="grid grid-cols-[1fr_auto] gap-2 border-t border-slate-200 bg-white p-4"
          onSubmit={(submitEvent) => {
            submitEvent.preventDefault();
            setMessage("");
          }}
        >
          <input
            className="min-h-11 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
            onChange={(inputEvent) => setMessage(inputEvent.target.value)}
            placeholder={tx("Write to the group...", "In die Gruppe schreiben...")}
            value={message}
          />
          <button
            aria-label={tx("Send message", "Nachricht senden")}
            className="grid h-11 w-11 place-items-center rounded-full bg-slate-950 text-white shadow-lg shadow-slate-950/15 hover:bg-slate-800"
            type="submit"
          >
            <Send aria-hidden="true" className="h-5 w-5" />
          </button>
        </form>
      </section>
    </div>
  );
}

function ChatInboxModal({
  eventsForInbox,
  signedUpEventIds,
  onClose,
  onOpenChat,
}: {
  eventsForInbox: CityEvent[];
  signedUpEventIds: string[];
  onClose: () => void;
  onOpenChat: (event: CityEvent) => void;
}) {
  const { language, tx } = useI18n();
  const signedUpEvents = eventsForInbox.filter((event) => signedUpEventIds.includes(event.id));
  const visibleEvents = signedUpEvents.length ? signedUpEvents : eventsForInbox.slice(0, 2);

  return (
    <div className="fixed inset-0 z-[1650] bg-slate-950/35 px-3 py-4 backdrop-blur-sm">
      <section className="ml-auto w-full max-w-[430px] overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_90px_rgba(15,23,42,0.34)]">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-5">
          <div>
            <h3 className="text-2xl font-black text-slate-950">{tx("Event chats", "Event-Chats")}</h3>
            <p className="mt-1 text-sm font-bold text-slate-500">
              {signedUpEvents.length
                ? tx("Chats for events you signed up for.", "Chats zu Events, für die du angemeldet bist.")
                : tx("Demo preview. Sign up for an event to add it here.", "Demo-Vorschau. Melde dich für ein Event an, damit es hier erscheint.")}
            </p>
          </div>
          <button
            aria-label={tx("Close chats", "Chats schließen")}
            className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <div className="grid max-h-[65vh] gap-2 overflow-y-auto p-3">
          {visibleEvents.map((event) => {
            const preview = getEventChatMessages(event)[0];
            const isSignedUp = signedUpEventIds.includes(event.id);

            return (
              <button
                className="grid grid-cols-[4rem_1fr_auto] items-center gap-3 rounded-[1.35rem] p-3 text-left transition-colors hover:bg-slate-50"
                key={event.id}
                onClick={() => onOpenChat(event)}
                type="button"
              >
                <span className="relative h-16 w-16 overflow-hidden rounded-[1.1rem] bg-slate-100">
                  <img alt="" className="h-full w-full object-cover" src={event.imageUrl} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-base font-black text-slate-950">{event.title}</span>
                  <span className="mt-1 block truncate text-sm font-medium text-slate-500">{preview.message}</span>
                  <span className="mt-1 block text-xs font-black uppercase tracking-wide text-slate-400">
                    {getFirstDateLabel(event, language)}
                  </span>
                </span>
                <span
                  className={[
                    "rounded-full px-2.5 py-1 text-xs font-black",
                    isSignedUp ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500",
                  ].join(" ")}
                >
                  {isSignedUp ? tx("Signed", "Dabei") : "Demo"}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
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
            <img
              alt=""
              className="h-14 w-14 rounded-full bg-slate-50 object-cover"
              src={getAvatarUrl(comment)}
            />
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
            className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
            onChange={(event) => setMessage(event.target.value)}
            placeholder={tx("Write a message...", "Nachricht schreiben...")}
            value={message}
          />
          <button
            aria-label={tx("Send message", "Nachricht senden")}
            className="grid h-12 w-12 place-items-center rounded-full bg-slate-950 text-white shadow-lg shadow-slate-950/15 hover:bg-slate-800"
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
  onAddCommunityComment,
  onChat,
  onToggleSignUp,
  userComments,
}: {
  event: CityEvent;
  isSignedUp: boolean;
  onAddCommunityComment: (eventId: string, message: string) => void;
  onChat: (comment: EventComment) => void;
  onToggleSignUp: (eventId: string) => void;
  userComments: EventComment[];
}) {
  const { language, tx } = useI18n();
  const [communityDraft, setCommunityDraft] = useState("");
  const attendees = event.attendees + (isSignedUp ? 1 : 0);
  const signedUpComment: EventComment | null = isSignedUp
    ? {
        avatar: userAvatarUrl,
        bio: tx("You are interested", "Du bist interessiert"),
        likes: 0,
        message: tx("I am going and would like to connect with others.", "Ich gehe hin und würde mich gern mit anderen vernetzen."),
        name: tx("You", "Du"),
      }
    : null;
  const reviews = [...(signedUpComment ? [signedUpComment] : []), ...userComments, ...getEventReviews(event)];

  return (
    <section className="-mx-4 -mt-4 bg-background pb-28">
      <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
        <img alt="" className="h-full w-full object-cover" src={event.imageUrl} />
      </div>

      <div className="space-y-6 px-4 py-6">
        <section>
          <p className="text-sm font-black uppercase tracking-[0.14em] text-primary">
            {getEventDateRangeLabel(event, language)}
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-foreground">{event.title}</h1>
          <div className="mt-4 space-y-2 text-lg font-medium text-muted-foreground">
            <p className="flex items-center gap-2">
              <CalendarDays aria-hidden="true" className="h-6 w-6" />
              {event.time}
            </p>
            <p className="flex items-center gap-2">
              <MapPin aria-hidden="true" className="h-6 w-6" />
              {event.venue}, {event.district}
            </p>
          </div>
          <span
            className={[
              "mt-4 inline-flex rounded-full px-4 py-1 text-base font-bold",
              event.price.toLowerCase().includes("kostenlos") || event.price.toLowerCase().includes("frei")
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-950",
            ].join(" ")}
          >
            {event.price}
          </span>
        </section>

        <p className="text-xl leading-9 text-foreground">{event.description}</p>

        <section className="grid gap-3">
          <button
            className={[
              "inline-flex min-h-16 w-full items-center justify-center gap-3 rounded-[1.6rem] border-2 px-5 text-lg font-bold transition-colors",
              isSignedUp
                ? "border-primary bg-primary-soft text-accent-foreground"
                : "border-primary bg-primary-soft text-accent-foreground hover:bg-accent",
            ].join(" ")}
            onClick={() => onToggleSignUp(event.id)}
            type="button"
          >
            <Users aria-hidden="true" className="h-6 w-6" />
            {tx("I am going", "Ich gehe hin")}
            {isSignedUp && <CheckCircle2 aria-hidden="true" className="h-5 w-5" />}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-[1.35rem] border border-border bg-card px-4 text-base font-semibold text-foreground shadow-card hover:bg-muted"
              onClick={() => createCalendarDownload(event)}
              type="button"
            >
              <CalendarDays aria-hidden="true" className="h-5 w-5" />
              {tx("Add to calendar", "Kalender hinzufügen")}
            </button>
            <a
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-[1.35rem] border border-border bg-card px-4 text-base font-semibold text-foreground shadow-card hover:bg-muted"
              href={event.mapUrl}
              rel="noreferrer"
              target="_blank"
            >
              <Navigation aria-hidden="true" className="h-5 w-5" />
              {tx("Plan route", "Route planen")}
            </a>
          </div>
          {event.sourceUrl && (
            <a
              className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-[1.35rem] border border-border bg-card px-4 text-base font-semibold text-foreground shadow-card hover:bg-muted"
              href={event.sourceUrl}
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink aria-hidden="true" className="h-5 w-5" />
              {tx("Event website", "Website des Events")}
            </a>
          )}
        </section>

        <section className="border-t border-border pt-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-2xl font-bold text-foreground">Community</h3>
              <p className="mt-1 text-sm font-semibold text-muted-foreground">
                {attendees} {tx("people interested", "Personen interessiert")}
              </p>
            </div>
            <Users aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="mt-3 flex items-center">
            {isSignedUp && (
              <img
                alt=""
                className="-ml-2 h-10 w-10 rounded-full border-2 border-white bg-muted object-cover shadow-card first:ml-0"
                src={userAvatarUrl}
                title={tx("You", "Du")}
              />
            )}
            {event.comments.slice(0, 6).map((comment) => (
              <img
                alt=""
                className="-ml-2 h-10 w-10 rounded-full border-2 border-white bg-muted object-cover shadow-card first:ml-0"
                key={comment.name}
                src={getAvatarUrl(comment)}
                title={comment.name}
              />
            ))}
            <span className="-ml-2 grid h-10 min-w-10 place-items-center rounded-full border-2 border-white bg-muted px-2 text-xs font-bold text-muted-foreground">
              +{Math.max(0, attendees - event.comments.length - (isSignedUp ? 1 : 0))}
            </span>
          </div>

          <h4 className="mt-6 text-lg font-bold text-foreground">{tx("Community voices", "Stimmen aus der Community")}</h4>
          <div className="mt-3 grid gap-3">
            {reviews.map((comment) => (
              <article className="rounded-2xl border border-border bg-card p-3 shadow-card" key={`${comment.name}-${comment.message}`}>
                <div className="flex justify-between gap-3">
                  <div className="flex gap-3">
                    <img alt="" className="h-11 w-11 rounded-full bg-muted object-cover" src={getAvatarUrl(comment)} />
                    <div>
                      <h4 className="text-base font-bold text-foreground">{comment.name}</h4>
                      <p className="text-xs font-semibold text-muted-foreground">{comment.bio}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">♡ {comment.likes}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-foreground">{comment.message}</p>
                <button
                  className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-foreground"
                  onClick={() => onChat(comment)}
                  type="button"
                >
                  <MessageCircle aria-hidden="true" className="h-4 w-4" />
                  {tx("Message", "Anschreiben")}
                </button>
              </article>
            ))}
          </div>

          <form
            className="mt-4 grid grid-cols-[1fr_auto] gap-2"
            onSubmit={(submitEvent) => {
              submitEvent.preventDefault();
              if (!communityDraft.trim()) return;
              onAddCommunityComment(event.id, communityDraft.trim());
              setCommunityDraft("");
            }}
          >
            <input
              className="min-h-12 min-w-0 rounded-full border border-border bg-background px-4 text-sm font-semibold outline-none focus:border-primary"
              onChange={(inputEvent) => setCommunityDraft(inputEvent.target.value)}
              placeholder={tx("Write yourself into the community...", "Schreib dich in die Community ein...")}
              value={communityDraft}
            />
            <button
              aria-label={tx("Post", "Veröffentlichen")}
              className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
              disabled={!communityDraft.trim()}
              type="submit"
            >
              <Send aria-hidden="true" className="h-4 w-4" />
            </button>
          </form>
        </section>
      </div>
    </section>
  );
}

export function EventsView({
  onSelectEvent,
  onToggleSignUp,
  selectedEventId,
  signedUpEventIds,
}: EventsViewProps) {
  const { language, tx } = useI18n();
  const [category, setCategory] = useState<EventCategory | "all">("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [chatComment, setChatComment] = useState<EventComment | null>(null);
  const [isChatInboxOpen, setIsChatInboxOpen] = useState(false);
  const [groupChatEvent, setGroupChatEvent] = useState<CityEvent | null>(null);
  const [communityCommentsByEvent, setCommunityCommentsByEvent] = useState<Record<string, EventComment[]>>({});
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

  const addCommunityComment = (eventId: string, message: string) => {
    const comment: EventComment = {
      avatar: userAvatarUrl,
      bio: tx("Joined from Moin", "Über Moin eingetragen"),
      likes: 0,
      message,
      name: tx("You", "Du"),
    };

    setCommunityCommentsByEvent((current) => ({
      ...current,
      [eventId]: [...(current[eventId] ?? []), comment],
    }));
  };

  if (selectedEvent) {
    return (
      <>
        <EventDetail
          event={selectedEvent}
          isSignedUp={signedUpEventIds.includes(selectedEvent.id)}
          onAddCommunityComment={addCommunityComment}
          onChat={setChatComment}
          onToggleSignUp={onToggleSignUp}
          userComments={communityCommentsByEvent[selectedEvent.id] ?? []}
        />
        {chatComment && <ChatModal comment={chatComment} onClose={() => setChatComment(null)} />}
      </>
    );
  }

  return (
    <section className="mx-auto grid max-w-xl gap-4">
      <div className="grid gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="inline-flex rounded-full bg-muted p-1 text-sm font-medium">
            <button className="rounded-full bg-card px-3 py-1.5 text-foreground shadow-card" type="button">
              {tx("Discover", "Entdecken")}
            </button>
            <button className="rounded-full px-3 py-1.5 text-muted-foreground" type="button">
              {tx("Saved", "Gespeichert")}
            </button>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <select
              className="min-h-9 max-w-[9rem] rounded-full border border-border bg-card px-3 text-xs font-medium text-foreground outline-none focus:border-primary"
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
            <button
              aria-label={tx("Open event chats", "Event-Chats öffnen")}
              className="relative grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft transition hover:opacity-95"
              onClick={() => setIsChatInboxOpen(true)}
              type="button"
            >
              <MessageCircle aria-hidden="true" className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1 text-[0.65rem] font-bold leading-none text-destructive-foreground">
                {Math.max(1, signedUpEventIds.length)}
              </span>
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {dateFilters.map((filter) => (
            <button
              aria-pressed={dateFilter === filter}
              className={[
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                dateFilter === filter
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-muted",
              ].join(" ")}
              key={filter}
              onClick={() => setDateFilter(filter)}
              type="button"
            >
              {getDateFilterLabel(filter, tx)}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {categoryFilters.map((filter) => (
            <button
              aria-pressed={category === filter}
              className={[
                "grid shrink-0 justify-items-center gap-1.5 text-[10px] font-semibold uppercase transition-colors",
                category === filter ? "text-foreground" : "text-muted-foreground",
              ].join(" ")}
              key={filter}
              onClick={() => setCategory(filter)}
              type="button"
            >
              <span
                className={[
                  "grid h-12 w-12 place-items-center rounded-full border text-lg",
                  category === filter
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground",
                ].join(" ")}
              >
                {filter === "all" ? "✦" : categoryEmoji[filter]}
              </span>
              {getCategoryLabel(filter, tx)}
            </button>
          ))}
        </div>
        <label className="flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-3 text-sm text-muted-foreground shadow-card">
          <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400"
            placeholder={tx("Search event or location...", "Event oder Location suchen...")}
            type="search"
          />
        </label>
      </div>

      <div className="grid gap-3">
        {filteredEvents.length ? (
          filteredEvents.map((event) => (
            <button
              className="flex items-stretch gap-3 rounded-2xl border border-border bg-card p-3 text-left shadow-card transition hover:border-primary/40"
              key={event.id}
              onClick={() => onSelectEvent(event.id)}
              type="button"
            >
              <span className="relative grid h-20 w-16 flex-shrink-0 place-items-center overflow-hidden rounded-xl bg-muted">
                <img alt="" className="h-full w-full object-cover" loading="lazy" src={event.imageUrl} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                <span>
                <span className="block text-xs font-medium text-primary">{getFirstDateLabel(event, language)} · {event.time}</span>
                <span className="block truncate font-display text-sm font-semibold text-foreground">{event.title}</span>
                <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin aria-hidden="true" className="h-3 w-3 shrink-0" />
                  <span className="truncate">
                    {event.venue}, {event.district}
                  </span>
                </span>
                </span>
                <span
                  className={[
                    "mt-2 inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    event.price.toLowerCase().includes("kostenlos")
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-950",
                  ].join(" ")}
                >
                  {event.price}
                </span>
              </span>
              <Bookmark aria-hidden="true" className="mt-3 h-4 w-4 text-muted-foreground" />
            </button>
          ))
        ) : (
          <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-card">
            <p className="font-display text-base font-semibold text-foreground">{tx("No events match these filters", "Keine Events passen zu diesen Filtern")}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {tx("Try another date, category, or district.", "Probiere ein anderes Datum, eine andere Kategorie oder einen anderen Stadtteil.")}
            </p>
          </div>
        )}
      </div>
      {isChatInboxOpen && (
        <ChatInboxModal
          eventsForInbox={cityEvents}
          onClose={() => setIsChatInboxOpen(false)}
          onOpenChat={(event) => {
            setGroupChatEvent(event);
            setIsChatInboxOpen(false);
          }}
          signedUpEventIds={signedUpEventIds}
        />
      )}
      {groupChatEvent && <GroupChatModal event={groupChatEvent} onClose={() => setGroupChatEvent(null)} />}
    </section>
  );
}
