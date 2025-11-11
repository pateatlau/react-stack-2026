import React from 'react';
import clsx from 'clsx';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export default function Button({ children, className, ...props }: Props) {
  return (
    <button
      {...props}
      className={clsx(
        'px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 disabled:opacity-50',
        className
      )}
    >
      {children}
    </button>
  );
}
