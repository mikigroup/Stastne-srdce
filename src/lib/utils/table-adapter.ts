import { type Table, type RowData } from '@tanstack/table-core';
import { writable, type Writable } from 'svelte/store';

export function createTableStore<TData extends RowData>(
  table: Table<TData>
): Writable<Table<TData>> {
  const { subscribe, set, update } = writable(table);

  return {
    subscribe,
    set,
    update,
    getState: () => table.getState(),
    getAllColumns: () => table.getAllColumns(),
    getHeaderGroups: () => table.getHeaderGroups(),
    getRowModel: () => table.getRowModel(),
    getFlatHeaders: () => table.getFlatHeaders(),
    getColumn: (columnId: string) => table.getColumn(columnId),
    getPreFilteredRowModel: () => table.getPreFilteredRowModel(),
    getFilteredRowModel: () => table.getFilteredRowModel(),
    getPaginationRowModel: () => table.getPaginationRowModel()
  };
} 