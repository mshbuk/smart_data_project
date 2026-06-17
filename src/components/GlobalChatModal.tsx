import { ArrowLeft, MessageCircle, Send, X } from "lucide-react";
import { useMemo, useState } from "react";
import events from "../data/events.json";
import type { CityEvent } from "../types/Event";
import { useI18n } from "../i18n";

type GlobalChatModalProps = {
  onClose: () => void;
  signedUpEventIds: string[];
};

type ChatPreview = {
  avatarUrl?: string;
  id: string;
  kind: "personal" | "event";
  name: string;
  preview: string;
};

const cityEvents = events as CityEvent[];

const personalChats: ChatPreview[] = [
  {
    avatarUrl: "/event-avatars/lena.jpg",
    id: "lena",
    kind: "personal",
    name: "Lena M.",
    preview: "Ich bin neu in Hamburg. Wollen wir zum Event zusammen hingehen?",
  },
  {
    avatarUrl: "/event-avatars/jonas.jpg",
    id: "jonas",
    kind: "personal",
    name: "Jonas K.",
    preview: "Ich kenne ein gutes Café in der Nähe.",
  },
];

function getFirstDateLabel(event: CityEvent, language: "de" | "en") {
  const date = new Date(`${event.dates[0]}T12:00:00`);

  return new Intl.DateTimeFormat(language === "de" ? "de-DE" : "en-US", {
    day: "2-digit",
    month: "short",
    weekday: "short",
  }).format(date);
}

export function GlobalChatModal({ onClose, signedUpEventIds }: GlobalChatModalProps) {
  const { language, tx } = useI18n();
  const [activeChat, setActiveChat] = useState<ChatPreview | null>(null);
  const [draft, setDraft] = useState("");
  const [threads, setThreads] = useState<Record<string, Array<{ me: boolean; text: string }>>>({});
  const eventChats = useMemo<ChatPreview[]>(() => {
    const signedEvents = cityEvents.filter((event) => signedUpEventIds.includes(event.id));
    const visibleEvents = signedEvents.length ? signedEvents : cityEvents.slice(0, 2);

    return visibleEvents.map((event) => ({
      avatarUrl: event.imageUrl,
      id: `event-${event.id}`,
      kind: "event",
      name: event.title,
      preview: signedUpEventIds.includes(event.id)
        ? tx("Event group chat is active.", "Event-Gruppenchat ist aktiv.")
        : tx("Demo event chat preview.", "Demo-Vorschau für den Event-Chat."),
    }));
  }, [signedUpEventIds, tx]);
  const chatGroups = [
    { label: tx("Personal chats", "Persönliche Chats"), items: personalChats },
    { label: tx("Event chats", "Event-Chats"), items: eventChats },
  ];

  const sendMessage = () => {
    if (!activeChat || !draft.trim()) return;

    const text = draft.trim();
    setThreads((current) => ({
      ...current,
      [activeChat.id]: [...(current[activeChat.id] ?? []), { me: true, text }],
    }));
    setDraft("");
  };

  return (
    <div className="fixed inset-0 z-[1800] bg-slate-950/35 px-3 py-4 backdrop-blur-sm">
      <section className="ml-auto grid max-h-[calc(100vh-2rem)] w-full max-w-[430px] grid-rows-[auto_1fr_auto] overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_90px_rgba(15,23,42,0.34)]">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-4">
          <div className="flex min-w-0 items-center gap-2">
            {activeChat && (
              <button
                aria-label={tx("Back to chats", "Zurück zu Chats")}
                className="rounded-full p-1.5 transition hover:bg-slate-100"
                onClick={() => setActiveChat(null)}
                type="button"
              >
                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              </button>
            )}
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                {activeChat ? activeChat.kind === "event" ? "Event" : "Chat" : "Moin"}
              </p>
              <h3 className="truncate text-lg font-black text-slate-950">
                {activeChat?.name ?? tx("Chats", "Chats")}
              </h3>
            </div>
          </div>
          <button
            aria-label={tx("Close chats", "Chats schließen")}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        {!activeChat ? (
          <div className="grid content-start gap-4 overflow-y-auto p-3">
            {chatGroups.map((group) => (
              <section key={group.label}>
                <p className="mb-2 px-1 text-xs font-black uppercase tracking-wide text-slate-400">{group.label}</p>
                <div className="grid gap-2">
                  {group.items.map((chat) => (
                    <button
                      className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 rounded-[1.35rem] p-3 text-left transition hover:bg-slate-50"
                      key={chat.id}
                      onClick={() => setActiveChat(chat)}
                      type="button"
                    >
                      <span className="h-12 w-12 overflow-hidden rounded-full bg-slate-100">
                        {chat.avatarUrl ? (
                          <img alt="" className="h-full w-full object-cover" src={chat.avatarUrl} />
                        ) : (
                          <span className="grid h-full w-full place-items-center">
                            <MessageCircle aria-hidden="true" className="h-5 w-5" />
                          </span>
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-black text-slate-950">{chat.name}</span>
                        <span className="mt-0.5 block truncate text-xs font-medium text-slate-500">{chat.preview}</span>
                        {chat.kind === "event" && (
                          <span className="mt-1 block text-[10px] font-black uppercase tracking-wide text-slate-400">
                            {getFirstDateLabel(cityEvents.find((event) => `event-${event.id}` === chat.id) ?? cityEvents[0], language)}
                          </span>
                        )}
                      </span>
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="grid content-start gap-2 overflow-y-auto bg-slate-50 p-4">
            <div className="max-w-[82%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-sm shadow-sm">
              {activeChat.preview}
            </div>
            {(threads[activeChat.id] ?? []).map((message, index) => (
              <div
                className={[
                  "max-w-[82%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                  message.me ? "ml-auto rounded-tr-sm bg-slate-950 text-white" : "rounded-tl-sm bg-white",
                ].join(" ")}
                key={`${activeChat.id}-${index}`}
              >
                {message.text}
              </div>
            ))}
          </div>
        )}

        <form
          className="grid grid-cols-[1fr_auto] gap-2 border-t border-slate-200 bg-white p-3"
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage();
          }}
        >
          <input
            className="min-h-11 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
            disabled={!activeChat}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={activeChat ? tx("Write a message...", "Nachricht schreiben...") : tx("Choose a chat first", "Wähle zuerst einen Chat")}
            value={draft}
          />
          <button
            aria-label={tx("Send message", "Nachricht senden")}
            className="grid h-11 w-11 place-items-center rounded-full bg-slate-950 text-white shadow-lg shadow-slate-950/15 disabled:opacity-40"
            disabled={!activeChat || !draft.trim()}
            type="submit"
          >
            <Send aria-hidden="true" className="h-5 w-5" />
          </button>
        </form>
      </section>
    </div>
  );
}
