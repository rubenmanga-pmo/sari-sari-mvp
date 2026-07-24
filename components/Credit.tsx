'use client';

import { useState, useEffect } from 'react';

type Customer = {
  id: number;
  name: string;
  phone: string;
  balance: number;
  lastPayment: string;
};

export default function Credit() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New Customer form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const loadCustomers = () => {
    setLoading(true);
    fetch('/api/customers')
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalOutstanding = customers.reduce((sum, c) => sum + c.balance, 0);

  const recordPayment = async () => {
    if (!selectedCustomer || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          customerName: selectedCustomer.name,
          amount,
        }),
      });

      if (res.ok) {
        alert(`Bayad na naitala: ₱${amount}`);
        setPaymentAmount('');
        setSelectedCustomer(null);
        loadCustomers();
      } else {
        alert('Failed to record payment');
      }
    } catch (err) {
      console.error(err);
      alert('Error recording payment');
    } finally {
      setSaving(false);
    }
  };

  const addNewCustomer = async () => {
    if (!newName.trim()) {
      alert('Please enter customer name');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          phone: newPhone.trim(),
        }),
      });

      if (res.ok) {
        alert('Customer added successfully!');
        setNewName('');
        setNewPhone('');
        setShowAddForm(false);
        loadCustomers();
      } else {
        alert('Failed to add customer');
      }
    } catch (err) {
      console.error(err);
      alert('Error adding customer');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading customers...</div>;
  }

  return (
    <div className="space-y-5 pb-10">
      {/* Summary */}
      <div className="bg-white rounded-2xl p-4 shadow border">
        <p className="text-sm text-gray-500">Total Outstanding Credit</p>
        <p className="text-3xl font-bold text-amber-600">
          ₱{totalOutstanding.toLocaleString()}
        </p>
      </div>

      {/* Add Customer Button */}
      <button
        onClick={() => setShowAddForm(true)}
        className="w-full py-3 bg-green-600 text-white rounded-2xl font-medium"
      >
        + Add New Customer
      </button>

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
              selectedCustomer?.id === customer.id ? 'border-green-500' : 'border-gray-100'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-lg">{customer.name}</div>
                <div className="text-sm text-gray-500">
                  {customer.phone && <span>{customer.phone} · </span>}
                  Last payment: {customer.lastPayment || '—'}
                </div>
              </div>
              <div
                className={`text-xl font-bold ${
                  customer.balance > 0 ? 'text-amber-600' : 'text-green-600'
                }`}
              >
                ₱{customer.balance.toLocaleString()}
              </div>
            </div>

            {customer.balance > 0 && (
              <button
                onClick={() => setSelectedCustomer(customer)}
                className="mt-3 w-full py-2 bg-amber-50 text-amber-700 rounded-xl text-sm font-medium"
              >
                Mag-record ng Bayad
              </button>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 py-10">
          {customers.length === 0 ? 'Walang customers sa Google Sheet' : 'Walang nahanap'}
        </p>
      )}

      {/* Add Customer Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold">Add New Customer</h3>

            <input
              type="text"
              placeholder="Customer Name *"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full p-4 text-base border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500"
            />

            <input
              type="text"
              placeholder="Phone (optional)"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="w-full p-4 text-base border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewName('');
                  setNewPhone('');
                }}
                className="flex-1 py-3 bg-gray-100 rounded-2xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={addNewCustomer}
                disabled={saving}
                className="flex-1 py-3 bg-green-600 text-white rounded-2xl font-medium disabled:bg-gray-400"
              >
                {saving ? 'Saving...' : 'Save Customer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold">
              Bayad para kay {selectedCustomer.name}
            </h3>
            <p className="text-sm text-gray-500">
              Current balance: ₱{selectedCustomer.balance.toLocaleString()}
            </p>

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
                disabled={saving}
                className="flex-1 py-3 bg-green-600 text-white rounded-2xl font-medium disabled:bg-gray-400"
              >
                {saving ? 'Saving...' : 'I-save ang Bayad'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
