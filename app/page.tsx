'use client';

import { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import SellPOS from '@/components/SellPOS';
import Inventory from '@/components/Inventory';
import Credit from '@/components/Credit';
import SalesHistory from '@/components/SalesHistory';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sell' | 'inventory' | 'credit' | 'history'>('dashboard');

  const tabs = [
    { key: 'dashboard', label: 'Home', icon: '🏠' },
    { key: 'sell', label: 'Magbenta', icon: '🛒' },
    { key: 'inventory', label: 'Stocks', icon: '📦' },
    { key: 'credit', label: 'Credit', icon: '💳' },
    { key: 'history', label: 'History', icon: '📋' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      {/* Header */}
      <header className="bg-green-600 text-white px-4 py-4 sticky top-0 z-20 shadow-md">
        <h1 className="text-xl font-bold text-center tracking-wide">
          Aling Maria Sari-Sari
        </h1>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-md mx-auto">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'sell' && <SellPOS />}
        {activeTab === 'inventory' && <Inventory />}
        {activeTab === 'credit' && <Credit />}
        {activeTab === 'history' && <SalesHistory />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30">
        <div className="max-w-md mx-auto flex">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-green-600'
                  : 'text-gray-400'
              }`}
            >
              <span className="text-xl mb-0.5">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
