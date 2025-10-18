

import React, { ReactNode } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95';
  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary to-secondary text-background font-bold focus:ring-primary hover:shadow-[0_0_20px_theme(colors.primary)] shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.25)]',
    secondary: 'bg-white/10 hover:bg-white/20 focus:ring-white/50 text-copy shadow-[inset_0_1px_2px_0_rgba(255,255,255,0.15)]',
    danger: 'bg-danger/80 hover:bg-danger focus:ring-danger text-white hover:shadow-[0_0_15px_theme(colors.danger)] shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.25)]',
  };
  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-copy-light">{label}</label>
      <input id={id} className="mt-1 block w-full bg-surface/50 border border-white/20 rounded-lg py-2 px-3 text-copy focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm placeholder-gray-500 focus:shadow-[0_0_10px_theme(colors.primary)]" {...props} />
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, id, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-copy-light">{label}</label>
      <textarea id={id} className="mt-1 block w-full bg-surface/50 border border-white/20 rounded-lg py-2 px-3 text-copy focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm placeholder-gray-500 focus:shadow-[0_0_10px_theme(colors.primary)]" {...props} />
    </div>
  );
};


interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`glassmorphism rounded-xl overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
      <div className="glassmorphism rounded-xl w-full max-w-lg animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-xl font-semibold neon-text-primary">{title}</h3>
          <button onClick={onClose} className="text-copy-lighter hover:text-copy text-2xl leading-none">&times;</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

export const Spinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
);