import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label className="text-[10px] font-bold text-brand-muted uppercase block">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full bg-brand-surface border rounded-xl py-2.5 px-4 text-xs text-brand-text outline-none focus:border-brand-primary transition-all-custom font-bold ${
          error ? 'border-rose-400' : 'border-brand-border'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-[10px] text-rose-600 font-bold">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';

export default Input;
