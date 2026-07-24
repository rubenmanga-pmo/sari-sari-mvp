'use client';

import { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import SellPOS from '@/components/SellPOS';
import Inventory from '@/components/Inventory';
import Credit from '@/components/Credit';
import SalesHistory from '@/components/SalesHistory';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sell' | 'inventory' | 'credit' | 'history'>('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white p-4 text-center">
        <h1 className="text-2xl font-bold">Aling Maria Sari-Sari Store</h1>
      </header>
      
      <nav className="flex border-b bg-white sticky top-0 z-10 overflow-x-auto">
        {[
          { key: 'dashboard', label: 'Dashboard' },
          { key: 'sell', label: 'Magbenta' },
          { key: 'inventory', label: 'Inventory' },
          { key: 'credit', label: 'Credit' },
          { key: 'history', label: 'History' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 py-4 text-sm font-medium whitespace-nowrap px-3 transition-colors ${
              activeTab === tab.key 
                ? 'border-b-4 border-green-600 text-green-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="p-4 max-w-md mx-auto pb-20">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'sell' && <SellPOS />}
        {activeTab === 'inventory' && <Inventory />}
        {activeTab === 'credit' && <Credit />}
        {activeTab === 'history' && <SalesHistory />}
      </main>
    </div>
  );
}
