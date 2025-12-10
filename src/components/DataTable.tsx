import React from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
    ColumnDef,
    HeaderGroup,
    Row,
    Cell,
    InitialTableState,
} from '@tanstack/react-table';

type DataTableProps<T> = {
    columns: ColumnDef<T>[];
    data: T[];
    initialState?: InitialTableState;
    noDataMessage?: string;
};

export default function DataTable<T>({ columns, data, initialState = {}, noDataMessage = 'No records found.' }: DataTableProps<T>): React.ReactElement {
    const table = useReactTable({
        data,
        columns,
        initialState,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        {table.getHeaderGroups().map((headerGroup: HeaderGroup<T>) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id} className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        {header.isPlaceholder ? null : (
                                            <div
                                                {...{
                                                    onClick: header.column.getToggleSortingHandler(),
                                                    className: header.column.getCanSort() ? 'cursor-pointer select-none' : '',
                                                }}
                                            >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.getIsSorted() === 'asc' && ' 🔼'}
                                                {header.column.getIsSorted() === 'desc' && ' 🔽'}
                                            </div>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {table.getRowModel().rows.map((row: Row<T>) => (
                            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                {row.getVisibleCells().map((cell: Cell<T, unknown>) => (
                                    <td key={cell.id} className="px-6 py-4 text-sm text-gray-700">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {table.getRowModel().rows.length === 0 ? (
                <div className="p-10 text-center text-gray-500">{noDataMessage}</div>
            ) : (
                <div className="p-4 flex items-center justify-between border-t border-gray-100">
                    <div className="text-sm text-gray-600">
                        Page <strong>{table.getState().pagination.pageIndex + 1}</strong> of <strong>{table.getPageCount()}</strong>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} className="px-3 py-1 border rounded">«</button>
                        <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="px-3 py-1 border rounded">Prev</button>
                        <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="px-3 py-1 border rounded">Next</button>
                        <button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} className="px-3 py-1 border rounded">»</button>

                        <select
                            value={table.getState().pagination.pageSize}
                            onChange={(e) => table.setPageSize(Number(e.target.value))}
                            className="ml-2 border rounded px-2 py-1 text-sm"
                        >
                            {[10, 25, 50].map((size) => (
                                <option key={size} value={size}>
                                    {size} / page
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
}
