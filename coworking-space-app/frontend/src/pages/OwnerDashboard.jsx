import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import WorkspaceForm from '../components/WorkspaceForm';

const TABS = ['Listings', 'Bookings', 'Inquiries'];

const OwnerDashboard = () => {
  const [tab, setTab] = useState('Listings');
  const [workspaces, setWorkspaces] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);
  const [replyDraft, setReplyDraft] = useState({});

  const loadAll = async () => {
    setLoading(true);
    try {
      const [wsRes, bookingsRes, inquiriesRes] = await Promise.all([
        api.get('/workspaces/mine/list'),
        api.get('/bookings/owner'),
        api.get('/inquiries/owner'),
      ]);
      setWorkspaces(wsRes.data.workspaces);
      setBookings(bookingsRes.data.bookings);
      setInquiries(inquiriesRes.data.inquiries);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const openCreate = () => {
    setEditingWorkspace(null);
    setFormOpen(true);
  };

  const openEdit = (ws) => {
    setEditingWorkspace(ws);
    setFormOpen(true);
  };

  const deleteWorkspace = async (id) => {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return;
    await api.delete(`/workspaces/${id}`);
    loadAll();
  };

  const updateBookingStatus = async (id, status) => {
    await api.put(`/bookings/${id}/status`, { status });
    loadAll();
  };

  const respondToInquiry = async (id) => {
    const response = replyDraft[id];
    if (!response) return;
    await api.put(`/inquiries/${id}/respond`, { response });
    setReplyDraft((d) => ({ ...d, [id]: '' }));
    loadAll();
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl">Space owner dashboard</h1>
          <p className="text-ink/60 mt-1">Manage your listings, bookings, and inquiries.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-brand text-paper font-semibold px-4 py-2.5 rounded-md hover:bg-brand-dark transition-colors"
        >
          <Plus size={16} /> Add listing
        </button>
      </div>

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

        {!loading && tab === 'Listings' && (
          <div className="grid sm:grid-cols-2 gap-4">
            {workspaces.length === 0 && (
              <div className="col-span-2 text-center py-14 text-ink/50 border border-dashed border-line rounded-xl">
                No listings yet. Click "Add listing" to publish your first space.
              </div>
            )}
            {workspaces.map((ws) => (
              <div key={ws._id} className="bg-white border border-line rounded-xl p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display font-semibold">{ws.name}</h3>
                    <p className="text-sm text-ink/50">{ws.location.city}</p>
                  </div>
                  <StatusBadge status={ws.availability.status} />
                </div>
                <div className="mt-3 text-sm font-data text-ink/70">
                  {ws.availability.availableSlots}/{ws.availability.totalSlots} slots free · ₹{ws.pricing.amount}/{ws.pricing.unit}
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => openEdit(ws)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => deleteWorkspace(ws._id)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-coral hover:underline"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && tab === 'Bookings' && (
          <div className="space-y-3">
            {bookings.length === 0 && (
              <div className="text-center py-14 text-ink/50 border border-dashed border-line rounded-xl">
                No booking requests yet.
              </div>
            )}
            {bookings.map((b) => (
              <div key={b._id} className="bg-white border border-line rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="font-semibold">{b.workspace?.name}</div>
                  <div className="text-sm text-ink/50">{b.user?.name} · {b.user?.email}</div>
                  <div className="text-sm text-ink/60 mt-1 font-data">
                    {new Date(b.startDate).toLocaleDateString()} – {new Date(b.endDate).toLocaleDateString()} · {b.numberOfPersons} people
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-data font-semibold">₹{b.totalPrice}</span>
                  <StatusBadge status={b.status} />
                  {b.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateBookingStatus(b._id, 'confirmed')}
                        className="text-sm font-semibold text-leaf hover:underline"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => updateBookingStatus(b._id, 'rejected')}
                        className="text-sm font-semibold text-coral hover:underline"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {b.status === 'confirmed' && (
                    <button
                      onClick={() => updateBookingStatus(b._id, 'completed')}
                      className="text-sm font-semibold text-brand hover:underline"
                    >
                      Mark completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && tab === 'Inquiries' && (
          <div className="space-y-3">
            {inquiries.length === 0 && (
              <div className="text-center py-14 text-ink/50 border border-dashed border-line rounded-xl">
                No inquiries yet.
              </div>
            )}
            {inquiries.map((i) => (
              <div key={i._id} className="bg-white border border-line rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{i.workspace?.name}</div>
                    <div className="text-sm text-ink/50">{i.user?.name}</div>
                  </div>
                  <StatusBadge status={i.status} />
                </div>
                <p className="text-sm text-ink/70 mt-2">"{i.message}"</p>
                {i.response ? (
                  <div className="mt-3 bg-brand-light text-brand-dark text-sm rounded-md p-3">
                    <span className="font-semibold">Your reply: </span>
                    {i.response}
                  </div>
                ) : (
                  <div className="mt-3 flex gap-2">
                    <input
                      value={replyDraft[i._id] || ''}
                      onChange={(e) => setReplyDraft((d) => ({ ...d, [i._id]: e.target.value }))}
                      placeholder="Write a reply..."
                      className="flex-1 border border-line rounded-md px-3 py-2 outline-none focus:border-brand text-sm"
                    />
                    <button
                      onClick={() => respondToInquiry(i._id)}
                      className="px-4 py-2 rounded-md bg-ink text-paper font-semibold text-sm hover:bg-ink/80"
                    >
                      Reply
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {formOpen && (
        <Modal title={editingWorkspace ? 'Edit listing' : 'Add a new listing'} onClose={() => setFormOpen(false)}>
          <WorkspaceForm
            initial={editingWorkspace}
            onClose={() => setFormOpen(false)}
            onSaved={() => {
              setFormOpen(false);
              loadAll();
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default OwnerDashboard;
