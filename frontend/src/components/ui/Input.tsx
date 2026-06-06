import React, { forwardRef } from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, fullWidth = true, className = '', ...props }, ref) => {
    const widthClass = fullWidth ? 'input-full' : '';
    const errorClass = error ? 'input-error' : '';

    return (
      <div className={`input-wrapper ${widthClass} ${className}`.trim()}>
        {label && <label className="input-label">{label}</label>}
        <input
          ref={ref}
          className={`input-field ${errorClass}`}
          {...props}
        />
        {error && <span className="input-message error">{error}</span>}
        {helperText && !error && <span className="input-message">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
