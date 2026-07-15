import React from 'react';

const STYLES = {
  available: 'bg-leaf-light text-leaf',
  limited: 'bg-amber-light text-amber',
  full: 'bg-coral-light text-coral',
  pending: 'bg-amber-light text-amber',
  confirmed: 'bg-leaf-light text-leaf',
  rejected: 'bg-coral-light text-coral',
  cancelled: 'bg-coral-light text-coral',
  completed: 'bg-brand-light text-brand-dark',
  open: 'bg-amber-light text-amber',
  responded: 'bg-leaf-light text-leaf',
  closed: 'bg-line text-ink/60',
};

const LABELS = {
  available: 'Available',
  limited: 'Limited slots',
  full: 'Fully booked',
  pending: 'Pending',
  confirmed: 'Confirmed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  completed: 'Completed',
  open: 'Awaiting response',
  responded: 'Responded',
  closed: 'Closed',
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-data ${
      STYLES[status] || 'bg-line text-ink/60'
    }`}
  >
    <span className="w-1.5 h-1.5 rounded-full bg-current" />
    {LABELS[status] || status}
  </span>
);

export default StatusBadge;
