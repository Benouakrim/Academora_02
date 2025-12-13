// client/src/components/smart-blocks/ComparisonDisplay.tsx
import { Table as TableIcon } from 'lucide-react';

interface ComparisonColumn {
  id: string;
  header: string;
  cells: string[];
}

interface ComparisonDisplayProps {
  title?: string;
  description?: string;
  columns: ComparisonColumn[];
  rowHeaders?: string[];
  className?: string;
}

export default function ComparisonDisplay({
  title,
  description,
  columns,
  rowHeaders = [],
  className = '',
}: ComparisonDisplayProps) {
  if (!columns || columns.length === 0) {
    return (
      <div className={`p-4 border rounded-lg bg-white ${className}`}>
        <p className="text-gray-500">No comparison data available</p>
      </div>
    );
  }

  // Calculate max rows from all columns
  const maxRows = Math.max(...(columns ?? []).map((col) => col.cells?.length ?? 0), 0);

  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h3 className="flex items-center gap-2 text-xl font-bold">
          <TableIcon className="h-6 w-6 text-orange-600" />
          {title}
        </h3>
      )}
      {description && <p className="text-gray-600">{description}</p>}

      {/* Table Container */}
      <div className="overflow-x-auto border rounded-lg bg-white">
        <table className="w-full border-collapse">
          {/* Header Row */}
          <thead>
            <tr className="bg-orange-50 border-b-2 border-orange-200">
              {/* Row header column (if needed) */}
              {rowHeaders && rowHeaders.length > 0 && (
                <th className="border-r-2 border-orange-200 p-3 text-left font-semibold text-gray-900 bg-gray-50">
                  &nbsp;
                </th>
              )}
              {/* Column headers */}
              {(columns ?? []).map((col) => (
                <th
                  key={col.id}
                  className="border-r border-orange-200 p-3 text-left font-semibold text-gray-900"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body Rows */}
          <tbody>
            {Array.from({ length: maxRows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-200 hover:bg-gray-50">
                {/* Row header cell (if provided) */}
                {rowHeaders && rowHeaders.length > 0 && (
                  <td className="border-r-2 border-orange-200 p-3 font-semibold text-gray-900 bg-gray-50">
                    {rowHeaders[rowIndex] || `Row ${rowIndex + 1}`}
                  </td>
                )}
                {/* Data cells */}
                {(columns ?? []).map((col) => (
                  <td
                    key={`${col.id}-${rowIndex}`}
                    className="border-r border-gray-200 p-3 text-gray-700"
                  >
                    {col.cells?.[rowIndex] || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
