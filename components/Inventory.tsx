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

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = products.filter((p) => p.stock <= p.lowStock).length;

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
              <div className="flex justify-between items-start">
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
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 py-10">
          {products.length === 0 ? 'Walang products sa Google Sheet' : 'Walang nahanap'}
        </p>
      )}
    </div>
  );
}
