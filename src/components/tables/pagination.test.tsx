import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Pagination } from './pagination';

describe('Pagination Component', () => {
  it('displays accurate range and page calculations', () => {
    render(
      <Pagination
        currentPage={2}
        pageSize={10}
        totalItems={45}
        onPageChange={() => {}}
      />
    );

    // Showing 11 to 20 of 45 records
    expect(screen.getByText('11')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText(/Page 2 of 5/i)).toBeInTheDocument();
  });

  it('triggers onPageChange when navigation buttons are clicked', () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination
        currentPage={2}
        pageSize={10}
        totalItems={50}
        onPageChange={handlePageChange}
      />
    );

    const prevButton = screen.getByLabelText(/previous page/i);
    const nextButton = screen.getByLabelText(/next page/i);

    fireEvent.click(prevButton);
    expect(handlePageChange).toHaveBeenCalledWith(1);

    fireEvent.click(nextButton);
    expect(handlePageChange).toHaveBeenCalledWith(3);
  });
});
