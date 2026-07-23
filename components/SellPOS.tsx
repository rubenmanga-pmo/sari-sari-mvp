'use client';

import { useState } from 'react';

const sampleProducts = [
  { id: 1, name: 'Coke 500ml', price: 25, category: 'Drinks' },
  { id: 2, name: 'Sprite 500ml', price: 25, category: 'Drinks' },
  { id: 3, name: 'Lucky Me Pancit Canton', price: 12, category: 'Noodles' },
  { id: 4, name: 'Lucky Me Instant Mami', price: 10, category: 'Noodles' },
  { id: 5, name: 'Cigarettes (per stick)', price: 8, category: 'Others' },
  { id: 6, name: 'Bear Brand Sterilized', price: 18, category: 'Drinks' },
  { id: 7, name: 'Chippy', price: 12, category: 'Snacks' },
  { id: 8, name: 'Nova', price: 12, category: 'Snacks' },
  { id: 9, name: 'Kopiko Brown', price: 8, category: 'Drinks' },
  { id: 10, name: 'Nescafe Classic', price: 8, category: 'Drinks' },
];

export default function SellPOS() {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<{ id: number; name: string; price: number; quantity: number }[]>([]);

  const filteredProducts = sampleProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product: typeof sampleProducts[0]) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
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

  const clearCart = () => setCart([]);

  return (
    <div className="space-y-5 pb-28">
      <input
        type="text"
        placeholder="Hanapin ang produkto..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-4 text-base border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500"
      />

      <div className="grid grid-cols-2 gap-3">
        {filteredProducts.map((product) => (
          <button
            key={product.id}
            onClick={() => addToCart(product)}
            className="bg-white border-2 border-gray-100 hover:border-green-400 active:scale-95 rounded-2xl p-4 text-left transition-all shadow-sm"
          >
            <div className="font-medium text-sm leading-tight">{product.name}</div>
            <div className="text-green-600 font-bold mt-1">₱{product.price}</div>
          </button>
        ))}
      </div>

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

          <div className="border-t pt-3 flex justify-between items-center font-bold text-lg">
            <span>Total</span>
            <span className="text-green-600">₱{total}</span>
          </div>
        </div>
      )}

      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto flex gap-3">
          <button
            onClick={() => {
              alert(`Cash Sale recorded!\nTotal: ₱${total}`);
              clearCart();
            }}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-semibold active:scale-95 transition-all"
          >
            Cash Sale
          </button>
          <button
            onClick={() => {
              alert(`Credit Sale recorded!\nTotal: ₱${total}`);
              clearCart();
            }}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-2xl font-semibold active:scale-95 transition-all"
          >
            Credit Sale
          </button>
        </div>
      )}
    </div>
  );
}
