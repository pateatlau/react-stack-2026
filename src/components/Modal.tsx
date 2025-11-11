import React from 'react';

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
};

export default function Modal({ open, onOpenChange, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />

      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 p-6">
        {title && <div className="text-lg font-semibold mb-4">{title}</div>}
        <div>{children}</div>
        <div className="mt-6 text-right">
          <button
            className="px-4 py-2 bg-slate-200 rounded hover:bg-slate-300"
            onClick={() => onOpenChange(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
