import React from 'react';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className = '',
}: FormFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex justify-between items-center">
        <label
          htmlFor={htmlFor}
          className="block text-xs font-medium uppercase tracking-wider text-text-muted"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {hint && !error && <span className="text-[11px] text-text-muted/80">{hint}</span>}
      </div>
      {children}
      {error && (
        <p role="alert" className="text-xs text-red-500 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
