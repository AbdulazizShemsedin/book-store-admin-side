'use client';

import React, { useEffect } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { PageHeader } from '@/components/layout/page-header';
import { BookForm } from '@/features/books/components/book-form';

export default function NewBookPage() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#book-form') {
      const el = document.getElementById('book-form');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.add('ring-4', 'ring-emerald-500/50', 'rounded-2xl', 'p-2');
        setTimeout(() => {
          el.classList.remove('ring-4', 'ring-emerald-500/50', 'rounded-2xl', 'p-2');
        }, 2500);
      }
    }
  }, []);
  return (
    <AdminShell>
      <PageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/dashboard' },
          { label: 'Books', href: '/books' },
          { label: 'Add Book' },
        ]}
        title="Register New Book"
        subtitle="Publish a new literary title with EPUB assets, master language bindings, and optional audio master."
      />

      <BookForm />
    </AdminShell>
  );
}
