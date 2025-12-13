// client/src/components/smart-blocks/ChecklistDisplay.tsx
import { Checkbox } from '@/components/ui/checkbox';
import { List } from 'lucide-react';

interface ChecklistDisplayProps {
  title?: string;
  description?: string;
  items: Array<{ id: string; text: string; completed: boolean }>;
  isInteractive?: boolean; // For future user completion/Tiptap editing
  onItemToggle?: (id: string, completed: boolean) => void;
  className?: string;
}

export default function ChecklistDisplay({
  title,
  description,
  items,
  isInteractive = false,
  onItemToggle,
  className = '',
}: ChecklistDisplayProps) {
  return (
    <div className={`space-y-3 p-4 border rounded-lg bg-white ${className}`}>
      {title && (
        <h4 className="flex items-center gap-2 text-lg font-semibold">
          <List className="h-5 w-5 text-blue-600" />
          {title}
        </h4>
      )}
      {description && <p className="text-sm text-gray-600">{description}</p>}
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-start space-x-3">
            <Checkbox
              id={`checklist-item-${item.id}`}
              checked={item.completed}
              onCheckedChange={(checked) => {
                if (isInteractive && onItemToggle) {
                  onItemToggle(item.id, checked as boolean);
                }
              }}
              disabled={!isInteractive}
              className="mt-1 flex-shrink-0"
            />
            <label
              htmlFor={`checklist-item-${item.id}`}
              className={`text-sm font-medium leading-none peer-disabled:cursor-default ${
                item.completed ? 'line-through text-gray-500' : 'text-gray-900'
              }`}
            >
              {item.text}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
