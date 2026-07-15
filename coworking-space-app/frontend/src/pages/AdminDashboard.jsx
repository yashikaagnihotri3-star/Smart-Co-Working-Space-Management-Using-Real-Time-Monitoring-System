import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

const TABS = ['Overview', 'Users', 'Workspaces'];

const KpiCard = ({ label, value, suffix }) => (
  <div className="bg-white border border-line rounded-xl p-5">
    <div className="font-data font-bold text-2xl text-brand">
      {value}
      {suffix}
    </div>
    <div className="text-sm text-ink/50 mt-1">{label}</div>
  </div>
);

const AdminDashboard = () => {
  const [tab, setTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, wsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/workspaces'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
      setWorkspaces(wsRes.data.workspaces);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const toggleUser = async (id) => {
    await api.put(`/admin/users/${id}/toggle-active`);
    loadAll();
  };

  const toggleWorkspace = async (id) => {
    await api.put(`/admin/workspaces/${id}/toggle-active`);
    loadAll();
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="font-display font-bold text-2xl">Platform admin</h1>
      <p className="text-ink/60 mt-1">Monitor activity and manage users & listings.</p>

      <div className="flex gap-2 mt-6 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              tab === t ? 'border-brand text-brand' : 'border-transparent text-ink/50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading && <p className="text-ink/50">Loading...</p>}

        {!loading && tab === 'Overview' && stats && (
          <div className="grid sm:grid-cols-3 gap-4">
            <KpiCard label="Registered users" value={stats.registeredUsers} />
            <KpiCard label="Registered space owners" value={stats.registeredOwners} />
            <KpiCard label="Active workspace listings" value={stats.totalWorkspaces} />
            <KpiCard label="Total bookings" value={stats.totalBookings} />
            <KpiCard label="Booking completion rate" value={stats.bookingCompletionRate} suffix="%" />
            <KpiCard label="Search-to-booking conversion" value={stats.searchToBookingConversionRate} suffix="%" />
            <KpiCard label="Total inquiries" value={stats.totalInquiries} />
          </div>
        )}

        {!loading && tab === 'Users' && (
          <div className="bg-white border border-line rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-paper text-ink/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-t border-line">
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3 text-ink/60">{u.email}</td>
                    <td className="px-4 py-3 capitalize">{u.role.replace('_', ' ')}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={u.isActive ? 'confirmed' : 'rejected'} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toggleUser(u._id)}
                        className="text-brand font-semibold hover:underline"
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && tab === 'Workspaces' && (
          <div className="bg-white border border-line rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-paper text-ink/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Owner</th>
                  <th className="px-4 py-3 font-semibold">City</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {workspaces.map((ws) => (
                  <tr key={ws._id} className="border-t border-line">
                    <td className="px-4 py-3">{ws.name}</td>
                    <td className="px-4 py-3 text-ink/60">{ws.owner?.name}</td>
                    <td className="px-4 py-3">{ws.location.city}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={ws.isActive ? 'confirmed' : 'rejected'} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toggleWorkspace(ws._id)}
                        className="text-brand font-semibold hover:underline"
                      >
                        {ws.isActive ? 'Unpublish' : 'Publish'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
