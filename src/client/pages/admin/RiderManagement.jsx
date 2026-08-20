import React, { useState, useEffect } from 'react';
import { Truck, Plus, Edit, Phone, ShieldCheck, CheckCircle, XCircle, Search, RefreshCw } from 'lucide-react';
import axios from 'axios';

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
  const [errorMsg, setErrorMsg] = useState('');

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
    setErrorMsg('');
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
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanMobile = String(formData.mobile || '').trim();
    if (!formData.name || !cleanMobile) {
      setErrorMsg('Rider name and mobile number are required');
      return;
    }

    // Check duplicate mobile locally
    const duplicate = riders.find(r => r.mobile === cleanMobile && r.id !== editingRider?.id);
    if (duplicate) {
      setErrorMsg('A rider with this mobile number already exists.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = { ...formData, mobile: cleanMobile };
      if (editingRider) {
        await axios.put(`/admin/riders/${editingRider.id}`, payload);
      } else {
        await axios.post('/admin/riders', payload);
      }
      setSubmitting(false);
      setIsModalOpen(false);
      fetchRiders();
    } catch (err) {
      setSubmitting(false);
      setErrorMsg(err.response?.data?.message || 'Failed to save rider');
    }
  };

  const filteredRiders = riders.filter(r => 
    r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.mobile?.includes(searchTerm) ||
    r.bikeNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <Truck className="w-8 h-8 text-amber-500" />
            Rider Master (Delivery Force)
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage delivery personnel, bike details, and account authorization</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Rider</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search rider by name, phone, or bike no..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white"
            />
          </div>

          <div className="text-xs text-slate-500 font-bold">
            Total Registered Riders: <span className="text-slate-900">{riders.length}</span>
          </div>
        </div>

        {/* Riders Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Rider Info</th>
                  <th className="p-4">Mobile Number</th>
                  <th className="p-4">Vehicle Details</th>
                  <th className="p-4">Driving License & RC</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading rider accounts...
                    </td>
                  </tr>
                ) : filteredRiders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400">
                      No rider accounts found. Click "Add New Rider" to register delivery personnel.
                    </td>
                  </tr>
                ) : (
                  filteredRiders.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black text-xs">
                            {r.name ? r.name.charAt(0).toUpperCase() : 'R'}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 text-sm block">{r.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">ID: #{r.id?.substring(0, 6)}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>+91 {r.mobile}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-slate-800">{r.bikeNumber || 'N/A'}</span>
                      </td>

                      <td className="p-4">
                        <div className="space-y-0.5 text-[11px]">
                          <p><strong className="text-slate-500">DL:</strong> {r.licenseNumber || 'N/A'}</p>
                          <p><strong className="text-slate-500">RC:</strong> {r.rcNumber || 'N/A'}</p>
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        {r.status?.toLowerCase() === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-extrabold">
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-800 rounded-full text-[10px] font-extrabold">
                            <XCircle className="w-3 h-3 text-red-600" /> Inactive
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleOpenEdit(r)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-lg transition flex items-center gap-1 mx-auto cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Truck className="w-6 h-6 text-amber-400" />
                <h3 className="text-base font-extrabold">{editingRider ? 'Edit Rider Profile' : 'Add New Delivery Rider'}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="bg-red-50 text-red-600 border border-red-200 text-xs font-semibold p-3 rounded-xl">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Rider Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mobile Phone Number *</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                  placeholder="10 digit mobile number"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Bike Number</label>
                  <input
                    type="text"
                    value={formData.bikeNumber}
                    onChange={(e) => setFormData({ ...formData, bikeNumber: e.target.value })}
                    placeholder="e.g. AP 29 AB 1234"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Account Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">RC Number</label>
                  <input
                    type="text"
                    value={formData.rcNumber}
                    onChange={(e) => setFormData({ ...formData, rcNumber: e.target.value })}
                    placeholder="RC Number"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Driving License</label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    placeholder="DL Number"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingRider ? 'Update Rider' : 'Save Rider'}
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
