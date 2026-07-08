import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-gradient-to-br from-brand-primary to-brand-primary-alt text-white hover:shadow-lg hover:shadow-brand-primary/25',
  secondary: 'bg-gradient-to-br from-brand-secondary to-brand-secondary-dark text-white hover:shadow-lg hover:shadow-brand-secondary/25',
  outline: 'border-2 border-brand-primary text-brand-primary hover:bg-brand-primary/5',
  ghost: 'text-brand-text hover:bg-brand-surface',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'py-2 px-3 text-[11px]',
  md: 'py-3 px-4 text-xs',
  lg: 'py-4 px-6 text-sm',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', ...props }, ref) => (
    <button
      ref={ref}
      className={`rounded-lg font-bold shadow-sm transition-all-custom flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    />
  )
);
Button.displayName = 'Button';

export default Button;
