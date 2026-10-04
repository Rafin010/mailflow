"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { Search, Archive, Trash2, AlertCircle, CheckSquare, Square, MinusSquare, RotateCw, Star, Inbox, Tag, Users, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { useMail, BulkAction } from "@/components/MailProvider";
import { FOLDER_FROM_PATH, FOLDER_LABEL, Category } from "@/lib/mockMessages";
import { useSettings } from "@/components/SettingsProvider";
import { formatDate } from "@/lib/dateFormatter";

type Tab = { id: Category; label: string; icon: any };

const INBOX_TABS: Tab[] = [
  { id: "Primary", label: "Primary", icon: Inbox },
  { id: "Promotions", label: "Promotions", icon: Tag },
  { id: "Social", label: "Social", icon: Users },
  { id: "Updates", label: "Updates", icon: Info },
];

export function MessageList() {
  const pathname = usePathname();
  const folder = FOLDER_FROM_PATH[pathname] ?? "inbox";
  const { mailbox, selectedId, isRefreshing, refreshTick, selectMessage, refresh, bulkAction } = useMail();
  const { settings } = useSettings();
  const messages = mailbox[folder];

  const [checkedIds, setCheckedIds] = useState<number[]>([]);
  const [query, setQuery] = useState("");
  
  // Category / Pagination state
  const [activeCategory, setActiveCategory] = useState<Category>("Primary");
  const [currentPage, setCurrentPage] = useState(1);
  const [showPaginationMenu, setShowPaginationMenu] = useState(false);
  const paginationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (paginationRef.current && !paginationRef.current.contains(event.target as Node)) {
        setShowPaginationMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset states on folder change
  useEffect(() => {
    setCheckedIds([]);
    setQuery("");
    setCurrentPage(1);
    setActiveCategory("Primary");
    selectMessage(null);
  }, [folder, selectMessage]);

  // Reset page when category or query changes
  useEffect(() => {
    setCurrentPage(1);
    setCheckedIds([]);
  }, [activeCategory, query]);

  // Filter messages
  let filtered = messages;
  if (folder === "inbox") {
    filtered = filtered.filter((m) => m.category === activeCategory);
  }
  if (query) {
    filtered = filtered.filter((m) =>
      `${m.from} ${m.subject} ${m.snippet}`.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Pagination Math
  const itemsPerPage = 50;
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  
  const paginatedMessages = filtered.slice(startIndex, endIndex);

  const toggleCheck = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setCheckedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  };

  const allChecked = paginatedMessages.length > 0 && checkedIds.length === paginatedMessages.length;
  const toggleAll = () => setCheckedIds(allChecked ? [] : paginatedMessages.map((m) => m.id));

  const runBulk = (action: BulkAction) => {
    bulkAction(folder, checkedIds, action);
    setCheckedIds([]);
  };

  const iconBtn = "p-1.5 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400";

  return (
    <div className="relative flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex h-14 items-center justify-between gap-1 px-3">
        <div className="flex flex-1 items-center gap-1">
          {checkedIds.length > 0 ? (
            <div className="flex h-10 w-full items-center rounded-md bg-blue-50 px-2 animate-fade-in">
              <button onClick={toggleAll} className="mr-3 p-1 text-blue-600" title="Select all">
                {allChecked ? <CheckSquare className="h-5 w-5" /> : <MinusSquare className="h-5 w-5" />}
              </button>
              <span className="mr-auto text-sm font-medium text-blue-700">{checkedIds.length} selected</span>
              <button onClick={() => runBulk("archive")} className="rounded-md p-1.5 text-blue-700 hover:bg-blue-100" title="Archive">
                <Archive className="h-4 w-4" />
              </button>
              <button onClick={() => runBulk("spam")} className="rounded-md p-1.5 text-blue-700 hover:bg-blue-100" title="Report spam">
                <AlertCircle className="h-4 w-4" />
              </button>
              <button onClick={() => runBulk("delete")} className="rounded-md p-1.5 text-blue-700 hover:bg-blue-100" title={folder === "trash" ? "Delete permanently" : "Delete"}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <button onClick={toggleAll} disabled={paginatedMessages.length === 0} className={`${iconBtn} disabled:opacity-40`} title="Select all">
                <Square className="h-5 w-5" />
              </button>
              <button
                onClick={() => refresh(folder)}
                disabled={isRefreshing}
                className={`${iconBtn} disabled:cursor-wait`}
                title="Refresh"
                aria-label="Refresh"
              >
                <RotateCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
              <div className="relative ml-1 max-w-sm flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${FOLDER_LABEL[folder].toLowerCase()}...`}
                  className="w-full text-gray-900 rounded-md border border-transparent bg-gray-100 py-1.5 pl-9 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-1 text-gray-500">
          <div className="relative" ref={paginationRef}>
            <button 
              className="px-2 py-1.5 text-xs hover:bg-gray-100 rounded-md transition-colors font-medium flex items-center gap-1"
              onMouseEnter={() => setShowPaginationMenu(true)}
              onClick={() => setShowPaginationMenu(!showPaginationMenu)}
            >
              {totalItems > 0 ? `${startIndex + 1}-${endIndex} of ${totalItems}` : "0 of 0"}
            </button>
            {showPaginationMenu && totalItems > 0 && (
              <div 
                className="absolute right-0 top-full mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-100 py-1 z-50 animate-fade-in"
                onMouseLeave={() => setShowPaginationMenu(false)}
              >
                <button 
                  onClick={() => { setCurrentPage(1); setShowPaginationMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Newest
                </button>
                <button 
                  onClick={() => { setCurrentPage(totalPages); setShowPaginationMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Oldest
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`${iconBtn} disabled:opacity-30`}
            title="Newer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalItems === 0}
            className={`${iconBtn} disabled:opacity-30`}
            title="Older"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Categories Tabs (Inbox only) */}
      {folder === "inbox" && (
        <div className="flex px-2">
          {INBOX_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive ? "text-blue-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 animate-fade-in rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Indeterminate progress bar while refreshing */}
      <div className="relative h-0.5 overflow-hidden">
        {isRefreshing && <div className="absolute inset-y-0 w-1/3 bg-blue-500 animate-progress" />}
      </div>

      {/* Wrapper to clip translation overflow during animation and prevent extra scrollbars */}
      <div className="flex-1 relative overflow-hidden">
        <div
          key={`${folder}-${activeCategory}-${refreshTick}-${currentPage}`}
          className={`absolute inset-0 overflow-y-auto overflow-x-hidden pt-1 animate-page-in ${isRefreshing ? "opacity-60" : "opacity-100"}`}
        >
          {paginatedMessages.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-gray-400 animate-fade-in">
              <Inbox className="h-8 w-8" />
              <p className="text-sm">{query ? "No matching messages" : `No messages in ${folder === 'inbox' ? activeCategory : FOLDER_LABEL[folder]}`}</p>
            </div>
          ) : (
          paginatedMessages.map((msg, i) => {
            const isChecked = checkedIds.includes(msg.id);
            const isOpen = selectedId === msg.id;
            return (
              <div
                key={msg.id}
                role="button"
                tabIndex={0}
                onClick={() => selectMessage(msg.id)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), selectMessage(msg.id))}
                style={{ animationDelay: `${(i % itemsPerPage) * 15}ms` }}
                className={`group relative mx-2 my-1 flex cursor-pointer gap-3 rounded-lg p-3 outline-none transition-colors animate-row-in focus-visible:ring-2 focus-visible:ring-blue-400 ${
                  isOpen
                    ? "bg-blue-50"
                    : isChecked
                    ? "bg-blue-50/60"
                    : "hover:bg-gray-50"
                }`}
              >
                {/* Active accent bar */}
                <span
                  className={`absolute left-0 top-2 bottom-2 w-1 rounded-full bg-blue-600 transition-all duration-200 ${
                    isOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-50"
                  }`}
                />
                
                <div className="pt-0.5 flex flex-col items-center gap-1">
                  <button
                    onClick={(e) => toggleCheck(e, msg.id)}
                    className={`focus:outline-none ${isChecked ? "text-blue-600" : "text-gray-300 hover:text-gray-500"}`}
                    aria-label="Select message"
                  >
                    {isChecked ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                  </button>
                  {/* Hover Actions */}
                  {settings.hoverActions && !isOpen && (
                    <div className="absolute left-10 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-gray-50 px-1 py-0.5 rounded shadow-sm border border-gray-200 transition-opacity z-10">
                      <button onClick={(e) => { e.stopPropagation(); bulkAction(folder, [msg.id], "archive"); }} className="p-1 text-gray-500 hover:text-gray-800 rounded hover:bg-gray-200" title="Archive"><Archive className="h-3.5 w-3.5" /></button>
                      <button onClick={(e) => { e.stopPropagation(); bulkAction(folder, [msg.id], "delete"); }} className="p-1 text-gray-500 hover:text-gray-800 rounded hover:bg-gray-200" title={folder === "trash" ? "Delete permanently" : "Delete"}><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-baseline justify-between">
                    <span className={`truncate text-sm ${msg.unread ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                      {folder === "sent" || folder === "drafts" ? `To: ${msg.to}` : msg.from}
                    </span>
                    <span className={`ml-2 whitespace-nowrap text-xs ${msg.unread ? "font-semibold text-blue-700" : "text-gray-500"}`}>
                      {formatDate(msg.date, settings.timezone)}
                    </span>
                  </div>
                  <div className="mb-1 flex items-center gap-2">
                    {msg.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />}
                    <h4 className={`truncate text-sm ${msg.unread ? "font-semibold text-gray-800" : "text-gray-600"}`}>{msg.subject}</h4>
                    {msg.starred && <Star className="ml-auto h-3.5 w-3.5 shrink-0 fill-yellow-400 text-yellow-400" />}
                  </div>
                  {settings.showSnippets && (
                    <p className="line-clamp-2 text-xs text-gray-500">{msg.snippet}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
        </div>
      </div>
    </div>
  );
}
