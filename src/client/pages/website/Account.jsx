import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../../components/common/Toast';
import CustomerAuthModal from '../../components/website/CustomerAuthModal';
import MaterialIcon from '../../components/common/MaterialIcon';

const Account = () => {
  const { customer, logoutCustomer, loginCustomer } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError, confirm } = useToast();

  const [activeTab, setActiveTab] = useState('PROFILE'); // 'PROFILE' | 'ADDRESSES'
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [name, setName] = useState(customer?.name || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [mobile, setMobile] = useState(customer?.mobile || '');

  const [addresses, setAddresses] = useState(customer?.addresses || []);
  const [newAddress, setNewAddress] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (customer) {
      setName(customer.name || '');
      setEmail(customer.email || '');
      setMobile(customer.mobile || '');
      setAddresses(customer.addresses || []);
    }
  }, [customer]);

  if (!customer) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-200/80 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-[#0D4715] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <MaterialIcon name="manage_accounts" size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">My Account</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            Please log in with your mobile phone number to view your profile, manage saved delivery addresses, and track real-time orders.
          </p>
          <button
            onClick={() => setAuthModalOpen(true)}
            className="w-full py-3.5 bg-[#0D4715] hover:bg-[#1b5e20] text-white font-bold text-xs rounded-2xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
          >
            <MaterialIcon name="lock" size={16} />
            <span>Login with Mobile OTP</span>
          </button>
        </div>
        {authModalOpen && (
          <CustomerAuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        )}
      </div>
    );
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        id: customer.id,
        name,
        mobile,
        email,
        addresses
      };
      const res = await axios.post('/website/customer/profile', payload);
      setSaving(false);
      loginCustomer(res.data.customer);
      setEditingProfile(false);
      showSuccess('Profile updated successfully!');
    } catch (err) {
      setSaving(false);
      showError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.trim()) return;
    const updated = [...addresses, newAddress.trim()];
    setAddresses(updated);
    setNewAddress('');
    
    try {
      const payload = {
        id: customer.id,
        name: customer.name,
        mobile: customer.mobile,
        email: customer.email,
        addresses: updated
      };
      const res = await axios.post('/website/customer/profile', payload);
      loginCustomer(res.data.customer);
      showSuccess('Delivery address added successfully!');
    } catch (e) {
      showError('Failed to save address.');
    }
  };

  const handleDeleteAddress = (index) => {
    confirm({
      title: 'Remove Address',
      message: 'Are you sure you want to remove this delivery address from your profile?',
      confirmText: 'Remove',
      isDanger: true,
      onConfirm: async () => {
        const updated = addresses.filter((_, i) => i !== index);
        setAddresses(updated);
        try {
          const payload = {
            id: customer.id,
            name: customer.name,
            mobile: customer.mobile,
            email: customer.email,
            addresses: updated
          };
          const res = await axios.post('/website/customer/profile', payload);
          loginCustomer(res.data.customer);
          showSuccess('Address removed.');
        } catch (e) {
          showError('Failed to remove address.');
        }
      }
    });
  };

  const handleLogout = () => {
    logoutCustomer();
    navigate('/');
  };

  return (
    <div className="bg-slate-50/60 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Banner Card */}
        <div className="bg-gradient-to-r from-[#0D4715] to-[#1b5e20] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl font-black text-white shadow-inner">
              {customer.name ? customer.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{customer.name || 'Valued Customer'}</h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-100 mt-1">
                <span className="flex items-center gap-1 font-bold">
                  <MaterialIcon name="call" size={14} /> +91 {customer.mobile}
                </span>
                {customer.email && (
                  <span className="flex items-center gap-1 font-medium">
                    <MaterialIcon name="mail" size={14} /> {customer.email}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-rose-600/30 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition border border-white/10 cursor-pointer shadow-sm"
          >
            <MaterialIcon name="logout" size={16} />
            <span>Logout</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded-2xl shadow-xs border border-slate-200">
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'PROFILE'
                ? 'bg-[#0D4715] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MaterialIcon name="person" size={18} />
            <span>Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('ADDRESSES')}
            className={`py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'ADDRESSES'
                ? 'bg-[#0D4715] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MaterialIcon name="location_on" size={18} />
            <span>Addresses ({addresses.length})</span>
          </button>

          <Link
            to="/my-orders"
            className="py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-100 transition"
          >
            <MaterialIcon name="receipt_long" size={18} className="text-[#0D4715]" />
            <span>My Orders</span>
          </Link>
        </div>

        {/* TAB 1: PROFILE DETAILS */}
        {activeTab === 'PROFILE' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <MaterialIcon name="badge" size={20} className="text-[#0D4715]" />
                Personal Information
              </h2>
              {!editingProfile && (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#0D4715] hover:text-emerald-700 cursor-pointer"
                >
                  <MaterialIcon name="edit" size={16} />
                  <span>Edit Details</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    disabled={!editingProfile}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 disabled:opacity-75 focus:bg-white focus:ring-2 focus:ring-[#0D4715]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Mobile Number (Verified)
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      disabled
                      value={`+91 ${mobile}`}
                      className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 cursor-not-allowed"
                    />
                    <MaterialIcon name="verified" size={20} className="absolute right-3.5 text-emerald-600" filled />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled={!editingProfile}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Add your email address"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 disabled:opacity-75 focus:bg-white focus:ring-2 focus:ring-[#0D4715]"
                  />
                </div>
              </div>

              {editingProfile && (
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-[#0D4715] text-white font-bold text-xs rounded-xl shadow-md hover:bg-[#1b5e20] transition cursor-pointer"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProfile(false)}
                    className="px-6 py-2.5 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-300 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* TAB 2: SAVED ADDRESSES */}
        {activeTab === 'ADDRESSES' && (
          <div className="space-y-6">
            {/* Add New Address Form */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 space-y-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <MaterialIcon name="add_location_alt" size={20} className="text-[#0D4715]" />
                Add New Delivery Address
              </h3>
              <form onSubmit={handleAddAddress} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Enter house no, street, landmark, city, pincode"
                  className="flex-grow px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0D4715]"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#0D4715] text-white font-bold text-xs rounded-2xl shadow-md hover:bg-[#1b5e20] transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <MaterialIcon name="add" size={18} />
                  <span>Add Address</span>
                </button>
              </form>
            </div>

            {/* Addresses List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr, idx) => (
                <div key={idx} className="bg-white p-5 rounded-3xl shadow-xs border border-slate-200/80 flex justify-between items-start relative group">
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#0D4715] flex items-center justify-center font-bold text-sm shrink-0">
                      <MaterialIcon name="location_on" size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase bg-emerald-100 text-[#0D4715] px-2 py-0.5 rounded-md">
                        Address #{idx + 1}
                      </span>
                      <p className="text-xs font-semibold text-slate-800 mt-2 leading-relaxed">{addr}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteAddress(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer rounded-lg hover:bg-rose-50"
                    title="Remove address"
                    aria-label="Remove address"
                  >
                    <MaterialIcon name="delete" size={18} />
                  </button>
                </div>
              ))}

              {addresses.length === 0 && (
                <div className="md:col-span-2 bg-white p-10 rounded-3xl text-center border border-slate-200/80">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
                    <MaterialIcon name="wrong_location" size={24} />
                  </div>
                  <p className="text-xs font-bold text-slate-500">No saved addresses yet. Add an address above for fast checkout.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Account;
