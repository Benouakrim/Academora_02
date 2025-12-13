import React, { useState } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { Table, Plus, Trash2, GripVertical } from 'lucide-react';
import ComparisonDisplay from '@/components/smart-blocks/ComparisonDisplay';
import type { ComparisonAttributes, ComparisonColumn } from '../types/BlockTypes';

interface ComparisonViewProps {
  node: {
    attrs: ComparisonAttributes;
  };
  updateAttributes: (attrs: Partial<ComparisonAttributes>) => void;
  deleteNode: () => void;
  selected: boolean;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({
  node,
  updateAttributes,
  deleteNode,
  selected,
}) => {
  const { title, columns } = node.attrs;
  const [editingCell, setEditingCell] = useState<{
    colId: string;
    cellIndex: number;
  } | null>(null);
  const [editingHeader, setEditingHeader] = useState<string | null>(null);

  const maxRows = Math.max(...columns.map((col) => col.cells.length), 1);

  const handleTitleChange = (newTitle: string) => {
    updateAttributes({ title: newTitle });
  };

  const handleHeaderChange = (colId: string, newHeader: string) => {
    const updatedColumns = columns.map((col) =>
      col.id === colId ? { ...col, header: newHeader } : col
    );
    updateAttributes({ columns: updatedColumns });
  };

  const handleCellChange = (colId: string, cellIndex: number, newValue: string) => {
    const updatedColumns = columns.map((col) => {
      if (col.id === colId) {
        const newCells = [...col.cells];
        newCells[cellIndex] = newValue;
        return { ...col, cells: newCells };
      }
      return col;
    });
    updateAttributes({ columns: updatedColumns });
  };

  const addColumn = () => {
    const newColumn: ComparisonColumn = {
      id: Date.now().toString(),
      header: 'New Column',
      cells: Array(maxRows).fill(''),
    };
    updateAttributes({ columns: [...columns, newColumn] });
  };

  const removeColumn = (colId: string) => {
    if (columns.length <= 2) {
      alert('Comparison table must have at least 2 columns');
      return;
    }
    const updatedColumns = columns.filter((col) => col.id !== colId);
    updateAttributes({ columns: updatedColumns });
  };

  const addRow = () => {
    const updatedColumns = columns.map((col) => ({
      ...col,
      cells: [...col.cells, ''],
    }));
    updateAttributes({ columns: updatedColumns });
  };

  const removeRow = (rowIndex: number) => {
    if (maxRows <= 1) {
      alert('Comparison table must have at least 1 row');
      return;
    }
    const updatedColumns = columns.map((col) => ({
      ...col,
      cells: col.cells.filter((_, index) => index !== rowIndex),
    }));
    updateAttributes({ columns: updatedColumns });
  };

  return (
    <NodeViewWrapper
      className={`comparison-node-view ${selected ? 'selected' : ''}`}
      data-drag-handle
    >
      <div className="relative group border-2 border-gray-200 rounded-lg bg-white hover:border-orange-300 transition-colors">
        {/* Editor Controls */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab z-10">
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={deleteNode}
            className="p-1 hover:bg-red-100 rounded text-red-600"
            title="Delete block"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4">
          {/* Editable Title */}
          <div className="flex items-center gap-2 mb-4">
            <Table className="w-6 h-6 text-orange-600" />
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="flex-1 text-xl font-bold border-b-2 border-transparent hover:border-gray-300 focus:border-orange-500 focus:outline-none px-2 py-1"
              placeholder="Comparison title..."
            />
          </div>

          {/* Shared ComparisonDisplay Component */}
          <ComparisonDisplay
            title=""
            columns={columns ?? []}
            className="mb-4"
          />

          {/* Column/Row Management Controls (shown on hover) */}
          <div className="relative group/controls">
            <div className="opacity-0 group-hover/controls:opacity-100 transition-opacity">
              <div className="space-y-2 p-2 bg-gray-50 rounded border border-gray-200">
                <div className="text-xs font-semibold text-gray-700 mb-2">Columns:</div>
                {(columns ?? []).map((col) => (
                  <div
                    key={col.id}
                    className="flex items-center justify-between gap-2 p-1 bg-white rounded"
                  >
                    <span className="text-sm text-gray-700">{col.header}</span>
                    <button
                      onClick={() => removeColumn(col.id)}
                      className="p-1 hover:bg-red-100 rounded text-red-600"
                      title="Remove column"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                <div className="text-xs font-semibold text-gray-700 mt-3 mb-2">Rows: {maxRows}</div>
                <button
                  onClick={() => removeRow(maxRows - 1)}
                  disabled={maxRows <= 1}
                  className="w-full p-1 text-xs text-red-600 hover:bg-red-100 rounded disabled:opacity-30"
                  title="Remove last row"
                >
                  Remove Last Row
                </button>
              </div>
            </div>
          </div>

          {/* Add Controls */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={addColumn}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-3 py-2 rounded transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add column</span>
            </button>
            <button
              onClick={addRow}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-3 py-2 rounded transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add row</span>
            </button>
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export default ComparisonView;
