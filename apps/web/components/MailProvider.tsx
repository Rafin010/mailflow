"use client";

import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";
import { Folder, Message, initialMailbox, fetchFolder } from "@/lib/mockMessages";

export type BulkAction = "archive" | "spam" | "delete";

interface MailContextValue {
  mailbox: Record<Folder, Message[]>;
  selectedId: number | null;
  isRefreshing: boolean;
  refreshTick: number; // increments after each refresh to replay list animations
  selectMessage: (id: number | null) => void;
  toggleStar: (id: number) => void;
  refresh: (folder: Folder) => Promise<void>;
  bulkAction: (folder: Folder, ids: number[], action: BulkAction) => void;
}

const MailContext = createContext<MailContextValue | null>(null);

const TARGET: Record<BulkAction, Folder> = { archive: "archive", spam: "spam", delete: "trash" };

export function MailProvider({ children }: { children: ReactNode }) {
  const [mailbox, setMailbox] = useState(initialMailbox);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  const updateMessage = (id: number, patch: (m: Message) => Message) =>
    setMailbox((mb) => {
      const next = { ...mb };
      (Object.keys(next) as Folder[]).forEach((f) => {
        next[f] = next[f].map((m) => (m.id === id ? patch(m) : m));
      });
      return next;
    });

  const selectMessage = useCallback((id: number | null) => {
    setSelectedId(id);
    if (id !== null) updateMessage(id, (m) => ({ ...m, unread: false }));
  }, []);

  const toggleStar = useCallback((id: number) => {
    updateMessage(id, (m) => ({ ...m, starred: !m.starred }));
  }, []);

  const refresh = useCallback(
    async (folder: Folder) => {
      if (isRefreshing) return;
      setIsRefreshing(true);
      try {
        const fresh = await fetchFolder(mailbox[folder]);
        setMailbox((mb) => ({ ...mb, [folder]: fresh }));
        setRefreshTick((t) => t + 1);
      } finally {
        setIsRefreshing(false);
      }
    },
    [isRefreshing, mailbox]
  );

  const bulkAction = useCallback((folder: Folder, ids: number[], action: BulkAction) => {
    // Deleting from Trash removes permanently; otherwise move to the target folder.
    const target = TARGET[action];
    setMailbox((mb) => {
      const moving = mb[folder].filter((m) => ids.includes(m.id));
      const next = { ...mb, [folder]: mb[folder].filter((m) => !ids.includes(m.id)) };
      if (target !== folder) next[target] = [...moving, ...next[target]];
      return next;
    });
    setSelectedId((sel) => (sel !== null && ids.includes(sel) ? null : sel));
  }, []);

  const value = useMemo(
    () => ({ mailbox, selectedId, isRefreshing, refreshTick, selectMessage, toggleStar, refresh, bulkAction }),
    [mailbox, selectedId, isRefreshing, refreshTick, selectMessage, toggleStar, refresh, bulkAction]
  );

  return <MailContext.Provider value={value}>{children}</MailContext.Provider>;
}

export function useMail() {
  const ctx = useContext(MailContext);
  if (!ctx) throw new Error("useMail must be used inside <MailProvider>");
  return ctx;
}
