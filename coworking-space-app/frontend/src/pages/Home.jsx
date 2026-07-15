import React, { useEffect, useState, useCallback } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import api from '../api/axios';
import WorkspaceCard from '../components/WorkspaceCard';

const AMENITY_OPTIONS = [
  { value: 'wifi', label: 'Wi-Fi' },
  { value: 'meeting_rooms', label: 'Meeting rooms' },
  { value: 'parking', label: 'Parking' },
  { value: 'power_backup', label: 'Power backup' },
  { value: 'cafeteria', label: 'Cafeteria' },
  { value: 'security', label: 'Security' },
];

const Home = () => {
  const [filters, setFilters] = useState({
    city: '',
    workspaceType: '',
    teamSize: '',
    maxBudget: '',
    amenities: [],
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ total: 0 });

  const fetchWorkspaces = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sortByMatch: 'true' };
      if (filters.city) params.city = filters.city;
      if (filters.workspaceType) params.workspaceType = filters.workspaceType;
      if (filters.teamSize) params.teamSize = filters.teamSize;
      if (filters.maxBudget) params.maxBudget = filters.maxBudget;
      if (filters.amenities.length) params.amenities = filters.amenities.join(',');

      const { data } = await api.get('/workspaces', { params });
      setResults(data.results);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const toggleAmenity = (value) => {
    setFilters((f) => ({
      ...f,
      amenities: f.amenities.includes(value)
        ? f.amenities.filter((a) => a !== value)
        : [...f.amenities, value],
    }));
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-ink text-paper bg-grid-pattern bg-grid">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-20">
          <span className="font-data text-xs uppercase tracking-widest text-brand-light/80">
            Real-time availability · Smart matching
          </span>
          <h1 className="font-display font-bold text-4xl md:text-5xl mt-3 max-w-2xl leading-tight">
            Find a co-working space that fits your team, budget, and way of working.
          </h1>
          <p className="mt-4 text-paper/70 max-w-xl">
            Compare seating capacity, amenities, and live availability across every listed space —
            then request a booking in a few clicks.
          </p>

          {/* Search bar */}
          <div className="mt-8 bg-white rounded-xl p-2 flex flex-col md:flex-row gap-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-1 px-3">
              <Search size={18} className="text-ink/40" />
              <input
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                placeholder="Search by city, e.g. Bengaluru"
                className="w-full py-2.5 outline-none text-ink"
              />
            </div>
            <button
              onClick={() => setShowFilters((s) => !s)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-light text-brand-dark font-semibold text-sm hover:bg-brand-light/70 transition-colors"
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-3 bg-white rounded-xl p-5 max-w-3xl grid sm:grid-cols-2 gap-4 text-ink">
              <div>
                <label className="text-xs font-semibold uppercase text-ink/50">Team size</label>
                <input
                  type="number"
                  min={1}
                  value={filters.teamSize}
                  onChange={(e) => setFilters({ ...filters, teamSize: e.target.value })}
                  placeholder="e.g. 5"
                  className="mt-1 w-full border border-line rounded-md px-3 py-2 outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-ink/50">Max budget (₹/day)</label>
                <input
                  type="number"
                  min={0}
                  value={filters.maxBudget}
                  onChange={(e) => setFilters({ ...filters, maxBudget: e.target.value })}
                  placeholder="e.g. 1500"
                  className="mt-1 w-full border border-line rounded-md px-3 py-2 outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-ink/50">Workspace type</label>
                <select
                  value={filters.workspaceType}
                  onChange={(e) => setFilters({ ...filters, workspaceType: e.target.value })}
                  className="mt-1 w-full border border-line rounded-md px-3 py-2 outline-none focus:border-brand bg-white"
                >
                  <option value="">Any type</option>
                  <option value="shared_desk">Shared desk</option>
                  <option value="private_cabin">Private cabin</option>
                  <option value="meeting_room">Meeting room</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-ink/50">Amenities</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {AMENITY_OPTIONS.map((a) => (
                    <button
                      key={a.value}
                      type="button"
                      onClick={() => toggleAmenity(a.value)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                        filters.amenities.includes(a.value)
                          ? 'bg-brand text-paper border-brand'
                          : 'border-line text-ink/60'
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-display font-semibold text-xl">
            {loading ? 'Searching...' : `${pagination.total} space${pagination.total === 1 ? '' : 's'} found`}
          </h2>
        </div>

        {!loading && results.length === 0 && (
          <div className="text-center py-16 text-ink/50 border border-dashed border-line rounded-xl">
            No spaces match your filters yet. Try widening your budget or team size.
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((ws) => (
            <WorkspaceCard key={ws._id} workspace={ws} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
