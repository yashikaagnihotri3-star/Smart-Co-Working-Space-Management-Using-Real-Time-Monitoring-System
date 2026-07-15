import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Users, Ruler, Wifi, Car, ShieldCheck, Coffee, DoorOpen, Zap } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const AMENITY_META = {
  wifi: { icon: Wifi, label: 'Wi-Fi' },
  meeting_rooms: { icon: DoorOpen, label: 'Meeting rooms' },
  parking: { icon: Car, label: 'Parking' },
  power_backup: { icon: Zap, label: 'Power backup' },
  cafeteria: { icon: Coffee, label: 'Cafeteria' },
  security: { icon: ShieldCheck, label: 'Security' },
};

const TYPE_LABEL = {
  private_cabin: 'Private cabin',
  shared_desk: 'Shared desk',
  meeting_room: 'Meeting room',
};

const WorkspaceDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingForm, setBookingForm] = useState({
    numberOfPersons: 1,
    startDate: '',
    endDate: '',
    notes: '',
  });
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/workspaces/${id}`);
        setWorkspace(data.workspace);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setSubmitting(true);
    setFeedback(null);
    try {
      await api.post('/bookings', { workspaceId: id, ...bookingForm });
      setFeedback({ type: 'success', text: 'Booking request sent! You can track its status in your dashboard.' });
      setBookingForm({ numberOfPersons: 1, startDate: '', endDate: '', notes: '' });
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Could not create booking.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInquiry = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setSubmitting(true);
    setFeedback(null);
    try {
      await api.post('/inquiries', { workspaceId: id, message: inquiryMessage });
      setFeedback({ type: 'success', text: 'Your inquiry has been sent to the space owner.' });
      setInquiryMessage('');
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Could not send inquiry.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-24 text-ink/50">Loading workspace...</div>;
  if (!workspace) return <div className="text-center py-24 text-ink/50">Workspace not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 grid lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2">
        <div className="h-40 rounded-xl bg-grid-pattern bg-grid bg-brand-light mb-6" />

        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="font-data text-xs uppercase tracking-wide text-brand-dark bg-brand-light px-2 py-1 rounded">
              {TYPE_LABEL[workspace.workspaceType]}
            </span>
            <h1 className="font-display font-bold text-3xl mt-3">{workspace.name}</h1>
            <p className="flex items-center gap-1 text-ink/60 mt-1">
              <MapPin size={16} /> {workspace.location.address}, {workspace.location.city}
            </p>
          </div>
          <StatusBadge status={workspace.availability.status} />
        </div>

        <p className="mt-5 text-ink/70 leading-relaxed">{workspace.description}</p>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-line rounded-lg p-4">
            <Users size={18} className="text-brand mb-1" />
            <div className="font-data font-semibold">{workspace.seatingCapacity}</div>
            <div className="text-xs text-ink/50">Seating capacity</div>
          </div>
          <div className="bg-white border border-line rounded-lg p-4">
            <Ruler size={18} className="text-brand mb-1" />
            <div className="font-data font-semibold">{workspace.areaSize} sqft</div>
            <div className="text-xs text-ink/50">Area size</div>
          </div>
          <div className="bg-white border border-line rounded-lg p-4">
            <div className="font-display font-bold text-lg text-brand">₹{workspace.pricing.amount}</div>
            <div className="text-xs text-ink/50">per {workspace.pricing.unit}</div>
          </div>
        </div>

        <h2 className="font-display font-semibold text-lg mt-8 mb-3">Amenities</h2>
        <div className="flex flex-wrap gap-3">
          {workspace.amenities.map((a) => {
            const meta = AMENITY_META[a];
            if (!meta) return null;
            const Icon = meta.icon;
            return (
              <span
                key={a}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-line text-sm"
              >
                <Icon size={16} className="text-brand" /> {meta.label}
              </span>
            );
          })}
        </div>

        {workspace.workStyleTags?.length > 0 && (
          <>
            <h2 className="font-display font-semibold text-lg mt-8 mb-3">Work style</h2>
            <div className="flex flex-wrap gap-2">
              {workspace.workStyleTags.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-line text-ink/70 text-sm capitalize">
                  {tag}
                </span>
              ))}
            </div>
          </>
        )}

        <div className="mt-8 bg-white border border-line rounded-xl p-5">
          <h2 className="font-display font-semibold text-lg mb-2">Have questions for the owner?</h2>
          <p className="text-sm text-ink/60 mb-3">
            Connect directly to ask about work style fit, meeting availability, or anything else.
          </p>
          <form onSubmit={handleInquiry} className="flex flex-col sm:flex-row gap-3">
            <input
              value={inquiryMessage}
              onChange={(e) => setInquiryMessage(e.target.value)}
              required
              placeholder="e.g. Do you support hybrid teams with flexible hours?"
              className="flex-1 border border-line rounded-md px-3 py-2 outline-none focus:border-brand"
            />
            <button
              disabled={submitting}
              className="px-4 py-2 rounded-md bg-ink text-paper font-semibold text-sm hover:bg-ink/80 transition-colors disabled:opacity-60"
            >
              Send inquiry
            </button>
          </form>
        </div>
      </div>

      {/* Booking panel */}
      <aside className="lg:sticky lg:top-24 h-fit bg-white border border-line rounded-xl p-6">
        <h2 className="font-display font-semibold text-lg mb-4">Request a booking</h2>

        {feedback && (
          <div
            className={`mb-4 text-sm rounded-md px-4 py-3 ${
              feedback.type === 'success' ? 'bg-leaf-light text-leaf' : 'bg-coral-light text-coral'
            }`}
          >
            {feedback.text}
          </div>
        )}

        <form onSubmit={handleBooking} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-ink/50 mb-1">Number of persons</label>
            <input
              type="number"
              min={1}
              max={workspace.seatingCapacity}
              required
              value={bookingForm.numberOfPersons}
              onChange={(e) => setBookingForm({ ...bookingForm, numberOfPersons: Number(e.target.value) })}
              className="w-full border border-line rounded-md px-3 py-2 outline-none focus:border-brand"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-ink/50 mb-1">Start date</label>
              <input
                type="date"
                required
                value={bookingForm.startDate}
                onChange={(e) => setBookingForm({ ...bookingForm, startDate: e.target.value })}
                className="w-full border border-line rounded-md px-3 py-2 outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-ink/50 mb-1">End date</label>
              <input
                type="date"
                required
                value={bookingForm.endDate}
                onChange={(e) => setBookingForm({ ...bookingForm, endDate: e.target.value })}
                className="w-full border border-line rounded-md px-3 py-2 outline-none focus:border-brand"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-ink/50 mb-1">Notes (optional)</label>
            <textarea
              rows={3}
              value={bookingForm.notes}
              onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
              className="w-full border border-line rounded-md px-3 py-2 outline-none focus:border-brand"
              placeholder="Any specific requirements?"
            />
          </div>
          <button
            disabled={submitting || workspace.availability.status === 'full'}
            className="w-full bg-brand text-paper font-semibold py-2.5 rounded-md hover:bg-brand-dark transition-colors disabled:opacity-50"
          >
            {workspace.availability.status === 'full' ? 'Fully booked' : submitting ? 'Sending...' : 'Send booking request'}
          </button>
        </form>
      </aside>
    </div>
  );
};

export default WorkspaceDetail;
