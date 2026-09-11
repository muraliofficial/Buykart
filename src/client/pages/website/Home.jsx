import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../../components/ProductCard';
import ProductModal from '../../components/ProductModal';
import MaterialIcon from '../../components/common/MaterialIcon';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [activeProduct, setActiveProduct] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/website/products');
      const data = response.data;
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
        if (data && data.message) {
          setError(data.message);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to load products. Please check server connection.');
      setProducts([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const safeProducts = Array.isArray(products) ? products.map((p) => ({
    ...p,
    category: p.category === 'Vegitables' ? 'Vegetables' : p.category
  })) : [];

  // Extract unique categories
  const categories = ['All', ...new Set(safeProducts.map((p) => p.category).filter(Boolean))];

  // Helper to parse numerical price
  const parseCleanPrice = (val) => parseFloat(String(val || 0).replace(/[^0-9.]/g, '')) || 0;

  // Filter products by search and category
  let filteredProducts = safeProducts.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const nameStr = (p.itemName || '').toLowerCase();
    const descStr = (p.description || '').toLowerCase();
    const queryStr = searchQuery.toLowerCase();
    const matchesSearch = nameStr.includes(queryStr) || descStr.includes(queryStr);
    return matchesCategory && matchesSearch;
  });

  // Sort products
  if (sortBy === 'price-low') {
    filteredProducts.sort((a, b) => parseCleanPrice(a.price) - parseCleanPrice(b.price));
  } else if (sortBy === 'price-high') {
    filteredProducts.sort((a, b) => parseCleanPrice(b.price) - parseCleanPrice(a.price));
  } else if (sortBy === 'name') {
    filteredProducts.sort((a, b) => (a.itemName || '').localeCompare(b.itemName || ''));
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Hero Header Banner */}
      <section className="bg-gradient-to-br from-[#0D4715] via-[#1b5e20] to-[#2e7d32] text-white py-14 sm:py-16 px-4 sm:px-6 lg:px-8 mb-10 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-emerald-100 border border-white/10 shadow-sm">
            <MaterialIcon name="verified" size={16} className="text-amber-400" filled />
            <span>Farm-Fresh Groceries & Daily Essentials</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Welcome to <span className="text-amber-400">Buykart</span>
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto font-medium">
            Hand-picked fresh produce, dairy, bakery, and pantry staples delivered straight to your doorstep.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto pt-4">
            <div className="relative flex items-center">
              <div className="absolute left-4 pointer-events-none flex items-center">
                <MaterialIcon name="search" size={22} className="text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search fresh items, fruits, vegetables, dairy..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-white text-slate-900 placeholder-slate-400 rounded-2xl shadow-xl focus:outline-none focus:ring-4 focus:ring-amber-400/40 transition text-sm font-semibold border border-emerald-800/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                  aria-label="Clear search"
                >
                  <MaterialIcon name="cancel" size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Filters Header & Sort Control */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <MaterialIcon name="category" size={22} className="text-[#0D4715]" />
            <h2 className="text-xl font-black text-slate-900">Explore Catalog</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#0D4715] text-white shadow-md shadow-emerald-900/20 scale-105'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 shadow-xs">
              <MaterialIcon name="swap_vert" size={18} className="text-[#0D4715]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer pr-1"
                aria-label="Sort products"
              >
                <option value="default">Sort: Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Skeleton Loading Grid */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-4 animate-pulse">
                <div className="w-full h-48 bg-slate-200 rounded-xl"></div>
                <div className="h-5 bg-slate-200 rounded-md w-3/4"></div>
                <div className="h-4 bg-slate-100 rounded-md w-1/2"></div>
                <div className="h-10 bg-slate-200 rounded-xl w-full"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl text-center space-y-3 my-8 max-w-lg mx-auto shadow-sm">
            <MaterialIcon name="error_outline" size={36} className="text-rose-600 mx-auto" />
            <p className="font-bold text-sm">{error}</p>
            <button
              onClick={fetchProducts}
              className="inline-flex items-center gap-2 bg-rose-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-rose-700 transition cursor-pointer shadow-md"
            >
              <MaterialIcon name="refresh" size={16} /> Try Again
            </button>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && (
          <>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onCardClick={(prod) => setActiveProduct(prod)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs max-w-md mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <MaterialIcon name="remove_shopping_cart" size={32} />
                </div>
                <h3 className="text-lg font-black text-slate-800">No products found</h3>
                <p className="text-slate-500 text-xs mt-1 font-medium">Try adjusting your search keywords or switching category filters.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                    setSortBy('default');
                  }}
                  className="mt-5 bg-[#0D4715] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#1b5e20] transition cursor-pointer shadow-md"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Quick View Product Modal */}
      {activeProduct && (
        <ProductModal
          product={activeProduct}
          onClose={() => setActiveProduct(null)}
        />
      )}
    </div>
  );
};

export default Home;
