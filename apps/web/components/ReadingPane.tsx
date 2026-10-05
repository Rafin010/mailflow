"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Reply, Forward, Trash2, MoreVertical, Star, Printer, Archive, AlertCircle, MailOpen, X, ChevronDown } from "lucide-react";
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

  const btn = "p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-colors disabled:opacity-40 disabled:pointer-events-none";
  const isOutgoing = folder === "sent" || folder === "drafts";
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Toolbar */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 px-4 pr-16">
        <div className="flex items-center gap-0.5">
          <button className={btn} title="Archive" disabled={!message} onClick={() => act("archive")}><Archive className="h-4 w-4" /></button>
          <button className={btn} title="Report spam" disabled={!message} onClick={() => act("spam")}><AlertCircle className="h-4 w-4" /></button>
          <button className={btn} title={folder === "trash" ? "Delete permanently" : "Delete"} disabled={!message} onClick={() => act("delete")}><Trash2 className="h-4 w-4" /></button>
          <div className="mx-1.5 h-5 w-px bg-gray-200" />
          <button className={btn} title="Reply" disabled={!message}><Reply className="h-4 w-4" /></button>
          <button className={btn} title="Forward" disabled={!message}><Forward className="h-4 w-4" /></button>
        </div>
        <div className="relative flex items-center gap-0.5" ref={menuRef}>
          <button className={btn} title="Print" disabled={!message} onClick={() => window.print()}><Printer className="h-4 w-4" /></button>
          <button
            onClick={() => setIsMenuOpen((o) => !o)}
            disabled={!message}
            className={`${btn} ${isMenuOpen ? "bg-gray-100" : ""}`}
            title="More options"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {message && (
            <button className={btn} title="Close" onClick={() => selectMessage(null)}><X className="h-4 w-4" /></button>
          )}
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
      <div className="flex-1 overflow-y-auto">
        {!message ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-400 animate-fade-in">
            <MailOpen className="h-12 w-12 stroke-[1.25]" />
            <p className="text-sm">Select an email to read</p>
          </div>
        ) : (
          <article key={message.id} className="animate-fade-in">
            {/* Subject */}
            <header className="flex items-start justify-between gap-4 px-8 pt-6 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[22px] font-normal leading-tight text-gray-900">{message.subject}</h1>
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium capitalize text-gray-600">{folder}</span>
              </div>
              <button
                onClick={() => toggleStar(message.id)}
                className="shrink-0 rounded-md p-1 hover:bg-gray-100"
                title={message.starred ? "Unstar" : "Star"}
              >
                <Star className={`h-5 w-5 ${message.starred ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`} />
              </button>
            </header>

            {/* Sender row */}
            <div className="flex items-start gap-3 px-8 pb-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {initials(isOutgoing ? message.to : message.from)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="min-w-0 truncate text-sm">
                    <span className="font-semibold text-gray-900">{isOutgoing ? "Me" : message.from}</span>
                    {message.email && !isOutgoing && (
                      <span className="ml-1 text-xs text-gray-500">&lt;{message.email}&gt;</span>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-gray-500">{formatDate(message.date, settings.timezone)}</span>
                </div>
                <button
                  onClick={() => setShowDetails((s) => !s)}
                  className="mt-0.5 inline-flex items-center gap-0.5 text-xs text-gray-500 hover:text-gray-700"
                >
                  to {isOutgoing ? message.to : "me"}
                  <ChevronDown className={`h-3 w-3 transition-transform ${showDetails ? "rotate-180" : ""}`} />
                </button>
                {showDetails && (
                  <dl className="mt-2 grid grid-cols-[60px_1fr] gap-y-1 rounded-md border border-gray-200 p-3 text-xs">
                    <dt className="text-gray-500">from:</dt>
                    <dd className="text-gray-800">{isOutgoing ? "Me" : message.from} {message.email && !isOutgoing && `<${message.email}>`}</dd>
                    <dt className="text-gray-500">to:</dt>
                    <dd className="text-gray-800">{message.to}</dd>
                    <dt className="text-gray-500">date:</dt>
                    <dd className="text-gray-800">{formatDate(message.date, settings.timezone)}</dd>
                    <dt className="text-gray-500">subject:</dt>
                    <dd className="text-gray-800">{message.subject}</dd>
                  </dl>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="mail-body px-8 pl-[84px] pt-4 pb-8" dangerouslySetInnerHTML={{ __html: message.bodyHtml }} />

            {/* Reply / Forward */}
            <div className="flex gap-3 px-8 pl-[84px] pb-10">
              <button className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Reply className="h-4 w-4" /> Reply
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Forward className="h-4 w-4" /> Forward
              </button>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
