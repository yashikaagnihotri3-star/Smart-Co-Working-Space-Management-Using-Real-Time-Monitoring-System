import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Ruler, Wifi, Car, ShieldCheck, Coffee, DoorOpen, Zap } from 'lucide-react';
import StatusBadge from './StatusBadge';

const AMENITY_ICON = {
  wifi: Wifi,
  meeting_rooms: DoorOpen,
  parking: Car,
  power_backup: Zap,
  cafeteria: Coffee,
  security: ShieldCheck,
};

const TYPE_LABEL = {
  private_cabin: 'Private cabin',
  shared_desk: 'Shared desk',
  meeting_room: 'Meeting room',
};

const WorkspaceCard = ({ workspace }) => {
  const { _id, name, location, areaSize, seatingCapacity, workspaceType, pricing, amenities, availability, matchScore } = workspace;

  return (
    <Link
      to={`/workspaces/${_id}`}
      className="group block bg-white border border-line rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="h-28 bg-grid-pattern bg-grid bg-brand-light relative flex items-end p-4">
        <span className="absolute top-3 right-3">
          <StatusBadge status={availability?.status || 'available'} />
        </span>
        <span className="text-xs font-data uppercase tracking-wide text-brand-dark bg-white/80 px-2 py-1 rounded">
          {TYPE_LABEL[workspaceType] || workspaceType}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-semibold text-lg leading-snug group-hover:text-brand transition-colors">
            {name}
          </h3>
          {typeof matchScore === 'number' && (
            <span className="shrink-0 font-data text-xs font-semibold px-2 py-1 rounded-full bg-brand text-paper">
              {matchScore}% match
            </span>
          )}
        </div>

        <p className="mt-1 flex items-center gap-1 text-sm text-ink/60">
          <MapPin size={14} /> {location?.city}
        </p>

        <div className="mt-3 flex items-center gap-4 text-sm text-ink/70 font-data">
          <span className="flex items-center gap-1">
            <Users size={14} /> {seatingCapacity}
          </span>
          <span className="flex items-center gap-1">
            <Ruler size={14} /> {areaSize} sqft
          </span>
        </div>

        {amenities?.length > 0 && (
          <div className="mt-3 flex items-center gap-2 text-ink/50">
            {amenities.slice(0, 5).map((a) => {
              const Icon = AMENITY_ICON[a];
              return Icon ? <Icon key={a} size={16} /> : null;
            })}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-line flex items-baseline justify-between">
          <div>
            <span className="font-display font-bold text-xl">₹{pricing?.amount}</span>
            <span className="text-sm text-ink/50"> /{pricing?.unit}</span>
          </div>
          <span className="text-sm font-semibold text-brand group-hover:underline">
            View details →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default WorkspaceCard;
