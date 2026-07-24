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

const categories = ['All', 'Drinks', 'Noodles', 'Snacks', 'Others'];

export default function SellPOS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<{ id: number; name: string; price: number; quantity: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(console.error);
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const clearCart = () => {
    setCart([]);
    setCustomerName('');
  };

  const recordSale = async (type: 'cash' | 'gcash' | 'credit') => {
    if (cart.length === 0) return;
    if (type === 'credit' && !customerName.trim()) {
      alert('Please enter customer name for credit sale');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          type,
          customerName: type === 'credit' ? customerName : undefined,
        }),
      });

      if (res.ok) {
        alert(`${type === 'cash' ? 'Cash' : 'Credit'} Sale recorded!\nTotal: ₱${total}`);
        clearCart();
        const updated = await fetch('/api/products').then((r) => r.json());
        setProducts(updated);
      } else {
        alert('Failed to record sale. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Error recording sale');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Search */}
      <input
        type="text"
        placeholder="Hanapin ang produkto..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3.5 text-base bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
      />

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredProducts.map((product) => (
          <button
            key={product.id}
            onClick={() => addToCart(product)}
            disabled={product.stock <= 0}
            className={`bg-white rounded-2xl p-4 text-left shadow-sm border transition-all active:scale-95 ${
              product.stock <= 0
                ? 'opacity-50 cursor-not-allowed border-gray-100'
                : 'border-gray-100 hover:border-green-300'
            }`}
          >
            <div className="font-medium text-sm leading-tight text-gray-800">{product.name}</div>
            <div className="text-green-600 font-bold mt-1.5">₱{product.price}</div>
            <div className="text-xs text-gray-400 mt-1">Stock: {product.stock}</div>
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <p className="text-center text-gray-400 py-10">Walang nahanap na produkto</p>
      )}

      {/* Cart */}
      {cart.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Cart ({cart.length})</h3>
            <button onClick={clearCart} className="text-sm text-red-500 font-medium">
              Clear
            </button>
          </div>

          {cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate">{item.name}</div>
                <div className="text-xs text-gray-400">₱{item.price} each</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="w-8 h-8 rounded-full bg-gray-100 text-lg font-bold text-gray-600"
                >
                  −
                </button>
                <span className="w-6 text-center font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="w-8 h-8 rounded-full bg-gray-100 text-lg font-bold text-gray-600"
                >
                  +
                </button>
              </div>

              <div className="w-16 text-right font-semibold text-gray-800">
                ₱{item.price * item.quantity}
              </div>
            </div>
          ))}

          <input
            type="text"
            placeholder="Customer name (for Credit)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
            <span className="font-semibold text-gray-700">Total</span>
            <span className="text-xl font-bold text-green-600">₱{total}</span>
          </div>
        </div>
      )}

     {/* Action Buttons */}
{cart.length > 0 && (
  <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto flex gap-2 z-20">
    <button
      onClick={() => recordSale('cash')}
      disabled={loading}
      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3.5 rounded-2xl font-semibold text-sm shadow-lg active:scale-95 transition-all"
    >
      {loading ? '...' : 'Cash'}
    </button>
    <button
      onClick={() => recordSale('gcash')}
      disabled={loading}
      className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-3.5 rounded-2xl font-semibold text-sm shadow-lg active:scale-95 transition-all"
    >
      {loading ? '...' : 'GCash'}
    </button>
    <button
      onClick={() => recordSale('credit')}
      disabled={loading}
      className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white py-3.5 rounded-2xl font-semibold text-sm shadow-lg active:scale-95 transition-all"
    >
      {loading ? '...' : 'Credit'}
    </button>
  </div>
)}
    </div>
  );
}
