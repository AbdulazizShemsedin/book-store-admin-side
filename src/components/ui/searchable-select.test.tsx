import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SearchableSelect } from './searchable-select';

describe('SearchableSelect Component', () => {
  const mockOptions = [
    { label: 'Ibn Kathir', value: 'author-1', sublabel: 'Damascene' },
    { label: 'Imam Bukhari', value: 'author-2', sublabel: 'Bukhara' },
    { label: 'Imam Muslim', value: 'author-3', sublabel: 'Nishapur' },
  ];

  it('renders with placeholder and triggers quick add on header click', () => {
    const handleQuickAdd = vi.fn();
    render(
      <SearchableSelect
        label="Author"
        options={mockOptions}
        onChange={vi.fn()}
        onQuickAddClick={handleQuickAdd}
        quickAddLabel="+ New Author"
        placeholder="Select author..."
      />
    );

    expect(screen.getByText('Author')).toBeDefined();
    expect(screen.getByText('Select author...')).toBeDefined();

    const quickAddBtn = screen.getByTitle('+ New Author');
    fireEvent.click(quickAddBtn);
    expect(handleQuickAdd).toHaveBeenCalledTimes(1);
  });

  it('opens dropdown and allows selecting an option', () => {
    const handleChange = vi.fn();
    render(
      <SearchableSelect
        label="Author"
        options={mockOptions}
        value=""
        onChange={handleChange}
        placeholder="Select author..."
      />
    );

    const triggerBtn = screen.getByRole('button', { name: /select author\.\.\./i });
    fireEvent.click(triggerBtn);

    const option = screen.getByText('Imam Bukhari');
    expect(option).toBeDefined();

    fireEvent.click(option);
    expect(handleChange).toHaveBeenCalledWith('author-2');
  });

  it('filters options and displays inline create action when search does not match', () => {
    const handleCreateNew = vi.fn();
    render(
      <SearchableSelect
        label="Author"
        options={mockOptions}
        value=""
        onChange={vi.fn()}
        onCreateNew={handleCreateNew}
        createNewText="Register author"
        placeholder="Select author..."
      />
    );

    const triggerBtn = screen.getByRole('button', { name: /select author\.\.\./i });
    fireEvent.click(triggerBtn);

    const searchInput = screen.getByPlaceholderText('Type to search or filter...');
    fireEvent.change(searchInput, { target: { value: 'New Scholarly Author' } });

    expect(screen.queryByText('Imam Bukhari')).toBeNull();

    const createBtn = screen.getByText(/Register author/i);
    expect(createBtn).toBeDefined();

    fireEvent.click(createBtn);
    expect(handleCreateNew).toHaveBeenCalledWith('New Scholarly Author');
  });
});
