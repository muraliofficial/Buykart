import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../components/common/Toast';
import MaterialIcon from '../../components/common/MaterialIcon';

const RiderManagement = () => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRider, setEditingRider] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    bikeNumber: '',
    rcNumber: '',
    licenseNumber: '',
    status: 'Active'
  });
  const [submitting, setSubmitting] = useState(false);

  const { showSuccess, showError } = useToast();

  const fetchRiders = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/admin/riders');
      setRiders(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setRiders([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  const handleOpenCreate = () => {
    setEditingRider(null);
    setFormData({
      name: '',
      mobile: '',
      bikeNumber: '',
      rcNumber: '',
      licenseNumber: '',
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rider) => {
    setEditingRider(rider);
    setFormData({
      name: rider.name || '',
      mobile: rider.mobile || '',
      bikeNumber: rider.bikeNumber || '',
      rcNumber: rider.rcNumber || '',
      licenseNumber: rider.licenseNumber || '',
      status: rider.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanMobile = String(formData.mobile || '').trim();
    if (!formData.name.trim() || !cleanMobile) {
      showError('Rider name and mobile number are required.');
      return;
    }

    const duplicate = riders.find((r) => r.mobile === cleanMobile && r.id !== editingRider?.id);
    if (duplicate) {
      showError('A rider with this mobile number already exists.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = { ...formData, mobile: cleanMobile };
      if (editingRider) {
        await axios.put(`/admin/riders/${editingRider.id}`, payload);
        showSuccess('Rider updated successfully.');
      } else {
        await axios.post('/admin/riders', payload);
        showSuccess('Rider registered successfully.');
      }

      setIsModalOpen(false);
      fetchRiders();
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || 'Failed to save rider.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRiders = riders.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      (r.name || '').toLowerCase().includes(q) ||
      (r.mobile || '').toLowerCase().includes(q) ||
      (r.bikeNumber || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Delivery Fleet
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            Manage delivery riders, vehicles, and active status
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
        >
          <MaterialIcon name="person_add" size={16} />
          <span>Add Rider</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="relative w-full sm:w-80 flex items-center">
            <div className="absolute left-3.5 text-slate-400">
              <MaterialIcon name="search" size={18} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, phone, bike..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Total Fleet: <span className="text-slate-900 font-bold">{riders.length}</span>
          </div>
        </div>

        {/* Riders Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Rider</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Vehicle</th>
                  <th className="py-3.5 px-4">License & RC</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-emerald-600 border-t-transparent mb-2"></div>
                      <p className="font-medium">Loading riders...</p>
                    </td>
                  </tr>
                ) : filteredRiders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-14 text-center text-slate-400 font-medium">
                      No rider records found.
                    </td>
                  </tr>
                ) : (
                  filteredRiders.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
                            {r.name ? r.name.charAt(0).toUpperCase() : 'R'}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">{r.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono">#{r.id?.substring(0, 6).toUpperCase()}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        +91 {r.mobile}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {r.bikeNumber || 'None'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                        <div>DL: {r.licenseNumber || '—'}</div>
                        <div>RC: {r.rcNumber || '—'}</div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {r.status?.toLowerCase() === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[11px] font-semibold border border-emerald-200/60">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[11px] font-semibold">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleOpenEdit(r)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition inline-flex items-center gap-1"
                        >
                          <MaterialIcon name="edit" size={14} />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT RIDER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {editingRider ? 'Edit Rider' : 'Add New Rider'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <MaterialIcon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="10-digit mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bike Number</label>
                  <input
                    type="text"
                    placeholder="TN 33 AB 1234"
                    value={formData.bikeNumber}
                    onChange={(e) => setFormData({ ...formData, bikeNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Driving License</label>
                  <input
                    type="text"
                    placeholder="DL number"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">RC Number</label>
                  <input
                    type="text"
                    placeholder="RC number"
                    value={formData.rcNumber}
                    onChange={(e) => setFormData({ ...formData, rcNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-2xs transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingRider ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderManagement;
