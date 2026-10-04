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
        <Panel defaultSize="35%" minSize="20%" maxSize="50%">
          <MessageList />
        </Panel>
        <PanelResizeHandle className="w-1 bg-transparent hover:bg-blue-300 transition-colors cursor-col-resize z-10" />
        <Panel defaultSize="65%" minSize="30%">
          <ReadingPane />
        </Panel>
      </PanelGroup>
      {children}
    </div>
  );
}
