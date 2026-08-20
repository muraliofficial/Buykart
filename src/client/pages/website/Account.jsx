import React, { useState, useEffect } from 'react';
import { User, MapPin, Package, LogOut, Plus, Edit, Trash2, CheckCircle2, ShieldCheck, Phone, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import CustomerAuthModal from '../../components/website/CustomerAuthModal';

const Account = () => {
  const { customer, logoutCustomer, loginCustomer } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('PROFILE'); // 'PROFILE' | 'ADDRESSES' | 'ORDERS'
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [name, setName] = useState(customer?.name || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [mobile, setMobile] = useState(customer?.mobile || '');

  const [addresses, setAddresses] = useState(customer?.addresses || []);
  const [newAddress, setNewAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

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
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-50 text-[#0D4715] rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">My Account</h2>
          <p className="text-sm text-gray-600 mb-6">
            Please log in with your mobile number to view your profile, saved addresses, and live order updates.
          </p>
          <button
            onClick={() => setAuthModalOpen(true)}
            className="w-full py-3 bg-[#0D4715] text-white font-bold text-sm rounded-xl shadow-lg hover:bg-[#1b6b25] transition cursor-pointer"
          >
            Login with Mobile OTP
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
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setSaving(false);
      alert(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.trim()) return;
    const updated = [...addresses, newAddress.trim()];
    setAddresses(updated);
    setNewAddress('');
    
    // Save to server
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
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAddress = async (index) => {
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
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    logoutCustomer();
    navigate('/');
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Card */}
        <div className="bg-gradient-to-r from-[#0D4715] to-[#1b6b25] text-white p-6 sm:p-8 rounded-2xl shadow-xl mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl font-black text-white">
              {customer.name ? customer.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{customer.name || 'Valued Customer'}</h1>
              <div className="flex items-center gap-3 text-xs text-emerald-100 mt-1">
                <span className="flex items-center gap-1 font-semibold">
                  <Phone className="w-3.5 h-3.5" /> +91 {customer.mobile}
                </span>
                {customer.email && (
                  <span className="flex items-center gap-1 font-semibold">
                    <Mail className="w-3.5 h-3.5" /> {customer.email}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600/30 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition border border-white/10 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {message && (
          <div className="mb-6 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {message}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'PROFILE'
                ? 'bg-[#0D4715] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Details</span>
          </button>

          <button
            onClick={() => setActiveTab('ADDRESSES')}
            className={`py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'ADDRESSES'
                ? 'bg-[#0D4715] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses ({addresses.length})</span>
          </button>

          <Link
            to="/my-orders"
            className="py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-100 transition"
          >
            <Package className="w-4 h-4 text-[#0D4715]" />
            <span>My Orders & Tracking</span>
          </Link>
        </div>

        {/* TAB 1: PROFILE DETAILS */}
        {activeTab === 'PROFILE' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black text-gray-900">Personal Information</h2>
              {!editingProfile && (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#0D4715] hover:underline cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    disabled={!editingProfile}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 disabled:opacity-75 focus:bg-white focus:ring-2 focus:ring-[#0D4715]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Mobile Number (Verified)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      disabled
                      value={`+91 ${mobile}`}
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 cursor-not-allowed"
                    />
                    <ShieldCheck className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled={!editingProfile}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Add your email address"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 disabled:opacity-75 focus:bg-white focus:ring-2 focus:ring-[#0D4715]"
                  />
                </div>
              </div>

              {editingProfile && (
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-[#0D4715] text-white font-bold text-xs rounded-xl shadow-md hover:bg-[#1b6b25] transition cursor-pointer"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProfile(false)}
                    className="px-6 py-2.5 bg-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-300 transition cursor-pointer"
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
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
              <h3 className="text-base font-black text-gray-900 mb-3">Add New Delivery Address</h3>
              <form onSubmit={handleAddAddress} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Enter house no, street, landmark, city, pincode"
                  className="flex-grow px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#0D4715]"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#0D4715] text-white font-bold text-xs rounded-xl shadow-md hover:bg-[#1b6b25] transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Address</span>
                </button>
              </form>
            </div>

            {/* Addresses List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200 flex justify-between items-start relative group">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0D4715] flex items-center justify-center font-bold text-sm shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-[#0D4715] px-2 py-0.5 rounded-md">
                        Address #{idx + 1}
                      </span>
                      <p className="text-xs font-bold text-gray-800 mt-2 leading-relaxed">{addr}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteAddress(idx)}
                    className="p-2 text-gray-400 hover:text-red-600 transition cursor-pointer"
                    title="Remove address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {addresses.length === 0 && (
                <div className="md:col-span-2 bg-white p-8 rounded-2xl text-center border border-gray-200">
                  <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-500">No saved addresses yet.</p>
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
