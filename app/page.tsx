'use client';

import { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import SellPOS from '@/components/SellPOS';
import Inventory from '@/components/Inventory';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sell' | 'inventory' | 'credit'>('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white p-4 text-center">
        <h1 className="text-2xl font-bold">Aling Maria Sari-Sari Store</h1>
      </header>
      
      <nav className="flex border-b bg-white sticky top-0 z-10">
        {[
          { key: 'dashboard', label: 'Dashboard' },
          { key: 'sell', label: 'Magbenta' },
          { key: 'inventory', label: 'Inventory' },
          { key: 'credit', label: 'Credit' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${
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
        {activeTab === 'credit' && (
          <div className="p-8 text-center text-gray-500">Credit Module Coming Soon</div>
        )}
      </main>
    </div>
  );
}
