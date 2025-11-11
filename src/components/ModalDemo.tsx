import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';

export default function ModalDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>

      <Modal open={open} onOpenChange={setOpen} title="Example dialog">
        <p className="text-sm text-slate-600">
          This is a simple shadcn-style modal demo without Radix.
        </p>
      </Modal>
    </div>
  );
}
