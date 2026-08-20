import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ShoppingCart, RefreshCw, Sparkles, Filter, ArrowUpDown } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import ProductModal from '../../components/ProductModal';

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
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Hero Header Banner */}
      <section className="bg-gradient-to-r from-[#0D4715] to-[#41644A] text-white py-12 px-4 sm:px-6 lg:px-8 mb-10 shadow-md">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-[#EBF4DD]">
            <Sparkles className="w-4 h-4 text-[#E9762B]" />
            <span>Farm-Fresh Groceries Delivered Fast</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Welcome to <span className="text-[#E9762B]">Buykart</span>
          </h1>
          <p className="text-gray-200 text-sm sm:text-base max-w-2xl mx-auto">
            Discover hand-picked fruits, organic vegetables, and daily household essentials delivered straight to your door.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto pt-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search fresh items, fruits, vegetables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white text-gray-900 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-[#E9762B]/50 transition text-sm font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600 bg-gray-100 px-2 py-1 rounded-md cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Filters Header & Sort Control */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#0D4715]" />
            <h2 className="text-xl font-bold text-gray-800">Categories</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#0D4715] text-white shadow-md scale-105'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 shadow-xs">
              <ArrowUpDown className="w-4 h-4 text-[#0D4715]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer"
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
              <div key={n} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-4 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-xl"></div>
                <div className="h-5 bg-gray-200 rounded-md w-3/4"></div>
                <div className="h-4 bg-gray-100 rounded-md w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded-xl w-full"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center space-y-3 my-8">
            <p className="font-bold">{error}</p>
            <button
              onClick={fetchProducts}
              className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-red-700 transition"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
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
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 shadow-xs">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-700">No products found</h3>
                <p className="text-gray-500 text-sm mt-1">Try adjusting your search query or selected category filter.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                    setSortBy('default');
                  }}
                  className="mt-4 bg-[#0D4715] text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-[#41644A] transition"
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
