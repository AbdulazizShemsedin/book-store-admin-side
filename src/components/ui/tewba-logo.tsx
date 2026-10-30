'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

interface TewbaLogoProps {
  variant?: 'full' | 'mark';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  priority?: boolean;
}

const SIZE_CONFIGS = {
  full: {
    xs: { width: 80, height: 55, className: 'h-7 w-auto' },
    sm: { width: 110, height: 75, className: 'h-9 w-auto' },
    md: { width: 140, height: 96, className: 'h-12 w-auto' },
    lg: { width: 180, height: 124, className: 'h-16 w-auto' },
    xl: { width: 220, height: 151, className: 'h-20 w-auto' },
  },
  mark: {
    xs: { width: 24, height: 24, className: 'w-6 h-6' },
    sm: { width: 32, height: 32, className: 'w-8 h-8' },
    md: { width: 44, height: 44, className: 'w-11 h-11' },
    lg: { width: 56, height: 56, className: 'w-14 h-14' },
    xl: { width: 72, height: 72, className: 'w-18 h-18' },
  },
};

export function TewbaLogo({
  variant = 'full',
  size = 'md',
  className,
  priority = false,
}: TewbaLogoProps) {
  const config = SIZE_CONFIGS[variant][size];

  if (variant === 'mark') {
    return (
      <div className={cn('relative inline-flex items-center justify-center flex-shrink-0', config.className, className)}>
        {/* Light Mode Mark */}
        <Image
          src="/images/tewba-mark.png"
          alt="TEWBA"
          width={config.width}
          height={config.height}
          priority={priority}
          className="dark:hidden object-contain w-full h-full"
          unoptimized
        />
        {/* Dark Mode Mark */}
        <Image
          src="/images/tewba-mark-dark.png"
          alt="TEWBA"
          width={config.width}
          height={config.height}
          priority={priority}
          className="hidden dark:block object-contain w-full h-full"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className={cn('relative inline-flex items-center justify-center flex-shrink-0', config.className, className)}>
      {/* Light Mode Full Logo */}
      <Image
        src="/images/tewba-logo.png"
        alt="TEWBA Bookstore"
        width={config.width}
        height={config.height}
        priority={priority}
        className="dark:hidden object-contain w-auto max-h-full"
        unoptimized
      />
      {/* Dark Mode Full Logo */}
      <Image
        src="/images/tewba-logo-dark.png"
        alt="TEWBA Bookstore"
        width={config.width}
        height={config.height}
        priority={priority}
        className="hidden dark:block object-contain w-auto max-h-full"
        unoptimized
      />
    </div>
  );
}
