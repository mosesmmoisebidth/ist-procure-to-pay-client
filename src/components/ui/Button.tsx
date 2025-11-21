import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-500 focus-visible:ring-blue-200 active:bg-blue-700',
  secondary:
    'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:text-slate-900 focus-visible:ring-slate-200 active:bg-slate-50',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-200 active:bg-slate-200',
  danger:
    'bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-200 active:bg-rose-700',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-3 text-sm',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth, className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(
        'rounded-full font-semibold shadow-sm transition duration-200 ease-out focus-visible:outline-none focus-visible:ring disabled:cursor-not-allowed disabled:opacity-60 active:scale-95',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);

Button.displayName = 'Button';
