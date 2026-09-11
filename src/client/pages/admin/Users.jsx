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
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Users
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            Directory of registered customer and staff accounts
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition shadow-2xs disabled:opacity-50"
        >
          <MaterialIcon name="refresh" size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="max-w-7xl mx-auto bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
            <MaterialIcon name="search" size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium w-full sm:w-auto text-right">
          Total: <span className="text-slate-900 font-bold">{safeUsers.length}</span>
          {searchQuery && (
            <span className="ml-2 text-emerald-700 font-semibold">
              ({filteredUsers.length} found)
            </span>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-emerald-600 border-t-transparent"></div>
            <p className="text-slate-500 font-medium text-xs">Loading users...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4">User ID</th>
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
                    : '—';

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">{user.name || 'Customer'}</span>
                            <span className="text-[11px] text-slate-400">{user.email || ''}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {user.phone || user.mobile || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {regDate}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 uppercase">
                        #{user.id?.substring(0, 8)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-14 text-center space-y-2">
            <MaterialIcon name="group" size={32} className="text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-700">No users found</h3>
            <p className="text-xs text-slate-400">
              {searchQuery ? 'Try adjusting your search term.' : 'Registered users will appear here.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
