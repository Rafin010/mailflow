"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

export interface Signature {
  id: string;
  name: string;
  html: string;
}

export interface Settings {
  timezone: string;
  showSnippets: boolean;
  hoverActions: boolean;
  desktopNotifications: boolean;
  undoSendSeconds: number;
  replyBehavior: "reply" | "reply-all";
  signatures: Signature[];
  defaultSignatureNew: string | null;
  defaultSignatureReply: string | null;
}

const defaultSettings: Settings = {
  timezone: "UTC",
  showSnippets: true,
  hoverActions: true,
  desktopNotifications: false,
  undoSendSeconds: 10,
  replyBehavior: "reply",
  signatures: [],
  defaultSignatureNew: null,
  defaultSignatureReply: null,
};

interface SettingsContextValue {
  settings: Settings;
  saveSettings: (newSettings: Settings) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("mailflow.settings.v1");
      if (stored) {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      }
    } catch (e) {
      console.error("Failed to load settings", e);
    }
    setMounted(true);
  }, []);

  const saveSettings = useCallback((newSettings: Settings) => {
    setSettings(newSettings);
    localStorage.setItem("mailflow.settings.v1", JSON.stringify(newSettings));
  }, []);

  // Avoid hydration mismatch by not rendering until mounted
  if (!mounted) return null;

  return (
    <SettingsContext.Provider value={{ settings, saveSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside <SettingsProvider>");
  return ctx;
}
