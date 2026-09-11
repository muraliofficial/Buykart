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

    // Check duplicate mobile locally
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
        showSuccess('Rider details updated successfully!');
      } else {
        await axios.post('/admin/riders', payload);
        showSuccess('New delivery rider registered successfully!');
      }
      setSubmitting(false);
      setIsModalOpen(false);
      fetchRiders();
    } catch (err) {
      setSubmitting(false);
      showError(err.response?.data?.message || 'Failed to save rider');
    }
  };

  const filteredRiders = riders.filter((r) =>
    (r.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.mobile || '').includes(searchTerm) ||
    (r.bikeNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shadow-xs">
              <MaterialIcon name="two_wheeler" size={24} />
            </div>
            <span>Rider Fleet & Logistics</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
            Manage delivery personnel profiles, vehicles, active credentials, and authorization status
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 transition shadow-md cursor-pointer"
        >
          <MaterialIcon name="person_add" size={16} />
          <span>Register New Rider</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="relative w-full sm:w-80 flex items-center">
            <div className="absolute left-3.5 text-slate-400">
              <MaterialIcon name="search" size={20} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search rider by name, phone, bike..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D4715]"
            />
          </div>

          <div className="text-xs text-slate-500 font-bold">
            Total Active Fleet: <span className="text-slate-900 font-black">{riders.length}</span>
          </div>
        </div>

        {/* Riders Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Rider Details</th>
                  <th className="p-4">Mobile</th>
                  <th className="p-4">Vehicle Details</th>
                  <th className="p-4">License & RC</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-14 text-center text-slate-400">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#0D4715] border-t-transparent mb-2"></div>
                      <p className="font-bold">Loading fleet riders...</p>
                    </td>
                  </tr>
                ) : filteredRiders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-14 text-center text-slate-400 font-bold">
                      No rider records found. Click "Register New Rider" to add delivery partners.
                    </td>
                  </tr>
                ) : (
                  filteredRiders.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-black text-xs shadow-xs">
                            {r.name ? r.name.charAt(0).toUpperCase() : 'R'}
                          </div>
                          <div>
                            <span className="font-black text-slate-900 text-sm block">{r.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">ID: #{r.id?.substring(0, 6).toUpperCase()}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <MaterialIcon name="call" size={15} className="text-emerald-600" />
                          <span>+91 {r.mobile}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-slate-800">{r.bikeNumber || 'No bike listed'}</span>
                      </td>

                      <td className="p-4">
                        <div className="space-y-0.5 text-[11px]">
                          <p><strong className="text-slate-400">DL:</strong> {r.licenseNumber || 'N/A'}</p>
                          <p><strong className="text-slate-400">RC:</strong> {r.rcNumber || 'N/A'}</p>
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        {r.status?.toLowerCase() === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black">
                            <MaterialIcon name="check_circle" size={12} filled /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full text-[10px] font-black">
                            <MaterialIcon name="cancel" size={12} filled /> Inactive
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleOpenEdit(r)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-xl transition flex items-center gap-1 mx-auto cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <MaterialIcon name="two_wheeler" size={20} className="text-amber-500" />
                {editingRider ? 'Edit Rider Information' : 'Register New Fleet Rider'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <MaterialIcon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D4715]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number (Used for Login OTP) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="10-digit mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D4715]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Bike Number</label>
                  <input
                    type="text"
                    placeholder="TN 33 AB 1234"
                    value={formData.bikeNumber}
                    onChange={(e) => setFormData({ ...formData, bikeNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Driving License</label>
                  <input
                    type="text"
                    placeholder="DL number"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">RC Book No</label>
                  <input
                    type="text"
                    placeholder="RC number"
                    value={formData.rcNumber}
                    onChange={(e) => setFormData({ ...formData, rcNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingRider ? 'Update Rider' : 'Register Rider'}
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
