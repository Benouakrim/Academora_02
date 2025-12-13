import React, { useState } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { Calendar, Plus, Trash2, GripVertical, ArrowUpDown } from 'lucide-react';
import TimelineDisplay from '@/components/smart-blocks/TimelineDisplay';
import type { TimelineAttributes, TimelineStep } from '../types/BlockTypes';

interface TimelineViewProps {
  node: {
    attrs: TimelineAttributes;
  };
  updateAttributes: (attrs: Partial<TimelineAttributes>) => void;
  deleteNode: () => void;
  selected: boolean;
}

const TimelineView: React.FC<TimelineViewProps> = ({
  node,
  updateAttributes,
  deleteNode,
  selected,
}) => {
  const { title, steps, orientation } = node.attrs;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editField, setEditField] = useState<'title' | 'description' | 'date' | null>(null);

  const handleTitleChange = (newTitle: string) => {
    updateAttributes({ title: newTitle });
  };

  const handleStepChange = (
    id: string,
    field: keyof TimelineStep,
    value: string
  ) => {
    const updatedSteps = steps.map((step) =>
      step.id === id ? { ...step, [field]: value } : step
    );
    updateAttributes({ steps: updatedSteps });
  };

  const addStep = () => {
    const newStep: TimelineStep = {
      id: Date.now().toString(),
      title: 'New Step',
      description: 'Add description',
      date: new Date().getFullYear().toString(),
    };
    updateAttributes({ steps: [...steps, newStep] });
    setEditingId(newStep.id);
    setEditField('title');
  };

  const removeStep = (id: string) => {
    const updatedSteps = steps.filter((step) => step.id !== id);
    updateAttributes({ steps: updatedSteps });
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;

    const updatedSteps = [...steps];
    [updatedSteps[index], updatedSteps[newIndex]] = [
      updatedSteps[newIndex],
      updatedSteps[index],
    ];
    updateAttributes({ steps: updatedSteps });
  };

  const toggleOrientation = () => {
    updateAttributes({
      orientation: orientation === 'vertical' ? 'horizontal' : 'vertical',
    });
  };

  return (
    <NodeViewWrapper
      className={`timeline-node-view ${selected ? 'selected' : ''}`}
      data-drag-handle
    >
      <div className="relative group border-2 border-gray-200 rounded-lg bg-white hover:border-indigo-300 transition-colors">
        {/* Editor Controls */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab z-10">
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
          <button
            onClick={toggleOrientation}
            className="p-1 hover:bg-indigo-100 rounded text-indigo-600"
            title={`Switch to ${orientation === 'vertical' ? 'horizontal' : 'vertical'}`}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
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
            <Calendar className="w-6 h-6 text-indigo-600" />
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="flex-1 text-xl font-bold border-b-2 border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none px-2 py-1"
              placeholder="Timeline title..."
            />
          </div>

          {/* Shared TimelineDisplay Component */}
          <TimelineDisplay
            title=""
            steps={(steps ?? []).map((step) => ({
              id: step.id,
              title: step.title,
              description: step.description,
              date: step.date,
              completed: false,
            }))}
          />

          {/* Step Editor Controls (shown on hover) */}
          <div className="relative group/steps mt-4">
            <div className="opacity-0 group-hover/steps:opacity-100 transition-opacity">
              <div className="space-y-2">
                {(steps ?? []).map((step, index) => (
                  <div
                    key={step.id}
                    className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded hover:bg-indigo-50"
                  >
                    <span className="text-sm text-gray-700 font-medium">{step.title}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveStep(index, 'up')}
                        disabled={index === 0}
                        className="p-1 hover:bg-indigo-100 rounded text-indigo-600 disabled:opacity-30 text-xs"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveStep(index, 'down')}
                        disabled={index === (steps ?? []).length - 1}
                        className="p-1 hover:bg-indigo-100 rounded text-indigo-600 disabled:opacity-30 text-xs"
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => removeStep(step.id)}
                        className="p-1 hover:bg-red-100 rounded text-red-600"
                        title="Remove step"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Add Step Button */}
          <button
            onClick={addStep}
            className="mt-4 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-2 rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add step</span>
          </button>

          {/* Options */}
          <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-600">
            Orientation: <span className="font-medium">{orientation}</span>
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export default TimelineView;
