'use client';

import { useState, useEffect } from 'react';

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  lowStock: number;
};

const categories = ['Drinks', 'Noodles', 'Snacks', 'Others'];

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Add Product form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Drinks');
  const [newStock, setNewStock] = useState('');
  const [newLowStock, setNewLowStock] = useState('10');

  const loadProducts = () => {
    setLoading(true);
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = products.filter((p) => p.stock <= p.lowStock).length;

  const adjustStock = async (productId: number, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    setSaving(true);

    try {
      const res = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, newStock }),
      });

      if (res.ok) {
        // Update local state immediately for better UX
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, stock: newStock } : p
          )
        );
      } else {
        alert('Failed to update stock');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating stock');
    } finally {
      setSaving(false);
    }
  };

  const addNewProduct = async () => {
    if (!newName.trim()) {
      alert('Please enter product name');
      return;
    }
    if (!newPrice || isNaN(Number(newPrice))) {
      alert('Please enter a valid price');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          price: Number(newPrice),
          category: newCategory,
          stock: Number(newStock) || 0,
          lowStock: Number(newLowStock) || 10,
        }),
      });

      if (res.ok) {
        alert('Product added successfully!');
        setNewName('');
        setNewPrice('');
        setNewCategory('Drinks');
        setNewStock('');
        setNewLowStock('10');
        setShowAddForm(false);
        loadProducts();
      } else {
        alert('Failed to add product');
      }
    } catch (err) {
      console.error(err);
      alert('Error adding product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading inventory...</div>;
  }

  return (
    <div className="space-y-5 pb-10">
      {/* Summary */}
      <div className="bg-white rounded-2xl p-4 shadow border flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-2xl font-bold">{products.length}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Low Stock</p>
          <p className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-red-500' : 'text-green-600'}`}>
            {lowStockCount}
          </p>
        </div>
      </div>

      {/* Add Product Button */}
      <button
        onClick={() => setShowAddForm(true)}
        className="w-full py-3 bg-green-600 text-white rounded-2xl font-medium"
      >
        + Add New Product
      </button>

      {/* Search */}
      <input
        type="text"
        placeholder="Hanapin sa inventory..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-4 text-base border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500"
      />

      {/* Product List */}
      <div className="space-y-3">
        {filtered.map((product) => {
          const isLow = product.stock <= product.lowStock;
          return (
            <div
              key={product.id}
              className={`bg-white rounded-2xl p-4 shadow border ${
                isLow ? 'border-red-300' : 'border-gray-100'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-500">
                    ₱{product.price} · {product.category}
                  </div>
                </div>
                <div className={`text-lg font-bold ${isLow ? 'text-red-500' : 'text-gray-800'}`}>
                  {product.stock}
                </div>
              </div>

              {/* Stock Adjustment Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustStock(product.id, product.stock, -1)}
                  disabled={saving || product.stock <= 0}
                  className="w-10 h-10 rounded-full bg-gray-100 text-xl font-bold disabled:opacity-40"
                >
                  −
                </button>
                <button
                  onClick={() => adjustStock(product.id, product.stock, 1)}
                  disabled={saving}
                  className="w-10 h-10 rounded-full bg-gray-100 text-xl font-bold disabled:opacity-40"
                >
                  +
                </button>
                <button
                  onClick={() => adjustStock(product.id, product.stock, 10)}
                  disabled={saving}
                  className="ml-auto px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-medium disabled:opacity-40"
                >
                  +10
                </button>
                <button
                  onClick={() => adjustStock(product.id, product.stock, -10)}
                  disabled={saving || product.stock <= 0}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium disabled:opacity-40"
                >
                  −10
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 py-10">
          {products.length === 0 ? 'Walang products sa Google Sheet' : 'Walang nahanap'}
        </p>
      )}

      {/* Add Product Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold">Add New Product</h3>

            <input
              type="text"
              placeholder="Product Name *"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full p-4 text-base border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500"
            />

            <input
              type="number"
              placeholder="Price *"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="w-full p-4 text-base border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500"
            />

            <div>
              <label className="text-sm text-gray-500 mb-1 block">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full p-4 text-base border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <input
              type="number"
              placeholder="Starting Stock"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              className="w-full p-4 text-base border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500"
            />

            <input
              type="number"
              placeholder="Low Stock Alert Level"
              value={newLowStock}
              onChange={(e) => setNewLowStock(e.target.value)}
              className="w-full p-4 text-base border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewName('');
                  setNewPrice('');
                  setNewCategory('Drinks');
                  setNewStock('');
                  setNewLowStock('10');
                }}
                className="flex-1 py-3 bg-gray-100 rounded-2xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={addNewProduct}
                disabled={saving}
                className="flex-1 py-3 bg-green-600 text-white rounded-2xl font-medium disabled:bg-gray-400"
              >
                {saving ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
