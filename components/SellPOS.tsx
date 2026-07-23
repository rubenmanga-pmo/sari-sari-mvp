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

  const recordSale = async (type: 'cash' | 'credit') => {
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
        // Refresh products to update stock
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
    <div className="space-y-5 pb-28">
      {/* Search */}
      <input
        type="text"
        placeholder="Hanapin ang produkto..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-4 text-base border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500"
      />

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-green-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600'
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
            className={`bg-white border-2 rounded-2xl p-4 text-left transition-all shadow-sm ${
              product.stock <= 0
                ? 'border-gray-200 opacity-50 cursor-not-allowed'
                : 'border-gray-100 hover:border-green-400 active:scale-95'
            }`}
          >
            <div className="font-medium text-sm leading-tight">{product.name}</div>
            <div className="text-green-600 font-bold mt-1">₱{product.price}</div>
            <div className="text-xs text-gray-400 mt-1">Stock: {product.stock}</div>
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <p className="text-center text-gray-400 py-8">Walang nahanap na produkto</p>
      )}

      {/* Cart */}
      {cart.length > 0 && (
        <div className="bg-white rounded-2xl shadow border p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Cart ({cart.length} items)</h3>
            <button onClick={clearCart} className="text-sm text-red-500">
              Clear
            </button>
          </div>

          {cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <div className="text-sm font-medium">{item.name}</div>
                <div className="text-xs text-gray-500">₱{item.price} each</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="w-8 h-8 rounded-full bg-gray-100 text-lg font-bold"
                >
                  −
                </button>
                <span className="w-6 text-center font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="w-8 h-8 rounded-full bg-gray-100 text-lg font-bold"
                >
                  +
                </button>
              </div>

              <div className="w-16 text-right font-semibold">
                ₱{item.price * item.quantity}
              </div>
            </div>
          ))}

          {/* Customer name for credit */}
          <input
            type="text"
            placeholder="Customer name (for Credit sale)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl text-sm"
          />

          <div className="border-t pt-3 flex justify-between items-center font-bold text-lg">
            <span>Total</span>
            <span className="text-green-600">₱{total}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto flex gap-3">
          <button
            onClick={() => recordSale('cash')}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-4 rounded-2xl font-semibold active:scale-95 transition-all"
          >
            {loading ? 'Saving...' : 'Cash Sale'}
          </button>
          <button
            onClick={() => recordSale('credit')}
            disabled={loading}
            className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white py-4 rounded-2xl font-semibold active:scale-95 transition-all"
          >
            {loading ? 'Saving...' : 'Credit Sale'}
          </button>
        </div>
      )}
    </div>
  );
}
