"use client";

import React, { useState } from "react";
import Inbox from "./Inbox";
import Reservations from "./Reservations";
import Inventory from "./Inventory";
import { MessageSquare, CalendarDays, Package } from "lucide-react";

type Tab = "reservations" | "inbox" | "inventory";

export default function DashboardContent() {
  const [activeTab, setActiveTab] = useState<Tab>("reservations");

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("reservations")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === "reservations"
              ? "bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <CalendarDays size={16} />
          Reservations
        </button>
        <button
          onClick={() => setActiveTab("inbox")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === "inbox"
              ? "bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <MessageSquare size={16} />
          Inbox
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === "inventory"
              ? "bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <Package size={16} />
          Inventory
        </button>
      </div>

      {/* Content Area */}
      <div className="animate-in fade-in duration-500 slide-in-from-bottom-2">
        {activeTab === "reservations" ? <Reservations /> : activeTab === "inbox" ? <Inbox /> : <Inventory />}
      </div>
    </div>
  );
}
