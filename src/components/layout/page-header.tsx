import React from 'react';
import { CaretRight } from '@phosphor-icons/react';
import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({
  breadcrumbs,
  title,
  subtitle,
  badge,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <React.Fragment key={index}>
                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="hover:text-slate-900 transition-colors uppercase tracking-wider text-[11px] font-medium"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className={`uppercase tracking-wider text-[11px] font-medium ${
                        isLast ? 'text-slate-800 font-semibold' : ''
                      }`}
                    >
                      {item.label}
                    </span>
                  )}
                  {!isLast && <CaretRight className="w-3 h-3 text-slate-400" />}
                </React.Fragment>
              );
            })}
          </nav>
        )}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          {badge && <div>{badge}</div>}
        </div>
      </div>

      {actions && <div className="flex items-center gap-3 flex-wrap">{actions}</div>}
    </div>
  );
}
