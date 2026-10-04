"use client";

import { useMail } from "@/components/MailProvider";

/** Gmail-style "Loading..." pill pinned to the top center while the list refreshes. */
export function LoadingToast() {
  const { isRefreshing } = useMail();

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed left-1/2 top-2 z-[60] -translate-x-1/2 transition-all duration-200 ease-out ${
        isRefreshing ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
      }`}
    >
      <div className="rounded-md bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-900 shadow-sm ring-1 ring-amber-200">
        Loading…
      </div>
    </div>
  );
}
