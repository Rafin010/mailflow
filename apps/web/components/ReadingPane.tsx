"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Reply, Forward, Trash2, MoreVertical, Star, Printer, Archive, AlertCircle, MailOpen, X } from "lucide-react";
import { useMail, BulkAction } from "@/components/MailProvider";
import { FOLDER_FROM_PATH, Message } from "@/lib/mockMessages";
import { useSettings } from "@/components/SettingsProvider";
import { formatDate } from "@/lib/dateFormatter";

const initials = (name: string) =>
  name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

export function ReadingPane() {
  const pathname = usePathname();
  const folder = FOLDER_FROM_PATH[pathname] ?? "inbox";
  const { mailbox, selectedId, selectMessage, toggleStar, bulkAction } = useMail();
  const { settings } = useSettings();
  const message: Message | undefined = mailbox[folder].find((m) => m.id === selectedId);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const act = (action: BulkAction) => {
    if (!message) return;
    bulkAction(folder, [message.id], action);
    setIsMenuOpen(false);
  };

  const btn = "p-2 text-gray-500 hover:text-gray-800 hover:bg-slate-200 active:bg-slate-300 rounded-md transition-colors disabled:opacity-40 disabled:pointer-events-none";

  return (
    <div className="flex h-full flex-col bg-slate-100">
      {/* Toolbar */}
      <div className="flex h-14 items-center justify-between px-6 pr-16">
        <div className="flex items-center gap-1">
          <button className={btn} title="Reply" disabled={!message}><Reply className="h-4 w-4" /></button>
          <button className={btn} title="Forward" disabled={!message}><Forward className="h-4 w-4" /></button>
          <div className="mx-1 h-6 w-px bg-slate-300" />
          <button className={btn} title="Archive" disabled={!message} onClick={() => act("archive")}><Archive className="h-4 w-4" /></button>
          <button className={btn} title={folder === "trash" ? "Delete permanently" : "Delete"} disabled={!message} onClick={() => act("delete")}><Trash2 className="h-4 w-4" /></button>
        </div>
        <div className="relative flex items-center gap-1" ref={menuRef}>
          {message && (
            <button className={btn} title="Close" onClick={() => selectMessage(null)}><X className="h-4 w-4" /></button>
          )}
          <button
            onClick={() => setIsMenuOpen((o) => !o)}
            disabled={!message}
            className={`${btn} ${isMenuOpen ? "bg-slate-200" : ""}`}
            title="More options"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 top-10 z-50 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 animate-fade-in">
              <button onClick={() => act("archive")} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                <Archive className="h-4 w-4" /> Archive
              </button>
              <button onClick={() => { window.print(); setIsMenuOpen(false); }} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                <Printer className="h-4 w-4" /> Print
              </button>
              <button onClick={() => act("spam")} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                <AlertCircle className="h-4 w-4" /> Report spam
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {!message ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-400 animate-fade-in">
            <MailOpen className="h-12 w-12 stroke-[1.25]" />
            <p className="text-sm">Select an email to read</p>
          </div>
        ) : (
          <article key={message.id} className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow-sm animate-mail-in">
            <div className="mb-6 flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-gray-900">{message.subject}</h1>
              <button
                onClick={() => toggleStar(message.id)}
                className="mt-1 rounded-md p-1 transition-transform hover:scale-110 active:scale-95"
                title={message.starred ? "Unstar" : "Star"}
              >
                <Star className={`h-5 w-5 transition-colors ${message.starred ? "fill-yellow-400 text-yellow-400" : "text-gray-400 hover:text-yellow-400"}`} />
              </button>
            </div>

            <div className="mb-8 flex items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                  {initials(folder === "sent" || folder === "drafts" ? message.to : message.from)}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {folder === "sent" || folder === "drafts" ? "Me" : message.from}{" "}
                    {message.email && folder !== "sent" && folder !== "drafts" && (
                      <span className="text-sm font-normal text-gray-500">&lt;{message.email}&gt;</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">to {message.to}</div>
                </div>
              </div>
              <div className="text-sm text-gray-500">{formatDate(message.date, settings.timezone)}</div>
            </div>

            <div className="prose max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: message.bodyHtml }} />
          </article>
        )}
      </div>
    </div>
  );
}
