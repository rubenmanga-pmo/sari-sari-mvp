'use client';

import { useState } from 'react';

export default function SellPOS() {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<any[]>([]);

  const sampleProducts = [
    { id: 1, name: 'Coke 500ml', price: 25 },
    { id: 2, name: 'Lucky Me Noodles', price: 12 },
    { id: 3, name: 'Cigarettes', price: 8 },
    { id: 4, name: 'Bear Brand', price: 18 },
  ];

  const filteredProducts = sampleProducts.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product: any) => {
    setCart([...cart, { ...product, quantity: 1 }]);
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="space-y-6">
      <input
        type="text"
        placeholder="Hanapin ang produkto..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500"
      />

      <div className="grid grid-cols-2 gap-3">
        {filteredProducts.map((p) => (
          <button
            key={p.id}
            onClick={() => addToCart(p)}
            className="h-24 bg-white border-2 border-gray-200 hover:border-green-500 rounded-2xl p-4 text-left active:scale-95 transition-all"
          >
            <div className="font-medium">{p.name}</div>
            <div className="text-green-600 font-bold">₱{p.price}</div>
          </button>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="bg-white p-5 rounded-2xl shadow border">
          <h3 className="font-semibold mb-3">Cart ({cart.length})</h3>
          {cart.map((item, i) => (
            <div key={i} className="flex justify-between py-1">
              <span>{item.name}</span>
              <span>₱{item.price}</span>
            </div>
          ))}
          <div className="border-t pt-3 mt-3 font-bold flex justify-between">
            <span>Total</span>
            <span>₱{total}</span>
          </div>
        </div>
      )}

      <div className="flex gap-3 fixed bottom-4 left-4 right-4 max-w-md mx-auto">
        <button 
          onClick={() => alert('Cash Sale Recorded!')}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-semibold active:scale-95 transition-all"
        >
          Cash Sale
        </button>
        <button 
          onClick={() => alert('Credit Sale Recorded!')}
          className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-4 rounded-2xl font-semibold active:scale-95 transition-all"
        >
          Credit Sale
        </button>
      </div>
    </div>
  );
}
