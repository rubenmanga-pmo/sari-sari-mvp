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
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
        );
      } else {
        alert('Failed to update stock');
      }
    } catch (err) {
      console
