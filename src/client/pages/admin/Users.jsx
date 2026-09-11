import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MaterialIcon from '../../components/common/MaterialIcon';
import { useToast } from '../../components/common/Toast';

const Users = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/admin/getUsers');
      setUsers(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
      setLoading(false);
      toast.error('Failed to load users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const safeUsers = Array.isArray(users) ? users : [];

  const filteredUsers = safeUsers.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesName = u.name?.toLowerCase().includes(q);
    const matchesPhone = (u.phone || u.mobile || '')?.toLowerCase().includes(q);
    return matchesName || matchesPhone;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-100 text-[#0D4715] flex items-center justify-center">
              <MaterialIcon name="group" size={28} />
            </span>
            <span>Registered Users</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Directory of registered customer and administrator accounts</p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <MaterialIcon name="refresh" size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="max-w-7xl mx-auto bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
            <MaterialIcon name="search" size={20} />
          </div>
          <input
            type="text"
            placeholder="Search by username, phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D4715] focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold w-full sm:w-auto justify-end">
          <span className="px-3 py-1 bg-slate-100 rounded-lg text-slate-700 font-bold">
            Total Users: {safeUsers.length}
          </span>
          {searchQuery && (
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-bold">
              Found: {filteredUsers.length}
            </span>
          )}
        </div>
      </div>

      {/* Users Table & Cards */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="inline-flex p-3 rounded-full bg-emerald-50 text-[#0D4715]">
              <MaterialIcon name="refresh" size={32} className="animate-spin" />
            </div>
            <p className="text-slate-600 font-bold text-sm">Loading user directory...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-extrabold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-4 px-5">User</th>
                  <th className="py-4 px-5">Username</th>
                  <th className="py-4 px-5">Phone Number</th>
                  <th className="py-4 px-5">Registered Date</th>
                  <th className="py-4 px-5">Account ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => {
                  const regDate = user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'N/A';

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-5">
                        <div className="w-10 h-10 rounded-xl bg-[#0D4715] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      </td>
                      <td className="py-4 px-5 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{user.name || 'Anonymous User'}</span>
                          <span className="text-emerald-600 flex items-center" title="Verified Account">
                            <MaterialIcon name="verified" size={16} fill />
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-slate-700 font-medium">
                        {user.phone || user.mobile ? (
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <MaterialIcon name="call" size={16} className="text-slate-400" />
                            <span>{user.phone || user.mobile}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No phone attached</span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-slate-600 text-xs font-medium">
                        <div className="flex items-center gap-1.5">
                          <MaterialIcon name="calendar_today" size={14} className="text-slate-400" />
                          <span>{regDate}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 font-mono text-xs text-slate-400 uppercase">
                        {user.id?.substring(0, 10)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <MaterialIcon name="group" size={32} />
            </div>
            <h3 className="text-base font-bold text-slate-800">No users found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery ? 'Try changing your search query.' : 'Registered users will be listed here.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
