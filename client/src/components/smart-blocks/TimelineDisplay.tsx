// client/src/components/smart-blocks/TimelineDisplay.tsx
import { GitBranch, Calendar } from 'lucide-react';

interface TimelineStepData {
  id: string;
  title: string;
  description: string;
  date?: string; // Optional date for display
  completed?: boolean;
}

interface TimelineDisplayProps {
  title?: string;
  description?: string;
  steps: TimelineStepData[];
}

export default function TimelineDisplay({ title, description, steps }: TimelineDisplayProps) {
  return (
    <div className="space-y-4">
      {title && (
        <h3 className="flex items-center gap-2 text-xl font-bold">
          <GitBranch className="h-6 w-6 text-green-600" />
          {title}
        </h3>
      )}
      {description && <p className="text-gray-600">{description}</p>}

      <div className="relative border-l border-gray-200 ml-4 pl-6">
        {steps.map((step) => (
          <div key={step.id} className="mb-8 flex items-start last:mb-0">
            {/* Dot indicator */}
            <div
              className={`absolute w-3 h-3 rounded-full -left-1.5 ring-8 ring-white ${
                step.completed ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
            {/* Content */}
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900">{step.title}</h4>
              {step.date && (
                <p className="flex items-center text-xs font-medium text-gray-500 mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  {step.date}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-700">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
