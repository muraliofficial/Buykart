import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Plus, Edit2, Trash2, Search, X, Upload, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { getProductImageUrl } from '../../utils/imageHelper';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null if creating
  const [formData, setFormData] = useState({
    category: 'Fruits',
    itemName: '',
    unit: 'Kgs',
    price: '',
    op_stock: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null); // { type: 'success'|'error', message: '' }

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/admin/inventory');
      setItems(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      showAlert('error', 'Failed to fetch inventory.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      category: 'Fruits',
      itemName: '',
      unit: 'Kgs',
      price: '',
      op_stock: '',
      description: '',
    });
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      category: item.category || 'Fruits',
      itemName: item.itemName || '',
      unit: item.unit || 'Kgs',
      price: item.price || '',
      op_stock: item.op_stock || '',
      description: item.description || '',
    });
    setImageFile(null);
    setImagePreview(getProductImageUrl(item));
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingItem && !imageFile) {
      showAlert('error', 'Please upload an image for the new inventory item.');
      return;
    }

    setSaving(true);
    const data = new FormData();
    data.append('category', formData.category);
    data.append('itemName', formData.itemName);
    data.append('unit', formData.unit);
    data.append('price', formData.price);
    data.append('op_stock', formData.op_stock);
    data.append('description', formData.description);

    if (imageFile) {
      data.append('inventoryImage', imageFile);
    }

    try {
      if (editingItem) {
        await axios.put(`/admin/inventory/${editingItem.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showAlert('success', 'Inventory updated successfully!');
      } else {
        await axios.post('/admin/inventory', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showAlert('success', 'Inventory added successfully!');
      }

      setIsModalOpen(false);
      fetchInventory();
    } catch (err) {
      console.error('Error saving inventory:', err);
      showAlert('error', err.response?.data?.message || 'Failed to save inventory item.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inventory item?')) {
      return;
    }

    try {
      await axios.delete(`/admin/inventory/${id}`);
      showAlert('success', 'Item deleted successfully.');
      fetchInventory();
    } catch (err) {
      console.error('Error deleting item:', err);
      showAlert('error', err.response?.data?.message || 'Failed to delete item.');
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <Package className="w-8 h-8 text-[#0D4715]" />
            Inventory Manager
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage products, stock availability, pricing, and images</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-[#0D4715] hover:bg-[#41644A] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Alert Notification */}
      {alert && (
        <div className="max-w-7xl mx-auto">
          <div
            className={`p-4 rounded-2xl border flex items-center gap-3 shadow-sm ${
              alert.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {alert.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <p className="font-bold text-sm">{alert.message}</p>
          </div>
        </div>
      )}

      {/* Controls Bar: Search & Category Filter */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search inventory items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D4715] transition"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
          {['All', 'Fruits', 'Vegetables'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat ? 'bg-[#0D4715] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Grid / Table */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#0D4715] animate-spin mx-auto" />
            <p className="text-slate-500 font-semibold text-sm">Loading inventory items...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const stockNum = Number(item.op_stock || 0);
              const isLowStock = stockNum > 0 && stockNum <= 5;
              const isOutOfStock = stockNum <= 0;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col group"
                >
                  {/* Product Image */}
                  <div className="relative h-44 bg-slate-50 overflow-hidden">
                    <img
                      src={getProductImageUrl(item)}
                      alt={item.itemName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=500&q=80';
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                      {item.category || 'Grocery'}
                    </div>

                    {isOutOfStock && (
                      <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-xs">
                        Out of Stock
                      </div>
                    )}
                    {isLowStock && (
                      <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-xs animate-pulse">
                        Low Stock ({stockNum})
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-grow space-y-2">
                    <h3 className="font-bold text-slate-900 text-base line-clamp-1">{item.itemName}</h3>
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                      <span>Price: <strong className="text-[#0D4715] text-sm">₹{item.price}</strong> / {item.unit}</span>
                      <span>Stock: <strong className={isOutOfStock ? 'text-red-600 font-extrabold' : isLowStock ? 'text-amber-600 font-extrabold' : 'text-slate-800'}>{item.op_stock}</strong></span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{item.description || 'No description provided.'}</p>

                  {/* Actions */}
                  <div className="pt-3 mt-auto border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 px-3 py-1.5 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No inventory items found</h3>
            <p className="text-xs text-slate-400">Click "Add New Product" above to create an inventory item.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Inventory Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-lg font-extrabold text-slate-900">
                {editingItem ? 'Edit Product Item' : 'Add New Product Item'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Product Image
                </label>
                <label className="border-2 border-dashed border-slate-200 hover:border-[#0D4715] rounded-2xl h-36 flex flex-col items-center justify-center cursor-pointer transition overflow-hidden relative group">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center space-y-1 p-4">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-600">Click to upload product image</p>
                      <p className="text-[10px] text-slate-400">PNG, JPG, WEBP up to 5MB</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0D4715]"
                  >
                    <option value="Fruits">Fruits</option>
                    <option value="Vegetables">Vegetables</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0D4715]"
                  >
                    <option value="Kgs">Kgs</option>
                    <option value="Pcs">Pcs</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh Red Apples"
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0D4715]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="120"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0D4715]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Opening Stock</label>
                  <input
                    type="number"
                    required
                    placeholder="50"
                    value={formData.op_stock}
                    onChange={(e) => setFormData({ ...formData, op_stock: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0D4715]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Fresh organic apples sourced from local orchards..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0D4715] resize-none"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#0D4715] text-white rounded-xl text-xs font-bold hover:bg-[#41644A] transition shadow-md cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingItem ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
