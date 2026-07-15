import React, { useState } from 'react';
import api from '../api/axios';

const AMENITY_OPTIONS = ['wifi', 'meeting_rooms', 'parking', 'power_backup', 'cafeteria', 'security'];

const emptyForm = {
  name: '',
  description: '',
  city: '',
  address: '',
  areaSize: '',
  seatingCapacity: '',
  workspaceType: 'shared_desk',
  priceAmount: '',
  priceUnit: 'day',
  amenities: [],
  workStyleTags: '',
  totalSlots: '',
};

const WorkspaceForm = ({ initial, onSaved, onClose }) => {
  const [form, setForm] = useState(
    initial
      ? {
          name: initial.name,
          description: initial.description,
          city: initial.location.city,
          address: initial.location.address,
          areaSize: initial.areaSize,
          seatingCapacity: initial.seatingCapacity,
          workspaceType: initial.workspaceType,
          priceAmount: initial.pricing.amount,
          priceUnit: initial.pricing.unit,
          amenities: initial.amenities,
          workStyleTags: initial.workStyleTags?.join(', ') || '',
          totalSlots: initial.availability.totalSlots,
        }
      : emptyForm
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleAmenity = (a) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      name: form.name,
      description: form.description,
      location: { city: form.city, address: form.address },
      areaSize: Number(form.areaSize),
      seatingCapacity: Number(form.seatingCapacity),
      workspaceType: form.workspaceType,
      pricing: { amount: Number(form.priceAmount), unit: form.priceUnit },
      amenities: form.amenities,
      workStyleTags: form.workStyleTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      availability: { totalSlots: Number(form.totalSlots) },
    };

    try {
      if (initial) {
        await api.put(`/workspaces/${initial._id}`, payload);
      } else {
        await api.post('/workspaces', payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save workspace');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-coral-light text-coral text-sm rounded-md px-4 py-2">{error}</div>}

      <div>
        <label className="block text-xs font-semibold uppercase text-ink/50 mb-1">Space name</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border border-line rounded-md px-3 py-2 outline-none focus:border-brand"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase text-ink/50 mb-1">Description</label>
        <textarea
          rows={2}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border border-line rounded-md px-3 py-2 outline-none focus:border-brand"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase text-ink/50 mb-1">City</label>
          <input
            required
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="w-full border border-line rounded-md px-3 py-2 outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-ink/50 mb-1">Address</label>
          <input
            required
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full border border-line rounded-md px-3 py-2 outline-none focus:border-brand"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase text-ink/50 mb-1">Area (sqft)</label>
          <input
            type="number"
            required
            min={1}
            value={form.areaSize}
            onChange={(e) => setForm({ ...form, areaSize: e.target.value })}
            className="w-full border border-line rounded-md px-3 py-2 outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-ink/50 mb-1">Seating capacity</label>
          <input
            type="number"
            required
            min={1}
            value={form.seatingCapacity}
            onChange={(e) => setForm({ ...form, seatingCapacity: e.target.value })}
            className="w-full border border-line rounded-md px-3 py-2 outline-none focus:border-brand"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase text-ink/50 mb-1">Workspace type</label>
        <select
          value={form.workspaceType}
          onChange={(e) => setForm({ ...form, workspaceType: e.target.value })}
          className="w-full border border-line rounded-md px-3 py-2 outline-none focus:border-brand bg-white"
        >
          <option value="shared_desk">Shared desk</option>
          <option value="private_cabin">Private cabin</option>
          <option value="meeting_room">Meeting room</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase text-ink/50 mb-1">Price (₹)</label>
          <input
            type="number"
            required
            min={0}
            value={form.priceAmount}
            onChange={(e) => setForm({ ...form, priceAmount: e.target.value })}
            className="w-full border border-line rounded-md px-3 py-2 outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-ink/50 mb-1">Per</label>
          <select
            value={form.priceUnit}
            onChange={(e) => setForm({ ...form, priceUnit: e.target.value })}
            className="w-full border border-line rounded-md px-3 py-2 outline-none focus:border-brand bg-white"
          >
            <option value="hour">Hour</option>
            <option value="day">Day</option>
            <option value="month">Month</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase text-ink/50 mb-1">Total slots available</label>
        <input
          type="number"
          required
          min={1}
          value={form.totalSlots}
          onChange={(e) => setForm({ ...form, totalSlots: e.target.value })}
          className="w-full border border-line rounded-md px-3 py-2 outline-none focus:border-brand"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase text-ink/50 mb-1">Amenities</label>
        <div className="flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => toggleAmenity(a)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                form.amenities.includes(a) ? 'bg-brand text-paper border-brand' : 'border-line text-ink/60'
              }`}
            >
              {a.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase text-ink/50 mb-1">
          Work style tags (comma separated)
        </label>
        <input
          value={form.workStyleTags}
          onChange={(e) => setForm({ ...form, workStyleTags: e.target.value })}
          placeholder="collaborative, quiet, formal"
          className="w-full border border-line rounded-md px-3 py-2 outline-none focus:border-brand"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 border border-line rounded-md py-2.5 font-semibold text-ink/70 hover:bg-paper"
        >
          Cancel
        </button>
        <button
          disabled={saving}
          className="flex-1 bg-brand text-paper rounded-md py-2.5 font-semibold hover:bg-brand-dark disabled:opacity-60"
        >
          {saving ? 'Saving...' : initial ? 'Save changes' : 'Create listing'}
        </button>
      </div>
    </form>
  );
};

export default WorkspaceForm;
