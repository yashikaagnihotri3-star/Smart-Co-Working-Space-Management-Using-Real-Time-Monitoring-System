import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const TABS = ['Bookings', 'Inquiries', 'Preferences'];

const UserDashboard = () => {
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState('Bookings');
  const [bookings, setBookings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(user?.profile || {});
  const [savedMsg, setSavedMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, inquiriesRes] = await Promise.all([
        api.get('/bookings/mine'),
        api.get('/inquiries/mine'),
      ]);
      setBookings(bookingsRes.data.bookings);
      setInquiries(inquiriesRes.data.inquiries);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const cancelBooking = async (id) => {
    await api.put(`/bookings/${id}/cancel`);
    loadData();
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    const { data } = await api.put('/auth/me', { profile });
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    setSavedMsg('Preferences saved — your smart matches will now reflect these.');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="font-display font-bold text-2xl">Hello, {user?.name?.split(' ')[0]}</h1>
      <p className="text-ink/60 mt-1">Manage your bookings, inquiries, and matching preferences.</p>

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
        {tab === 'Bookings' && (
          <div className="space-y-3">
            {loading && <p className="text-ink/50">Loading...</p>}
            {!loading && bookings.length === 0 && (
              <div className="text-center py-14 text-ink/50 border border-dashed border-line rounded-xl">
                No bookings yet. <Link to="/" className="text-brand font-semibold">Find a space →</Link>
              </div>
            )}
            {bookings.map((b) => (
              <div key={b._id} className="bg-white border border-line rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="font-semibold">{b.workspace?.name}</div>
                  <div className="text-sm text-ink/50">{b.workspace?.location?.city}</div>
                  <div className="text-sm text-ink/60 mt-1 font-data">
                    {new Date(b.startDate).toLocaleDateString()} – {new Date(b.endDate).toLocaleDateString()} · {b.numberOfPersons} people
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-data font-semibold">₹{b.totalPrice}</span>
                  <StatusBadge status={b.status} />
                  {['pending', 'confirmed'].includes(b.status) && (
                    <button
                      onClick={() => cancelBooking(b._id)}
                      className="text-sm text-coral font-semibold hover:underline"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'Inquiries' && (
          <div className="space-y-3">
            {!loading && inquiries.length === 0 && (
              <div className="text-center py-14 text-ink/50 border border-dashed border-line rounded-xl">
                No inquiries sent yet.
              </div>
            )}
            {inquiries.map((i) => (
              <div key={i._id} className="bg-white border border-line rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{i.workspace?.name}</div>
                  <StatusBadge status={i.status} />
                </div>
                <p className="text-sm text-ink/70 mt-2">"{i.message}"</p>
                {i.response && (
                  <div className="mt-3 bg-brand-light text-brand-dark text-sm rounded-md p-3">
                    <span className="font-semibold">Owner reply: </span>
                    {i.response}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'Preferences' && (
          <form onSubmit={saveProfile} className="bg-white border border-line rounded-xl p-6 max-w-lg space-y-4">
            <p className="text-sm text-ink/60">
              These preferences power your smart match score when browsing spaces.
            </p>
            {savedMsg && <div className="bg-leaf-light text-leaf text-sm rounded-md px-4 py-2">{savedMsg}</div>}
            <div>
              <label className="block text-xs font-semibold uppercase text-ink/50 mb-1">Team size</label>
              <input
                type="number"
                min={1}
                value={profile.teamSize || ''}
                onChange={(e) => setProfile({ ...profile, teamSize: Number(e.target.value) })}
                className="w-full border border-line rounded-md px-3 py-2 outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-ink/50 mb-1">Budget (₹/day)</label>
              <input
                type="number"
                min={0}
                value={profile.budget || ''}
                onChange={(e) => setProfile({ ...profile, budget: Number(e.target.value) })}
                className="w-full border border-line rounded-md px-3 py-2 outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-ink/50 mb-1">Preferred location</label>
              <input
                value={profile.preferredLocation || ''}
                onChange={(e) => setProfile({ ...profile, preferredLocation: e.target.value })}
                className="w-full border border-line rounded-md px-3 py-2 outline-none focus:border-brand"
                placeholder="e.g. Bengaluru"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-ink/50 mb-1">Work style</label>
              <input
                value={profile.workStyle || ''}
                onChange={(e) => setProfile({ ...profile, workStyle: e.target.value })}
                className="w-full border border-line rounded-md px-3 py-2 outline-none focus:border-brand"
                placeholder="e.g. collaborative, quiet, hybrid"
              />
            </div>
            <button className="bg-brand text-paper font-semibold px-5 py-2.5 rounded-md hover:bg-brand-dark transition-colors">
              Save preferences
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
