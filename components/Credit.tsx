'use client';

import { useState } from 'react';

const initialCustomers = [
  { id: 1, name: 'Mang Jose', balance: 450, lastPayment: '2026-07-20' },
  { id: 2, name: 'Aling Rosa', balance: 120, lastPayment: '2026-07-22' },
  { id: 3, name: 'Kuya Ben', balance: 780, lastPayment: '2026-07-18' },
  { id: 4, name: 'Ate Marites', balance: 0, lastPayment: '2026-07-23' },
  { id: 5, name: 'Mang Pedro', balance: 320, lastPayment: '2026-07-19' },
];

export default function Credit() {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalOutstanding = customers.reduce((sum, c) => sum + c.balance, 0);

  const recordPayment = () => {
    if (!selectedCustomer || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;

    setCustomers((prev) =>
      prev.map((c) =>
        c.id === selectedCustomer
          ? {
              ...c,
              balance: Math.max(0, c.balance - amount),
              lastPayment: new Date().toISOString().split('T')[0],
            }
          : c
      )
    );

    setPaymentAmount('');
    setSelectedCustomer(null);
    alert(`Bayad na naitala: ₱${amount}`);
  };

  return (
    <div className="space-y-5 pb-10">
      {/* Summary */}
      <div className="bg-white rounded-2xl p-4 shadow border">
        <p className="text-sm text-gray-500">Total Outstanding Credit</p>
        <p className="text-3xl font-bold text-amber-600">₱{totalOutstanding.toLocaleString()}</p>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Hanapin ang customer..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-4 text-base border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500"
      />

      {/* Customer List */}
      <div className="space-y-3">
        {filtered.map((customer) => (
          <div
            key={customer.id}
            className={`bg-white rounded-2xl p-4 shadow border ${
              selectedCustomer === customer.id ? 'border-green-500' : 'border-gray-100'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-lg">{customer.name}</div>
                <div className="text-sm text-gray-500">
                  Last payment: {customer.lastPayment}
                </div>
              </div>
              <div
                className={`text-xl font-bold ${
                  customer.balance > 0 ? 'text-amber-600' : 'text-green-600'
                }`}
              >
                ₱{customer.balance}
              </div>
            </div>

            {customer.balance > 0 && (
              <button
                onClick={() => setSelectedCustomer(customer.id)}
                className="mt-3 w-full py-2 bg-amber-50 text-amber-700 rounded-xl text-sm font-medium"
              >
                Mag-record ng Bayad
              </button>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 py-10">Walang nahanap</p>
      )}

      {/* Payment Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold">
              Bayad para kay{' '}
              {customers.find((c) => c.id === selectedCustomer)?.name}
            </h3>

            <input
              type="number"
              placeholder="Halaga ng bayad"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="w-full p-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  setPaymentAmount('');
                }}
                className="flex-1 py-3 bg-gray-100 rounded-2xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={recordPayment}
                className="flex-1 py-3 bg-green-600 text-white rounded-2xl font-medium"
              >
                I-save ang Bayad
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
