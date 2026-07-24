'use client';

import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    todaySales: 0,
    todayTransactions: 0,
    weekSales: 0,
    weekTransactions: 0,
    monthSales: 0,
    monthTransactions: 0,
    ytdSales: 0,
    ytdTransactions: 0,
    totalSales: 0,
    totalTransactions: 0,
    totalCredit: 0,
    lowStockCount: 0,
    totalProducts: 0,
    paymentBreakdown: { cash: 0, gcash: 0, credit: 0 },
    totalCashIn: 0,
    totalCashOut: 0,
    netCash: 0,
  });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'today' | 'week' | 'month' | 'ytd' | 'total'>('today');

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

  const getSalesData = () => {
    switch (view) {
      case 'today':
        return { sales: stats.todaySales, transactions: stats.todayTransactions, label: "Today's Sales" };
      case 'week':
        return { sales: stats.weekSales, transactions: stats.weekTransactions, label: "This Week's Sales" };
      case 'month':
        return { sales: stats.monthSales, transactions: stats.monthTransactions, label: "This Month's Sales" };
      case 'ytd':
        return { sales: stats.ytdSales, transactions: stats.ytdTransactions, label: "Year-to-Date Sales" };
      case 'total':
        return { sales: stats.totalSales, transactions: stats.totalTransactions, label: "Total Sales (All Time)" };
      default:
        return { sales: 0, transactions: 0, label: '' };
    }
  };

  const { sales, transactions, label } = getSalesData();

  return (
    <div className="space-y-4">
      {/* Period Toggle */}
      <div className="flex bg-white rounded-2xl p-1 shadow-sm overflow-x-auto no-scrollbar">
        {([
          { key: 'today', label: 'Today' },
          { key: 'week', label: 'Week' },
          { key: 'month', label: 'Month' },
          { key: 'ytd', label: 'YTD' },
          { key: 'total', label: 'Total' },
        ] as const).map((item) => (
          <button
            key={item.key}
            onClick={() => setView(item.key)}
            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium whitespace-nowrap transition ${
              view === item.key ? 'bg-green-600 text-white' : 'text-gray-500'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Sales Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-3xl font-bold text-green-600">
          ₱{sales.toLocaleString()}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {transactions} transaction{transactions !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Payment Breakdown (only for Week view) */}
      {view === 'week' && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-3">Payment Breakdown (This Week)</p>
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

      {/* Cash Flow Summary */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <p className="text-sm text-gray-500 mb-3">Cash Flow (All Time)</p>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Cash In</span>
            <span className="font-medium text-green-600">₱{stats.totalCashIn.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Cash Out</span>
            <span className="font-medium text-red-500">₱{stats.totalCashOut.toLocaleString()}</span>
          </div>
          <div className="border-t border-gray-100 pt-2 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Net Cash</span>
            <span className={`font-bold ${stats.netCash >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              ₱{stats.netCash.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

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
