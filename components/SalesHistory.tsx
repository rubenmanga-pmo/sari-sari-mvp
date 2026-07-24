'use client';

import { useState, useEffect } from 'react';

type Sale = {
  id: string;
  date: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  type: string;
  customerName: string;
};

export default function SalesHistory() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'cash' | 'credit'>('all');

  useEffect(() => {
    fetch('/api/sales-history')
      .then((res) => res.json())
      .then((data) => {
        setSales(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredSales = sales.filter((s) => {
    if (filter === 'all') return true;
    return s.type === filter;
  });

  const totalAmount = filteredSales.reduce((sum, s) => sum + s.total, 0);

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading sales history...</div>;
  }

  return (
    <div className="space-y-5 pb-10">
      {/* Summary */}
      <div className="bg-white rounded-2xl p-4 shadow border">
        <p className="text-sm text-gray-500">Total ({filter === 'all' ? 'All' : filter})</p>
        <p className="text-2xl font-bold text-green-600">
          ₱{totalAmount.toLocaleString()}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {filteredSales.length} transaction{filteredSales.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'cash', 'credit'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
              filter === f
                ? 'bg-green-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Sales List */}
      <div className="space-y-3">
        {filteredSales.map((sale) => (
          <div key={sale.id} className="bg-white rounded-2xl p-4 shadow border">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{sale.productName}</div>
                <div className="text-sm text-gray-500">
                  {sale.quantity} × ₱{sale.price}
                  {sale.customerName && ` · ${sale.customerName}`}
                </div>
                <div className="text-xs text-gray-400 mt-1">{sale.date}</div>
              </div>
              <div className="text-right">
                <div className="font-bold">₱{sale.total.toLocaleString()}</div>
                <div
                  className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${
                    sale.type === 'cash'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {sale.type}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSales.length === 0 && (
        <p className="text-center text-gray-400 py-10">Walang transactions</p>
      )}
    </div>
  );
}
