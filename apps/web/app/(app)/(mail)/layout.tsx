"use client";

import { ReactNode } from "react";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import { MessageList } from "@/components/MessageList";
import { ReadingPane } from "@/components/ReadingPane";

/** Mail layout: list + reading pane persist across folder routes; folder comes from the URL. */
export default function MailLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 overflow-hidden">
      <PanelGroup orientation="horizontal">
        <Panel defaultSize="50%" minSize="25%">
          <MessageList />
        </Panel>
        <PanelResizeHandle className="group relative w-px bg-gray-200 cursor-col-resize z-10 outline-none">
          {/* wider invisible hit-area + highlight on hover/drag */}
          <div className="absolute inset-y-0 -left-1.5 -right-1.5 group-hover:bg-blue-400/30 group-data-[separator=active]:bg-blue-500/40 transition-colors" />
        </PanelResizeHandle>
        <Panel defaultSize="50%" minSize="25%">
          <ReadingPane />
        </Panel>
      </PanelGroup>
      {children}
    </div>
  );
}
