'use client';

import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    todaySales: 0,
    todayTransactions: 0,
    weekSales: 0,
    weekTransactions: 0,
    totalCredit: 0,
    lowStockCount: 0,
    totalProducts: 0,
    paymentBreakdown: { cash: 0, gcash: 0, credit: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'today' | 'week'>('today');

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-16 text-gray-400">Loading...</div>;
  }

  const sales = view === 'today' ? stats.todaySales : stats.weekSales;
  const transactions = view === 'today' ? stats.todayTransactions : stats.weekTransactions;

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex bg-white rounded-2xl p-1 shadow-sm">
        <button
          onClick={() => setView('today')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${
            view === 'today' ? 'bg-green-600 text-white' : 'text-gray-500'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setView('week')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${
            view === 'week' ? 'bg-green-600 text-white' : 'text-gray-500'
          }`}
        >
          This Week
        </button>
      </div>

      {/* Main Sales Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <p className="text-sm text-gray-500 mb-1">
          {view === 'today' ? "Today's Sales" : "This Week's Sales"}
        </p>
        <p className="text-3xl font-bold text-green-600">
          ₱{sales.toLocaleString()}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {transactions} transaction{transactions !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Payment Breakdown (Week only) */}
      {view === 'week' && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-3">Payment Breakdown</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cash</span>
              <span className="font-medium">₱{stats.paymentBreakdown.cash.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">GCash</span>
              <span className="font-medium text-blue-600">₱{stats.paymentBreakdown.gcash.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Credit</span>
              <span className="font-medium text-amber-500">₱{stats.paymentBreakdown.credit.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Outstanding Credit */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <p className="text-sm text-gray-500 mb-1">Outstanding Credit</p>
        <p className="text-3xl font-bold text-amber-500">
          ₱{stats.totalCredit.toLocaleString()}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <p className="text-sm text-gray-500">Products</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalProducts}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <p className="text-sm text-gray-500">Low Stock</p>
          <p className={`text-2xl font-bold mt-1 ${stats.lowStockCount > 0 ? 'text-red-500' : 'text-green-600'}`}>
            {stats.lowStockCount}
          </p>
        </div>
      </div>
    </div>
  );
}
