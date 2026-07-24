'use client';

import { useState, useEffect } from 'react';

type CashFlowEntry = {
  id: string;
  date: string;
  type: string;
  category: string;
  amount: number;
  notes: string;
  reference: string;
};

const OUT_CATEGORIES = ['Purchases', 'Expenses', 'Owner Drawing'];
const IN_CATEGORIES = ['Other Cash In'];

export default function CashFlow() {
  const [entries, setEntries] = useState<CashFlowEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [typeFilter, setTypeFilter] = useState<'all' | 'in' | 'out'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'in' | 'out'>('out');
  const [formCategory, setFormCategory] = useState('Purchases');
  const [formAmount, setFormAmount] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const loadEntries = () => {
    setLoading(true);
    fetch('/api/cashflow')
      .then((res) => res.json())
      .then((data) => {
        setEntries(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const openForm = (type: 'in' | 'out') => {
    setFormType(type);
    setFormCategory(type === 'out' ? 'Purchases' : 'Other Cash In');
    setFormAmount('');
    setFormNotes('');
    setShowForm(true);
  };

  const saveEntry = async () => {
    if (!formAmount || isNaN(Number(formAmount)) || Number(formAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/cashflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formType,
          category: formCategory,
          amount: Number(formAmount),
          notes: formNotes,
        }),
      });

      if (res.ok) {
        alert('Recorded successfully!');
        setShowForm(false);
        loadEntries();
      } else {
        alert('Failed to save');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving entry');
    } finally {
      setSaving(false);
    }
  };

  // Date helpers
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  const weekStartStr = monday.toISOString().split('T')[0];

  const monthStartStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  const filteredEntries = entries.filter((e) => {
    // Type filter
    if (typeFilter !== 'all' && e.type !== typeFilter) return false;

    // Date filter
    const entryDate = e.date ? e.date.substring(0, 10) : '';
    if (!entryDate) return dateFilter === 'all';

    if (dateFilter === 'today') return entryDate === todayStr;
    if (dateFilter === 'week') return entryDate >= weekStartStr;
    if (dateFilter === 'month') return entryDate >= monthStartStr;

    return true; // all
  });

  const totalIn = filteredEntries
    .filter((e) => e.type === 'in')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalOut = filteredEntries
    .filter((e) => e.type === 'out')
    .reduce((sum, e) => sum + e.amount, 0);

  const netCash = totalIn - totalOut;

  if (loading) {
    return <div className="text-center py-16 text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
          <p className="text-xs text-gray-500">Cash In</p>
          <p className="text-lg font-bold text-green-600 mt-1">
            ₱{totalIn.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
          <p className="text-xs text-gray-500">Cash Out</p>
          <p className="text-lg font-bold text-red-500 mt-1">
            ₱{totalOut.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
          <p className="text-xs text-gray-500">Net</p>
          <p className={`text-lg font-bold mt-1 ${netCash >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            ₱{netCash.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => openForm('in')}
          className="py-3.5 bg-green-600 text-white rounded-2xl font-medium shadow-sm active:scale-[0.98] transition"
        >
          + Cash In
        </button>
        <button
          onClick={() => openForm('out')}
          className="py-3.5 bg-red-500 text-white rounded-2xl font-medium shadow-sm active:scale-[0.98] transition"
        >
          + Cash Out
        </button>
      </div>

      {/* Date Filter */}
      <div className="flex bg-white rounded-2xl p-1 shadow-sm overflow-x-auto no-scrollbar">
        {([
          { key: 'all', label: 'All' },
          { key: 'today', label: 'Today' },
          { key: 'week', label: 'Week' },
          { key: 'month', label: 'Month' },
        ] as const).map((item) => (
          <button
            key={item.key}
            onClick={() => setDateFilter(item.key)}
            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium whitespace-nowrap transition ${
              dateFilter === item.key ? 'bg-green-600 text-white' : 'text-gray-500'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Type Filter */}
      <div className="flex bg-white rounded-2xl p-1 shadow-sm">
        {([
          { key: 'all', label: 'All' },
          { key: 'in', label: 'Cash In' },
          { key: 'out', label: 'Cash Out' },
        ] as const).map((item) => (
          <button
            key={item.key}
            onClick={() => setTypeFilter(item.key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${
              typeFilter === item.key ? 'bg-green-600 text-white' : 'text-gray-500'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Entries List */}
      <div className="space-y-3">
        {filteredEntries.map((entry) => (
          <div
            key={entry.id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-800">{entry.category}</div>
                {entry.notes && (
                  <div className="text-sm text-gray-500 mt-0.5 truncate">
                    {entry.notes}
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-1">{entry.date}</div>
              </div>
              <div className="text-right ml-3">
                <div
                  className={`font-bold ${
                    entry.type === 'in' ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {entry.type === 'in' ? '+' : '-'}₱
                  {entry.amount.toLocaleString()}
                </div>
                <div
                  className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block font-medium ${
                    entry.type === 'in'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-600'
                  }`}
                >
                  {entry.type === 'in' ? 'In' : 'Out'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEntries.length === 0 && (
        <p className="text-center text-gray-400 py-10">
          Walang records for the selected filters
        </p>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-800">
              Record {formType === 'in' ? 'Cash In' : 'Cash Out'}
            </h3>

            <div>
              <label className="text-sm text-gray-500 mb-1 block">Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full p-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {(formType === 'out' ? OUT_CATEGORIES : IN_CATEGORIES).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="number"
              placeholder="Amount *"
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
              className="w-full p-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <input
              type="text"
              placeholder="Notes (optional)"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="w-full p-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 bg-gray-100 rounded-2xl font-medium text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={saveEntry}
                disabled={saving}
                className={`flex-1 py-3 text-white rounded-2xl font-medium disabled:bg-gray-400 ${
                  formType === 'in' ? 'bg-green-600' : 'bg-red-500'
                }`}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
