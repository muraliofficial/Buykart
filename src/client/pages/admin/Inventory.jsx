import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getProductImageUrl, hasProductImage, DEFAULT_PRODUCT_IMAGE } from '../../utils/imageHelper';
import { useToast } from '../../components/common/Toast';
import MaterialIcon from '../../components/common/MaterialIcon';

const CATEGORIES = [
  'All',
  'Fruits',
  'Vegetables',
  'Dairy & Eggs',
  'Bakery',
  'Pantry & Staples',
  'Snacks',
  'Beverages'
];

const UNITS = ['Kgs', 'Grams', 'Pcs', 'Pack', 'Litre', 'Ml', 'Dozen', 'Bunch'];

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { showSuccess, showError, confirm } = useToast();

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
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/admin/inventory');
      setItems(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      showError('Failed to fetch inventory from server.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

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
    setRemoveCurrentImage(false);
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
    setImagePreview(hasProductImage(item) ? getProductImageUrl(item) : null);
    setRemoveCurrentImage(false);
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setRemoveCurrentImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveCurrentImage(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.itemName.trim()) {
      showError('Item name is required.');
      return;
    }
    if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      showError('Please enter a valid positive price.');
      return;
    }
    if (isNaN(Number(formData.op_stock)) || Number(formData.op_stock) < 0) {
      showError('Opening stock must be 0 or greater.');
      return;
    }

    setSaving(true);
    const data = new FormData();
    data.append('category', formData.category);
    data.append('itemName', formData.itemName.trim());
    data.append('unit', formData.unit);
    data.append('price', formData.price);
    data.append('op_stock', formData.op_stock);
    data.append('description', formData.description.trim());

    // Optional image: only append if user actually selected a new file
    if (imageFile) {
      data.append('inventoryImage', imageFile);
    }

    // Flag to remove existing image during edit
    if (removeCurrentImage) {
      data.append('removeImage', 'true');
    }

    try {
      if (editingItem) {
        await axios.put(`/admin/inventory/${editingItem.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showSuccess('Inventory item updated successfully!');
      } else {
        await axios.post('/admin/inventory', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showSuccess('Inventory item added successfully!');
      }

      setIsModalOpen(false);
      fetchInventory();
    } catch (err) {
      console.error('Error saving inventory:', err);
      showError(err.response?.data?.message || 'Failed to save inventory item.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id, itemName) => {
    confirm({
      title: 'Delete Inventory Item',
      message: `Are you sure you want to permanently delete "${itemName || 'this product'}"? This action cannot be undone.`,
      confirmText: 'Delete Item',
      isDanger: true,
      onConfirm: async () => {
        try {
          await axios.delete(`/admin/inventory/${id}`);
          showSuccess('Product deleted successfully from inventory.');
          fetchInventory();
        } catch (err) {
          console.error('Error deleting item:', err);
          showError(err.response?.data?.message || 'Failed to delete product.');
        }
      },
    });
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      (item.itemName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#0D4715] flex items-center justify-center shadow-xs">
              <MaterialIcon name="inventory_2" size={24} />
            </div>
            <span>Inventory Management</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
            Manage product catalogue, stock levels, pricing, units, and images
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-[#0D4715] hover:bg-[#1b5e20] text-white px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm transition shadow-md hover:shadow-lg cursor-pointer"
        >
          <MaterialIcon name="add" size={18} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Controls Bar: Search & Category Filter */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full lg:w-96 flex items-center">
          <div className="absolute left-3.5 pointer-events-none text-slate-400">
            <MaterialIcon name="search" size={20} />
          </div>
          <input
            type="text"
            placeholder="Search items by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D4715] transition focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <MaterialIcon name="close" size={16} />
            </button>
          )}
        </div>

        <div className="flex gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#0D4715] text-white shadow-sm shadow-emerald-900/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#0D4715] border-t-transparent"></div>
            <p className="text-slate-500 font-bold text-xs">Loading inventory items...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const stockNum = Number(item.op_stock || 0);
              const isLowStock = stockNum > 0 && stockNum <= 5;
              const isOutOfStock = stockNum <= 0;
              const hasCustomImg = hasProductImage(item);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col group"
                >
                  {/* Product Image */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={getProductImageUrl(item)}
                      alt={item.itemName || 'Product'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_PRODUCT_IMAGE;
                      }}
                    />
                    <div className="absolute top-2.5 right-2.5 bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs">
                      {item.category || 'General'}
                    </div>

                    {!hasCustomImg && (
                      <div className="absolute bottom-2.5 left-2.5 bg-slate-900/70 backdrop-blur-md text-slate-200 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <MaterialIcon name="hide_image" size={12} /> Default Photo
                      </div>
                    )}

                    {isOutOfStock && (
                      <div className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                        Out of Stock
                      </div>
                    )}
                    {isLowStock && (
                      <div className="absolute top-2.5 left-2.5 bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs animate-pulse">
                        Low Stock ({stockNum})
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-grow space-y-2.5">
                    <h3 className="font-black text-slate-900 text-base line-clamp-1" title={item.itemName}>
                      {item.itemName}
                    </h3>
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                      <span>
                        Price: <strong className="text-[#0D4715] text-sm font-black">₹{item.price}</strong> / {item.unit}
                      </span>
                      <span>
                        Stock:{' '}
                        <strong
                          className={
                            isOutOfStock
                              ? 'text-rose-600 font-black'
                              : isLowStock
                              ? 'text-amber-600 font-black'
                              : 'text-emerald-700 font-black'
                          }
                        >
                          {item.op_stock} {item.unit}
                        </strong>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.description || 'No detailed description specified.'}
                    </p>

                    {/* Actions */}
                    <div className="pt-3 mt-auto border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition cursor-pointer"
                      >
                        <MaterialIcon name="edit" size={15} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.itemName)}
                        className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition cursor-pointer"
                      >
                        <MaterialIcon name="delete" size={15} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-14 text-center border border-slate-200/80 space-y-3 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
              <MaterialIcon name="inventory_2" size={32} />
            </div>
            <h3 className="text-base font-black text-slate-800">No inventory products found</h3>
            <p className="text-xs text-slate-500 font-medium">Click "Add New Product" above to create your first catalog entry.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Inventory Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-6 border border-slate-100 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#0D4715] flex items-center justify-center">
                  <MaterialIcon name={editingItem ? 'edit_note' : 'add_box'} size={22} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    {editingItem ? 'Edit Product Item' : 'Add New Product Item'}
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">Fill in details. Image upload is completely optional.</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                aria-label="Close modal"
              >
                <MaterialIcon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* SECTION 1: BASIC INFORMATION */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MaterialIcon name="info" size={14} className="text-[#0D4715]" />
                  Basic Information
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Item Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fresh Red Royal Apples"
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D4715] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0D4715] focus:bg-white cursor-pointer"
                    >
                      {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Selling Unit <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0D4715] focus:bg-white cursor-pointer"
                    >
                      {UNITS.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: PRICING & INVENTORY STOCK */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MaterialIcon name="payments" size={14} className="text-[#0D4715]" />
                  Pricing & Stock Availability
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Selling Price (₹) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-slate-400 font-bold text-xs">₹</span>
                      <input
                        type="number"
                        step="any"
                        required
                        min="1"
                        placeholder="120"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0D4715] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Opening Stock <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="50"
                      value={formData.op_stock}
                      onChange={(e) => setFormData({ ...formData, op_stock: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0D4715] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: DESCRIPTION */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MaterialIcon name="description" size={14} className="text-[#0D4715]" />
                  Product Story & Notes
                </h4>

                <div>
                  <textarea
                    rows={2}
                    placeholder="Freshly sourced, organic, hand-picked from farms..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0D4715] focus:bg-white resize-none"
                  ></textarea>
                </div>
              </div>

              {/* SECTION 4: PRODUCT IMAGE (OPTIONAL) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <MaterialIcon name="add_photo_alternate" size={14} className="text-[#0D4715]" />
                    Product Image
                  </label>
                  <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                    OPTIONAL
                  </span>
                </div>

                {imagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-40 bg-slate-50">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-xl shadow-lg transition flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                    >
                      <MaterialIcon name="delete" size={14} /> Remove Image
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-200 hover:border-[#0D4715] rounded-2xl h-32 flex flex-col items-center justify-center cursor-pointer transition overflow-hidden relative group bg-slate-50 hover:bg-emerald-50/20">
                    <div className="text-center space-y-1 p-3">
                      <MaterialIcon name="cloud_upload" size={28} className="text-slate-400 group-hover:text-[#0D4715]" />
                      <p className="text-xs font-bold text-slate-600 group-hover:text-[#0D4715]">
                        Click to select an image (Optional)
                      </p>
                      <p className="text-[10px] text-slate-400">PNG, JPG, WEBP — default image used if omitted</p>
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#0D4715] hover:bg-[#1b5e20] text-white rounded-xl text-xs font-black transition shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <MaterialIcon name="check" size={16} />
                      <span>{editingItem ? 'Update Product' : 'Save Product'}</span>
                    </>
                  )}
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
