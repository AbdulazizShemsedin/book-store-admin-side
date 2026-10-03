import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';
import { CircleNotch } from '@phosphor-icons/react';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-lg text-sm select-none',
  {
    variants: {
      variant: {
        primary: 'bg-[#1e4634] text-white hover:bg-[#153426] shadow-sm active:bg-[#0f271c]',
        secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm',
        outline: 'border border-emerald-800 text-emerald-900 hover:bg-emerald-50',
        destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
        ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        link: 'text-[#1e4634] underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 px-6 text-base',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <CircleNotch className="w-4 h-4 mr-2 animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2 inline-flex items-center">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2 inline-flex items-center">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
