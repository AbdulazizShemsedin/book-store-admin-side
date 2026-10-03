'use client';

import React from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { PageHeader } from '@/components/layout/page-header';
import { BookForm } from '@/features/books/components/book-form';

export default function NewBookPage() {
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
