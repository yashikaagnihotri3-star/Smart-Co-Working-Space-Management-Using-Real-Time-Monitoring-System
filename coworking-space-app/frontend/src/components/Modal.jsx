import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4" onClick={onClose}>
    <div
      className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-lg">{title}</h2>
        <button onClick={onClose} className="text-ink/40 hover:text-ink">
          <X size={20} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

export default Modal;
