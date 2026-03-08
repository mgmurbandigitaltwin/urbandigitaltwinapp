import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';

interface HeaderProps {
  role: 'admin' | 'business';
  lastUpdated: Date;
}

export default function Header({ role, lastUpdated }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 shadow-sm">
      <div className="flex items-center flex-1">
        <button className="md:hidden p-2 -ml-2 mr-2 text-slate-400 hover:text-slate-500">
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="flex-1 flex max-w-md">
          <div className="relative w-full text-slate-400 focus-within:text-slate-600">
            <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
              <Search className="h-5 w-5" aria-hidden="true" />
            </div>
            <input
              id="search-field"
              className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-slate-900 placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-0 focus:border-transparent sm:text-sm bg-transparent"
              placeholder="Search Montgomery locations, businesses..."
              type="search"
              name="search"
            />
          </div>
        </div>
      </div>
      <div className="ml-4 flex items-center md:ml-6 space-x-4">
        <div className="hidden sm:flex flex-col items-end text-xs text-slate-500">
          <span className="font-medium text-slate-700">Live Data Sync</span>
          <span>Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <button className="bg-white p-1 rounded-full text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 relative">
          <span className="sr-only">View notifications</span>
          <Bell className="h-6 w-6" aria-hidden="true" />
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
}
