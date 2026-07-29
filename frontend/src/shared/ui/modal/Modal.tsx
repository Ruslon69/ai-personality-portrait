import { useEffect, useRef } from 'react';

import type { ModalProps } from './Modal.types';
import styles from './Modal.module.css';

export function Modal({ className, label, onClose, open, ...props }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const classes = [styles.root, className].filter(Boolean).join(' ');

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      aria-label={label}
      className={classes}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={() => {
        if (open) {
          onClose();
        }
      }}
      ref={dialogRef}
      {...props}
    />
  );
}
