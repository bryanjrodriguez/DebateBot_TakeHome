'use client';

import Sidebar from "./components/SideBar";
import ChatWindow from "./components/ChatWindow";
import { Menu } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex w-full h-screen relative">
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`md:hidden fixed top-2 left-2 z-50 p-2 bg-background rounded-md border border-border hover:bg-muted transition-colors ${
          isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <Menu className="h-5 w-5" />
      </button>

      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed md:static inset-y-0 left-0 z-40 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <div className="flex-1">
        <ChatWindow />
      </div>
    </div>
  );
}
