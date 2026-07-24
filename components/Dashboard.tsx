'use client';

import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    todaySales: 0,
    todayTransactions: 0,
    totalCredit: 0,
    lowStockCount: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);

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
    return <div className="text-center py-10 text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-5">
      {/* Today's Sales */}
      <div className="bg-white rounded-2xl p-5 shadow border">
        <p className="text-sm text-gray-500 mb-1">Today's Sales</p>
        <p className="text-3xl font-bold text-green-600">
          ₱{stats.todaySales.toLocaleString()}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {stats.todayTransactions} transaction{stats.todayTransactions !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Outstanding Credit */}
      <div className="bg-white rounded-2xl p-5 shadow border">
        <p className="text-sm text-gray-500 mb-1">Outstanding Credit</p>
        <p className="text-3xl font-bold text-amber-600">
          ₱{stats.totalCredit.toLocaleString()}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow border text-center">
          <p className="text-sm text-gray-500">Products</p>
          <p className="text-2xl font-bold">{stats.totalProducts}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow border text-center">
          <p className="text-sm text-gray-500">Low Stock</p>
          <p className={`text-2xl font-bold ${stats.lowStockCount > 0 ? 'text-red-500' : 'text-green-600'}`}>
            {stats.lowStockCount}
          </p>
        </div>
      </div>
    </div>
  );
}
