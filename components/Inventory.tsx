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

  // Add / Edit form
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState('Drinks');
  const [formStock, setFormStock] = useState('');
  const [formLowStock, setFormLowStock] = useState('10');

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

  const openAddForm = () => {
    setEditingProduct(null);
    setFormName('');
    setFormPrice('');
    setFormCategory('Drinks');
    setFormStock('');
    setFormLowStock('10');
    setShowForm(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormPrice(String(product.price));
    setFormCategory(product.category);
    setFormStock(String(product.stock));
    setFormLowStock(String(product.lowStock));
    setShowForm(true);
  };

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
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
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

  const saveProduct = async () => {
    if (!formName.trim()) {
      alert('Please enter product name');
      return;
    }
    if (!formPrice || isNaN(Number(formPrice))) {
      alert('Please enter a valid price');
      return;
    }

    setSaving(true);
    try {
      if (editingProduct) {
        // Update existing product
        const res = await fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingProduct.id,
            name: formName.trim(),
            price: Number(formPrice),
            category: formCategory,
            lowStock: Number(formLowStock) || 10,
          }),
        });

        if (res.ok) {
          alert('Product updated successfully!');
          setShowForm(false);
          loadProducts();
        } else {
          alert('Failed to update product');
        }
      } else {
        // Add new product
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName.trim(),
            price: Number(formPrice),
            category: formCategory,
            stock: Number(formStock) || 0,
            lowStock: Number(formLowStock) || 10,
          }),
        });

        if (res.ok) {
          alert('Product added successfully!');
          setShowForm(false);
          loadProducts();
        } else {
          alert('Failed to add product');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Error saving product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <p className="text-sm text-gray-500">Products</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{products.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <p className="text-sm text-gray-500">Low Stock</p>
          <p className={`text-2xl font-bold mt-1 ${lowStockCount > 0 ? 'text-red-500' : 'text-green-600'}`}>
            {lowStockCount}
          </p>
        </div>
      </div>

      {/* Add Product Button */}
      <button
        onClick={openAddForm}
        className="w-full py-3.5 bg-green-600 text-white rounded-2xl font-medium shadow-sm active:scale-[0.98] transition"
      >
        + Add New Product
      </button>

      {/* Search */}
      <input
        type="text"
        placeholder="Hanapin sa inventory..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3.5 text-base bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
      />

      {/* Product List */}
      <div className="space-y-3">
        {filtered.map((product) => {
          const isLow = product.stock <= product.lowStock;
          return (
            <div
              key={product.id}
              className={`bg-white rounded-2xl p-4 shadow-sm border ${
                isLow ? 'border-red-200' : 'border-gray-100'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-medium text-gray-800">{product.name}</div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    ₱{product.price} · {product.category}
                  </div>
                </div>
                <div className={`text-lg font-bold ${isLow ? 'text-red-500' : 'text-gray-800'}`}>
                  {product.stock}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustStock(product.id, product.stock, -1)}
                  disabled={saving || product.stock <= 0}
                  className="w-9 h-9 rounded-full bg-gray-100 text-lg font-bold text-gray-600 disabled:opacity-40"
                >
                  −
                </button>
                <button
                  onClick={() => adjustStock(product.id, product.stock, 1)}
                  disabled={saving}
                  className="w-9 h-9 rounded-full bg-gray-100 text-lg font-bold text-gray-600 disabled:opacity-40"
                >
                  +
                </button>
                <button
                  onClick={() => adjustStock(product.id, product.stock, 10)}
                  disabled={saving}
                  className="px-3 py-1.5 bg-green-50 text-green-700 rounded-xl text-sm font-medium disabled:opacity-40"
                >
                  +10
                </button>
                <button
                  onClick={() => adjustStock(product.id, product.stock, -10)}
                  disabled={saving || product.stock <= 0}
                  className="px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-sm font-medium disabled:opacity-40"
                >
                  −10
                </button>
                <button
                  onClick={() => openEditForm(product)}
                  className="ml-auto px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium"
                >
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 py-10">
          {products.length === 0 ? 'Walang products' : 'Walang nahanap'}
        </p>
      )}

      {/* Add / Edit Product Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-800">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>

            <input
              type="text"
              placeholder="Product Name *"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full p-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <input
              type="number"
              placeholder="Price *"
              value={formPrice}
              onChange={(e) => setFormPrice(e.target.value)}
              className="w-full p-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <div>
              <label className="text-sm text-gray-500 mb-1 block">Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full p-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {!editingProduct && (
              <input
                type="number"
                placeholder="Starting Stock"
                value={formStock}
                onChange={(e) => setFormStock(e.target.value)}
                className="w-full p-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            )}

            <input
              type="number"
              placeholder="Low Stock Alert Level"
              value={formLowStock}
              onChange={(e) => setFormLowStock(e.target.value)}
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
                onClick={saveProduct}
                disabled={saving}
                className="flex-1 py-3 bg-green-600 text-white rounded-2xl font-medium disabled:bg-gray-400"
              >
                {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Save Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
