import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users as UsersIcon, Search, RefreshCw, UserCheck } from 'lucide-react';

const Users = () => {
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
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const safeUsers = Array.isArray(users) ? users : [];

  const filteredUsers = safeUsers.filter((u) => {
    const matchesName = u.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPhone = u.phone?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesName || matchesPhone;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <UsersIcon className="w-8 h-8 text-[#0D4715]" />
            Registered Users
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Directory of registered customer and admin user accounts</p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Users</span>
        </button>
      </div>

      {/* Controls Bar */}
      <div className="max-w-7xl mx-auto bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Username or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D4715] transition"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#0D4715] animate-spin mx-auto" />
            <p className="text-slate-500 font-semibold text-sm">Loading users list...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 text-xs font-extrabold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Username</th>
                  <th className="p-4">Phone Number</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4">User ID</th>
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
                    <tr key={user.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4">
                        <div className="w-9 h-9 rounded-full bg-[#0D4715] text-white flex items-center justify-center font-bold text-sm">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                        <span>{user.name}</span>
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                      </td>
                      <td className="p-4 text-slate-600 font-medium">{user.phone || user.mobile || 'N/A'}</td>
                      <td className="p-4 text-slate-500 text-xs">{regDate}</td>
                      <td className="p-4 font-mono text-xs text-slate-400 uppercase">
                        {user.id?.substring(0, 8)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-2">
            <UsersIcon className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No users found</h3>
            <p className="text-xs text-slate-400">Registered users will be listed here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
