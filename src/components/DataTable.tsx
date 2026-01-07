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
                <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 bg-gray-50">
                    <div className="text-sm text-gray-600 font-medium">
                        Showing <strong className="text-gray-900">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</strong> to{' '}
                        <strong className="text-gray-900">
                            {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getRowModel().rows.length)}
                        </strong>{' '}
                        of <strong className="text-gray-900">{data.length}</strong> entries
                    </div>

                    <div className="flex items-center gap-3">
                        {/* First Page Button */}
                        <button
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all shadow-sm hover:shadow"
                            title="First Page"
                        >
                            «
                        </button>

                        {/* Previous Button */}
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all shadow-sm hover:shadow"
                        >
                            Previous
                        </button>

                        {/* Page Indicator */}
                        <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg">
                            <span className="text-sm font-bold text-primary">
                                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                            </span>
                        </div>

                        {/* Next Button */}
                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all shadow-sm hover:shadow"
                        >
                            Next
                        </button>

                        {/* Last Page Button */}
                        <button
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all shadow-sm hover:shadow"
                            title="Last Page"
                        >
                            »
                        </button>

                        {/* Page Size Selector */}
                        <select
                            value={table.getState().pagination.pageSize}
                            onChange={(e) => table.setPageSize(Number(e.target.value))}
                            className="ml-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer transition-all shadow-sm"
                        >
                            {[10, 25, 50, 100].map((size) => (
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
