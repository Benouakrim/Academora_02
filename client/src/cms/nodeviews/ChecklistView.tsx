import React, { useState } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { CheckSquare, Plus, Trash2, GripVertical } from 'lucide-react';
import ChecklistDisplay from '@/components/smart-blocks/ChecklistDisplay';
import type { ChecklistAttributes, ChecklistItem } from '../types/BlockTypes';

interface ChecklistViewProps {
  node: {
    attrs: ChecklistAttributes;
  };
  updateAttributes: (attrs: Partial<ChecklistAttributes>) => void;
  deleteNode: () => void;
  selected: boolean;
}

const ChecklistView: React.FC<ChecklistViewProps> = ({
  node,
  updateAttributes,
  deleteNode,
  selected,
}) => {
  const { title, items, allowUserEdit } = node.attrs;
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleTitleChange = (newTitle: string) => {
    updateAttributes({ title: newTitle });
  };

  const handleItemTextChange = (id: string, newText: string) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, text: newText } : item
    );
    updateAttributes({ items: updatedItems });
  };

  const handleItemCheckedChange = (id: string, checked: boolean) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, checked } : item
    );
    updateAttributes({ items: updatedItems });
  };

  const addItem = () => {
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: 'New item',
      checked: false,
    };
    updateAttributes({ items: [...items, newItem] });
    setEditingId(newItem.id);
  };

  const removeItem = (id: string) => {
    const updatedItems = items.filter((item) => item.id !== id);
    updateAttributes({ items: updatedItems });
  };

  return (
    <NodeViewWrapper
      className={`checklist-node-view ${selected ? 'selected' : ''}`}
      data-drag-handle
    >
      <div className="relative group border-2 border-gray-200 rounded-lg bg-white hover:border-blue-300 transition-colors">
        {/* Editor Controls Overlay */}
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

        {/* Editable Title with Shared Display */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare className="w-6 h-6 text-blue-600" />
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="flex-1 text-xl font-bold border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1"
              placeholder="Checklist title..."
            />
          </div>

          {/* Render the shared ChecklistDisplay component with editor wrapper */}
          <div className="relative group/display">
            <ChecklistDisplay
              title=""
              items={(items ?? []).map((item) => ({
                id: item.id,
                text: item.text,
                completed: item.checked || false,
              }))}
              isInteractive={true}
              onItemToggle={handleItemCheckedChange}
              className="border-0 p-0"
            />

            {/* Editor controls overlaid on items */}
            <div className="absolute inset-0 opacity-0 group-hover/display:opacity-100 transition-opacity pointer-events-none">
              <div className="space-y-2">
                {(items ?? []).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-end gap-1 p-2 pointer-events-auto"
                  >
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 hover:bg-red-100 rounded text-red-600"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Add item button */}
          <button
            onClick={addItem}
            className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add item</span>
          </button>

          {/* Options */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={allowUserEdit}
                onChange={(e) => updateAttributes({ allowUserEdit: e.target.checked })}
                className="rounded border-gray-300"
              />
              Allow users to check items on public page
            </label>
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export default ChecklistView;
