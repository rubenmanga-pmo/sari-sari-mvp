'use client';

import { useState } from 'react';

const initialProducts = [
  { id: 1, name: 'Coke 500ml', price: 25, stock: 48, category: 'Drinks', lowStock: 10 },
  { id: 2, name: 'Sprite 500ml', price: 25, stock: 32, category: 'Drinks', lowStock: 10 },
  { id: 3, name: 'Lucky Me Pancit Canton', price: 12, stock: 85, category: 'Noodles', lowStock: 20 },
  { id: 4, name: 'Lucky Me Instant Mami', price: 10, stock: 60, category: 'Noodles', lowStock: 20 },
  { id: 5, name: 'Cigarettes (per stick)', price: 8, stock: 120, category: 'Others', lowStock: 30 },
  { id: 6, name: 'Bear Brand Sterilized', price: 18, stock: 25, category: 'Drinks', lowStock: 10 },
  { id: 7, name: 'Chippy', price: 12, stock: 40, category: 'Snacks', lowStock: 15 },
  { id: 8, name: 'Nova', price: 12, stock: 18, category: 'Snacks', lowStock: 15 },
  { id: 9, name: 'Kopiko Brown', price: 8, stock: 55, category: 'Drinks', lowStock: 15 },
  { id: 10, name: 'Nescafe Classic', price: 8, stock: 7, category: 'Drinks', lowStock: 15 },
];

export default function Inventory() {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const updateStock = (id: number, delta: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p
      )
    );
  };

  const lowStockCount = products.filter((p) => p.stock <= p.lowStock).length;

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
              <div className="flex justify-between items-start mb-2">
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

              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={() => updateStock(product.id, -1)}
                  className="w-10 h-10 rounded-full bg-gray-100 text-xl font-bold"
                >
                  −
                </button>
                <button
                  onClick={() => updateStock(product.id, 1)}
                  className="w-10 h-10 rounded-full bg-gray-100 text-xl font-bold"
                >
                  +
                </button>
                <button
                  onClick={() => updateStock(product.id, 10)}
                  className="ml-auto px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-medium"
                >
                  +10
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 py-10">Walang nahanap</p>
      )}
    </div>
  );
}
