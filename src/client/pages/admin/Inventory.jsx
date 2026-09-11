import React, { useState, useEffect, useRef } from 'react';
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

/**
 * Compresses an image file on an HTML5 canvas before encoding as base64.
 * Downscales images exceeding 1200px and optimizes quality to ~250KB.
 */
const compressImage = (file, maxDimension = 1200, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    if (!file.type || !file.type.startsWith('image/')) {
      return reject(new Error('Please select an image file (PNG, JPG, WEBP).'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image data.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(e.target.result);
        }

        ctx.drawImage(img, 0, 0, width, height);
        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(mimeType, quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { showSuccess, showError, confirm } = useToast();
  const fileInputRef = useRef(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    category: 'Fruits',
    itemName: '',
    unit: 'Kgs',
    price: '',
    op_stock: '',
    description: '',
  });
  const [imageBase64, setImageBase64] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

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
    setImageBase64(null);
    setImagePreview(null);
    setRemoveCurrentImage(false);
    setImageLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
    setImageBase64(null);
    setImagePreview(hasProductImage(item) ? getProductImageUrl(item) : null);
    setRemoveCurrentImage(false);
    setImageLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsModalOpen(true);
  };

  const processFile = async (file) => {
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      showError('Image size exceeds 15MB limit.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setImageLoading(true);
    try {
      const compressedDataUrl = await compressImage(file);
      setImageBase64(compressedDataUrl);
      setImagePreview(compressedDataUrl);
      setRemoveCurrentImage(false);
    } catch (err) {
      console.error('Error reading/compressing image:', err);
      showError(err.message || 'Failed to process selected image.');
    } finally {
      setImageLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemoveImage = () => {
    setImageBase64(null);
    setImagePreview(null);
    setRemoveCurrentImage(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
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
    try {
      const payload = {
        category: formData.category,
        itemName: formData.itemName.trim(),
        unit: formData.unit,
        price: Number(formData.price),
        op_stock: Number(formData.op_stock),
        description: formData.description.trim(),
        imageBase64: imageBase64 || undefined,
        removeImage: removeCurrentImage,
      };

      if (editingItem) {
        await axios.put(`/admin/inventory/${editingItem.id}`, payload);
        showSuccess('Product updated successfully.');
      } else {
        await axios.post('/admin/inventory', payload);
        showSuccess('Product created successfully.');
      }

      setIsModalOpen(false);
      fetchInventory();
    } catch (err) {
      console.error('Error saving inventory product:', err);
      showError(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (itemId, itemName) => {
    confirm({
      title: 'Delete Product',
      message: `Are you sure you want to delete "${itemName}"? This cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDanger: true,
      onConfirm: async () => {
        try {
          await axios.delete(`/admin/inventory/${itemId}`);
          showSuccess(`"${itemName}" deleted.`);
          fetchInventory();
        } catch (err) {
          console.error('Error deleting inventory item:', err);
          showError(err.response?.data?.message || 'Failed to delete product.');
        }
      },
    });
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      (item.itemName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Inventory
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            Manage catalog products, stock levels, and pricing
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl font-semibold text-xs transition shadow-2xs cursor-pointer"
        >
          <MaterialIcon name="add" size={18} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Controls Bar: Search & Category Filter */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="relative w-full lg:w-80 flex items-center">
          <div className="absolute left-3.5 pointer-events-none text-slate-400">
            <MaterialIcon name="search" size={18} />
          </div>
          <input
            type="text"
            placeholder="Search items by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <MaterialIcon name="close" size={15} />
            </button>
          )}
        </div>

        <div className="flex gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-2xs'
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
          <div className="py-20 text-center space-y-2">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-emerald-600 border-t-transparent"></div>
            <p className="text-slate-500 font-medium text-xs">Loading items...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredItems.map((item) => {
              const stockNum = Number(item.op_stock || 0);
              const isLowStock = stockNum > 0 && stockNum <= 5;
              const isOutOfStock = stockNum <= 0;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-sm transition flex flex-col group"
                >
                  {/* Product Image */}
                  <div className="relative h-44 bg-slate-50 overflow-hidden">
                    <img
                      src={getProductImageUrl(item, 'jpg_300')}
                      alt={item.itemName || 'Product'}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_PRODUCT_IMAGE;
                      }}
                    />
                    <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                      {item.category || 'General'}
                    </div>

                    {isOutOfStock && (
                      <div className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        Out of Stock
                      </div>
                    )}
                    {isLowStock && (
                      <div className="absolute top-2.5 left-2.5 bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        Low Stock ({stockNum})
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-grow space-y-2">
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1" title={item.itemName}>
                      {item.itemName}
                    </h3>
                    <div className="flex justify-between items-center text-xs text-slate-600">
                      <span>
                        Price: <strong className="text-slate-900 font-bold">₹{item.price}</strong> / {item.unit}
                      </span>
                      <span>
                        Stock:{' '}
                        <strong
                          className={
                            isOutOfStock
                              ? 'text-rose-600 font-bold'
                              : isLowStock
                              ? 'text-amber-600 font-bold'
                              : 'text-emerald-700 font-bold'
                          }
                        >
                          {item.op_stock} {item.unit}
                        </strong>
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {item.description}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="pt-2.5 mt-auto border-t border-slate-100 flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition"
                      >
                        <MaterialIcon name="edit" size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.itemName)}
                        className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition"
                      >
                        <MaterialIcon name="delete" size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90 space-y-2 max-w-sm mx-auto">
            <MaterialIcon name="inventory_2" size={32} className="text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-700">No products found</h3>
            <p className="text-xs text-slate-400">Click "Add Product" to add items to your catalog.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Inventory Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5 border border-slate-100 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {editingItem ? 'Edit Product' : 'Add Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                aria-label="Close modal"
              >
                <MaterialIcon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh Red Apples"
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unit <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  >
                    {UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="1"
                    placeholder="120"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Opening Stock <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="50"
                    value={formData.op_stock}
                    onChange={(e) => setFormData({ ...formData, op_stock: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional brief product description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white resize-none"
                ></textarea>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-slate-700">
                    Product Image (Optional)
                  </label>
                  {imageLoading && (
                    <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                      <span className="inline-block animate-spin rounded-full h-2.5 w-2.5 border-2 border-emerald-600 border-t-transparent"></span>
                      Optimizing image...
                    </span>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  onChange={handleImageChange}
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 h-40 bg-slate-900/5 group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-contain bg-slate-950/5"
                    />
                    <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={imageLoading || saving}
                        className="bg-white/95 hover:bg-white text-slate-800 px-3 py-1.5 rounded-lg shadow-sm transition text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <MaterialIcon name="edit" size={14} /> Replace
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={imageLoading || saving}
                        className="bg-rose-600/90 hover:bg-rose-600 text-white px-3 py-1.5 rounded-lg shadow-sm transition text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <MaterialIcon name="delete" size={14} /> Remove
                      </button>
                    </div>

                    {/* Always visible action buttons in bottom corner */}
                    <div className="absolute bottom-2 right-2 flex gap-1.5 group-hover:hidden">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white/90 hover:bg-white text-slate-700 p-1.5 rounded-lg shadow-xs transition"
                        title="Replace Image"
                      >
                        <MaterialIcon name="edit" size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="bg-rose-50 text-rose-600 p-1.5 rounded-lg shadow-xs transition"
                        title="Remove Image"
                      >
                        <MaterialIcon name="delete" size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer transition ${
                      isDraggingOver
                        ? 'border-emerald-600 bg-emerald-50/50 scale-[0.99]'
                        : 'border-slate-200 hover:border-emerald-600 bg-slate-50 hover:bg-emerald-50/20'
                    }`}
                  >
                    <div className="text-center space-y-1 p-3">
                      <MaterialIcon
                        name="cloud_upload"
                        size={28}
                        className={isDraggingOver ? 'text-emerald-600' : 'text-slate-400'}
                      />
                      <p className="text-xs font-semibold text-slate-700">
                        {isDraggingOver ? 'Drop image here' : 'Click or drop product image'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        PNG, JPG, WEBP (auto-optimized before upload)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || imageLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {imageLoading ? (
                    'Processing Image...'
                  ) : saving ? (
                    'Uploading to Cloudinary...'
                  ) : editingItem ? (
                    'Update'
                  ) : (
                    'Save'
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
